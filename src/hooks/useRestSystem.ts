
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface UseRestSystemProps {
  character: any;
  updateCharacter: (updates: any) => void;
  onHealthRestore?: (amount: number, isLongRest: boolean) => void;
  onSpellSlotsRestore?: () => void;
}

export function useRestSystem({
  character,
  updateCharacter,
  onHealthRestore,
  onSpellSlotsRestore
}: UseRestSystemProps) {
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);
  const [hitDieUsed, setHitDieUsed] = useState(0);
  
  const { toast } = useToast();
  
  // Получение типа кубика хитов для класса персонажа
  const getHitDieType = useCallback(() => {
    const className = character?.class || character?.className || '';
    const hitDice: Record<string, "d4" | "d6" | "d8" | "d10" | "d12"> = {
      "Варвар": "d12",
      "Воин": "d10",
      "Паладин": "d10",
      "Следопыт": "d10",
      "Монах": "d8",
      "Плут": "d8",
      "Бард": "d8",
      "Жрец": "d8",
      "Друид": "d8",
      "Колдун": "d8",
      "Чернокнижник": "d8",
      "Волшебник": "d6",
      "Чародей": "d6"
    };
    
    return hitDice[className] || "d8";
  }, [character?.class, character?.className]);
  
  // Получение числового значения кубика хитов
  const getHitDieValue = useCallback(() => {
    const className = character?.class || character?.className || '';
    const hitDiceValues: Record<string, number> = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Жрец": 8,
      "Друид": 8,
      "Колдун": 8,
      "Чернокнижник": 8,
      "Волшебник": 6,
      "Чародей": 6
    };
    
    return hitDiceValues[className] || 8;
  }, [character?.class, character?.className]);
  
  // Получение максимального количества костей хитов
  const getMaxHitDice = useCallback(() => {
    return character?.level || 1;
  }, [character?.level]);
  
  // Получение текущего количества доступных костей хитов
  const getCurrentHitDice = useCallback(() => {
    return character?.hitDice?.current || getMaxHitDice();
  }, [character?.hitDice?.current, getMaxHitDice]);
  
  // Применение короткого отдыха
  const takeShortRest = useCallback(() => {
    if (!character) return;
    
    setIsShortResting(true);
    
    // Имитируем задержку для анимации
    setTimeout(() => {
      // Восстанавливаем небольшую часть здоровья без использования Hit Die
      const conModifier = character.abilities?.CON 
        ? Math.floor((character.abilities.CON - 10) / 2)
        : 0;
      
      const healingAmount = Math.max(1, conModifier);
      const newCurrentHp = Math.min(
        character.maxHp || 0,
        (character.currentHp || 0) + healingAmount
      );
      
      // Обновляем персонажа
      updateCharacter({
        currentHp: newCurrentHp
      });
      
      // Вызываем колбэк для восстановления здоровья
      if (onHealthRestore) {
        onHealthRestore(healingAmount, false);
      }
      
      // Показываем уведомление
      toast({
        title: "Короткий отдых завершен",
        description: `Восстановлено ${healingAmount} HP`,
      });
      
      setIsShortResting(false);
    }, 1500);
  }, [character, onHealthRestore, toast, updateCharacter]);
  
  // Применение длинного отдыха
  const takeLongRest = useCallback(() => {
    if (!character) return;
    
    setIsLongResting(true);
    
    // Имитируем задержку для анимации
    setTimeout(() => {
      // Полностью восстанавливаем здоровье
      const currentHp = character.currentHp || 0;
      const maxHp = character.maxHp || 0;
      const healingAmount = maxHp - currentHp;
      
      // Восстанавливаем хит-дайсы (до половины от максимума)
      const maxHitDice = getMaxHitDice();
      const currentHitDice = getCurrentHitDice();
      const hitDiceRecovery = Math.min(
        maxHitDice - currentHitDice,
        Math.max(1, Math.floor(maxHitDice / 2))
      );
      
      // Обновляем ячейки заклинаний (если они есть)
      let updatedSpellSlots = { ...character.spellSlots };
      
      if (updatedSpellSlots) {
        for (const level in updatedSpellSlots) {
          if (updatedSpellSlots.hasOwnProperty(level)) {
            updatedSpellSlots[level] = {
              ...updatedSpellSlots[level],
              used: 0
            };
          }
        }
      }
      
      // Восстанавливаем очки чародея или другие специальные ресурсы
      let sorceryPoints = character.sorceryPoints || { current: 0, max: 0 };
      if (character.class?.toLowerCase().includes('чародей') || 
          character.className?.toLowerCase().includes('чародей')) {
        sorceryPoints = {
          current: character.level || 0,
          max: character.level || 0
        };
      }
      
      // Обновляем персонажа
      updateCharacter({
        currentHp: maxHp,
        temporaryHp: 0, // Сбрасываем временное здоровье
        hitDice: {
          current: currentHitDice + hitDiceRecovery,
          max: maxHitDice
        },
        spellSlots: updatedSpellSlots,
        sorceryPoints: sorceryPoints
      });
      
      // Вызываем колбэк для восстановления здоровья
      if (onHealthRestore) {
        onHealthRestore(healingAmount, true);
      }
      
      // Вызываем колбэк для восстановления ячеек заклинаний
      if (onSpellSlotsRestore) {
        onSpellSlotsRestore();
      }
      
      // Показываем уведомление
      toast({
        title: "Длинный отдых завершен",
        description: `Здоровье и ресурсы восстановлены. Восстановлено костей хитов: ${hitDiceRecovery}.`,
      });
      
      setIsLongResting(false);
    }, 2000);
  }, [character, getCurrentHitDice, getMaxHitDice, onHealthRestore, onSpellSlotsRestore, toast, updateCharacter]);
  
  // Использование кубика хитов для восстановления здоровья
  const useHitDie = useCallback((rollResult: number) => {
    if (!character) return;
    
    // Проверяем, есть ли доступные кубики хитов
    const currentHitDice = getCurrentHitDice();
    
    if (currentHitDice <= 0) {
      toast({
        title: "Нет доступных костей хитов",
        description: "Все кости хитов использованы. Отдохните для восстановления.",
        variant: "destructive"
      });
      return;
    }
    
    // Рассчитываем исцеление от броска кубика
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2)
      : 0;
      
    const healingAmount = Math.max(1, rollResult + conModifier);
    
    // Обновляем текущее здоровье персонажа
    const newCurrentHp = Math.min(
      character.maxHp || 0,
      (character.currentHp || 0) + healingAmount
    );
    
    // Уменьшаем количество доступных костей хитов
    const newHitDice = currentHitDice - 1;
    
    // Обновляем персонажа
    updateCharacter({
      currentHp: newCurrentHp,
      hitDice: {
        current: newHitDice,
        max: getMaxHitDice()
      }
    });
    
    // Вызываем колбэк для восстановления здоровья
    if (onHealthRestore) {
      onHealthRestore(healingAmount, false);
    }
    
    // Обновляем локальный счетчик использованных кубиков
    setHitDieUsed(prev => prev + 1);
    
    // Показываем уведомление
    toast({
      title: "Hit Die использован",
      description: `Восстановлено ${healingAmount} HP (${rollResult} + ${conModifier} от CON). Осталось костей: ${newHitDice}.`,
    });
  }, [character, getCurrentHitDice, getMaxHitDice, onHealthRestore, toast, updateCharacter]);

  return {
    // Состояния
    isShortResting,
    isLongResting,
    hitDieUsed,
    
    // Методы для отдыха
    takeShortRest,
    takeLongRest,
    useHitDie,
    
    // Информация о костях хитов
    getHitDieType,
    getHitDieValue,
    getCurrentHitDice,
    getMaxHitDice
  };
}
