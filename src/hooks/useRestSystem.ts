
import { useState, useCallback } from 'react';
import { getNumericModifier, getHitDieType } from '@/utils/characterUtils';
import { CharacterSheet } from '@/types/character';

interface UseRestSystemProps {
  character: CharacterSheet | null;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  onHealthRestore?: (amount: number, isLongRest: boolean) => void;
}

export const useRestSystem = ({
  character,
  updateCharacter,
  onHealthRestore
}: UseRestSystemProps) => {
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);
  
  // Получение типа кубика хитов для класса персонажа
  const getHitDieTypeForCharacter = useCallback((): string => {
    if (!character?.class) return 'd8';
    return getHitDieType(character.class);
  }, [character?.class]);
  
  // Получение текущего количества кубиков хитов
  const getCurrentHitDice = useCallback((): number => {
    if (!character?.hitDice) return character?.level || 1;
    
    // Если hitDice хранится в формате "2d8", извлекаем число
    if (typeof character.hitDice === 'string' && character.hitDice.includes('d')) {
      const match = character.hitDice.match(/^(\d+)d/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    // Если hitDice хранится как число
    if (typeof character.hitDice === 'number') {
      return character.hitDice;
    }
    
    // По умолчанию возвращаем уровень персонажа
    return character?.level || 1;
  }, [character?.hitDice, character?.level]);
  
  // Получение максимального количества кубиков хитов (равно уровню персонажа)
  const getMaxHitDice = useCallback((): number => {
    return character?.level || 1;
  }, [character?.level]);
  
  // Использование кубика хитов для восстановления здоровья
  const useHitDie = useCallback((rollResult: number): void => {
    if (!character) return;
    
    const currentDice = getCurrentHitDice();
    if (currentDice <= 0) return;
    
    // Получаем модификатор телосложения
    const conModifier = character.abilities?.constitution 
      ? getNumericModifier(character.abilities.constitution)
      : (character.abilities?.CON ? getNumericModifier(character.abilities.CON) : 0);
    
    // Рассчитываем восстановленное здоровье (результат броска + модификатор телосложения)
    const healingAmount = rollResult + conModifier;
    
    // Обновляем количество кубиков хитов
    const newHitDice = currentDice - 1;
    
    // Обновляем кубики хитов в том же формате, в котором они хранились
    let updatedHitDice: string | number = newHitDice;
    if (typeof character.hitDice === 'string' && character.hitDice.includes('d')) {
      const dieType = getHitDieTypeForCharacter();
      updatedHitDice = `${newHitDice}${dieType}`;
    }
    
    // Обновляем персонажа
    updateCharacter({
      hitDice: updatedHitDice,
    });
    
    // Вызываем обработчик восстановления здоровья, если он предоставлен
    if (onHealthRestore) {
      onHealthRestore(Math.max(1, healingAmount), false);
    }
  }, [character, getCurrentHitDice, getHitDieTypeForCharacter, onHealthRestore, updateCharacter]);
  
  // Короткий отдых (восстанавливает некоторые ресурсы)
  const takeShortRest = useCallback(async (): Promise<void> => {
    if (!character || isShortResting || isLongResting) return;
    
    setIsShortResting(true);
    
    // Имитация времени отдыха
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Тут можно добавить восстановление других ресурсов при коротком отдыхе
    
    setIsShortResting(false);
  }, [character, isShortResting, isLongResting]);
  
  // Длинный отдых (полностью восстанавливает здоровье и ресурсы)
  const takeLongRest = useCallback(async (): Promise<void> => {
    if (!character || isShortResting || isLongResting) return;
    
    setIsLongResting(true);
    
    // Имитация времени отдыха
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Восстанавливаем кубики хитов (минимум половина от максимального количества)
    const maxDice = getMaxHitDice();
    const restoredDice = Math.max(Math.floor(maxDice / 2), 1);
    let currentDice = getCurrentHitDice();
    let newDice = Math.min(maxDice, currentDice + restoredDice);
    
    // Обновляем кубики хитов в том же формате, в котором они хранились
    let updatedHitDice: string | number = newDice;
    if (typeof character.hitDice === 'string' && character.hitDice.includes('d')) {
      const dieType = getHitDieTypeForCharacter();
      updatedHitDice = `${newDice}${dieType}`;
    }
    
    // Обновляем информацию о персонаже
    updateCharacter({
      hitDice: updatedHitDice,
      temporaryHp: 0 // Сбрасываем временные хиты после длинного отдыха
    });
    
    // Вызываем обработчик восстановления здоровья, если он предоставлен
    if (onHealthRestore) {
      // Полное восстановление здоровья
      onHealthRestore(character.maxHp || 0, true);
    }
    
    setIsLongResting(false);
  }, [character, isShortResting, isLongResting, getMaxHitDice, getCurrentHitDice, getHitDieTypeForCharacter, onHealthRestore, updateCharacter]);
  
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
};
