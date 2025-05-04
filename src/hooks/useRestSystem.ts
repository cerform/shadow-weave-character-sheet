
import { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import { getHitDieType, getHitDieValue, getNumericModifier } from '@/utils/characterUtils';

interface UseRestSystemProps {
  character: any;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  onHealthRestore?: (amount: number, isLongRest: boolean) => void;
}

export function useRestSystem({
  character,
  updateCharacter,
  onHealthRestore
}: UseRestSystemProps) {
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);

  // Получаем тип кубика хитов для класса
  const getHitDieTypeForCharacter = (): string => {
    if (!character) return 'd8';
    return getHitDieType(character.class || character.className || '');
  };

  // Получаем максимальное количество кубиков хитов (равно уровню)
  const getMaxHitDice = (): number => {
    return character?.level || 1;
  };

  // Получаем текущее количество доступных кубиков хитов
  const getCurrentHitDice = (): number => {
    return character?.hitDice || getMaxHitDice();
  };

  // Функция для короткого отдыха
  const takeShortRest = async () => {
    if (isShortResting || isLongResting) return;

    setIsShortResting(true);
    
    try {
      // Имитация времени короткого отдыха
      await new Promise(resolve => setTimeout(resolve, 1500));

      // При коротком отдыхе ничего автоматически не восстанавливается
      // Игрок может использовать кубики хитов для восстановления
      updateCharacter({
        // После короткого отдыха некоторые способности могут восстанавливаться
        // Зависит от класса персонажа
      });
    } catch (error) {
      console.error('Ошибка при коротком отдыхе:', error);
    } finally {
      setIsShortResting(false);
    }
  };

  // Функция для длинного отдыха
  const takeLongRest = async () => {
    if (isShortResting || isLongResting) return;

    setIsLongResting(true);
    
    try {
      // Имитация времени длинного отдыха
      await new Promise(resolve => setTimeout(resolve, 2000));

      // При длинном отдыхе восстанавливаются все хиты
      const maxHp = character?.maxHp || 0;
      
      // Восстанавливается минимум половина максимального количества кубиков хитов
      const maxHitDice = getMaxHitDice();
      const hitDiceToRestore = Math.max(1, Math.floor(maxHitDice / 2));
      const currentHitDice = getCurrentHitDice();
      const newHitDice = Math.min(maxHitDice, currentHitDice + hitDiceToRestore);
      
      // Обновляем персонажа
      updateCharacter({
        currentHp: maxHp,
        temporaryHp: 0,
        hitDice: newHitDice
      });
      
      // Вызываем callback для обновления HP, если он предоставлен
      if (onHealthRestore) {
        onHealthRestore(maxHp, true);
      }
    } catch (error) {
      console.error('Ошибка при длинном отдыхе:', error);
    } finally {
      setIsLongResting(false);
    }
  };

  // Использование кубика хитов для восстановления здоровья
  const useHitDie = (rollResult: number) => {
    const currentHitDice = getCurrentHitDice();
    if (currentHitDice <= 0) return false;

    const constitutionModifier = getNumericModifier(character?.abilities?.constitution || 10);
    const healAmount = Math.max(1, rollResult + constitutionModifier);
    
    // Обновляем персонажа
    updateCharacter({
      hitDice: currentHitDice - 1
    });
    
    // Вызываем callback для обновления HP, если он предоставлен
    if (onHealthRestore) {
      onHealthRestore(healAmount, false);
    }
    
    return true;
  };

  return {
    isShortResting,
    isLongResting,
    takeShortRest,
    takeLongRest,
    useHitDie,
    getHitDieType: getHitDieTypeForCharacter,
    getCurrentHitDice,
    getMaxHitDice
  };
}
