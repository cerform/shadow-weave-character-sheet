
import { useState, useCallback, useEffect } from 'react';
import { ABILITY_SCORE_CAPS } from '@/types/character.d';

export type AbilityMethod = 'pointbuy' | 'standard' | 'roll' | 'manual';

// Хук для генерации и управления значениями характеристик
export const useAbilitiesRoller = (method: AbilityMethod, level: number = 1) => {
  // Массив результатов бросков для каждой характеристики
  const [diceResults, setDiceResults] = useState<number[][]>(Array(6).fill([]).map(() => [0, 0, 0, 0]));
  
  // Доступные очки для метода pointbuy (базовое значение)
  const [abilityScorePoints, setAbilityScorePoints] = useState<number>(27);
  
  // История бросков для отображения
  const [rollsHistory, setRollsHistory] = useState<{ ability: string; rolls: number[]; total: number }[]>([]);
  
  // Обновляем количество доступных очков в зависимости от уровня
  useEffect(() => {
    let basePoints = 27; // Базовое количество
    
    // Добавляем дополнительные очки в зависимости от уровня персонажа
    if (level >= 5) basePoints += 3;  // 30 очков на 5-м уровне
    if (level >= 10) basePoints += 2; // 32 очка на 10-м уровне
    if (level >= 15) basePoints += 2; // 34 очка на 15-м уровне
    
    setAbilityScorePoints(basePoints);
  }, [level]);
  
  // Функция броска 4d6, отбрасывая наименьшее значение
  const roll4d6DropLowest = useCallback(() => {
    // Бросаем 4 кубика d6
    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    
    return dice;
  }, []);
  
  // Функция для суммирования броска (отбрасывая наименьшее значение)
  const sumDiceRoll = (dice: number[]): number => {
    // Копируем массив и сортируем
    const sortedDice = [...dice].sort((a, b) => b - a);
    
    // Суммируем первые 3 значения (отбрасываем наименьшее)
    return sortedDice.slice(0, 3).reduce((sum, value) => sum + value, 0);
  };
  
  // Функция для броска всех характеристик
  const rollAllAbilities = useCallback(() => {
    // Генерируем 6 бросков (для каждой характеристики)
    const newResults: number[][] = [];
    const newHistory: { ability: string; rolls: number[]; total: number }[] = [];
    
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    for (let i = 0; i < 6; i++) {
      const dice = roll4d6DropLowest();
      newResults.push(dice);
      
      newHistory.push({
        ability: abilities[i],
        rolls: dice,
        total: sumDiceRoll(dice)
      });
    }
    
    setDiceResults(newResults);
    setRollsHistory(newHistory);
  }, [roll4d6DropLowest]);
  
  // Функция для броска одной характеристики
  const rollSingleAbility = useCallback((index: number) => {
    const dice = roll4d6DropLowest();
    const total = sumDiceRoll(dice);
    
    // Обновляем результаты
    const newResults = [...diceResults];
    newResults[index] = dice;
    setDiceResults(newResults);
    
    // Обновляем историю бросков
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const newHistory = [...rollsHistory];
    
    // Находим и обновляем историю для этой способности
    const abilityIndex = newHistory.findIndex(h => h.ability === abilities[index]);
    
    if (abilityIndex >= 0) {
      newHistory[abilityIndex] = {
        ability: abilities[index],
        rolls: dice,
        total: total
      };
    } else {
      newHistory.push({
        ability: abilities[index],
        rolls: dice,
        total: total
      });
    }
    
    setRollsHistory(newHistory);
    
    return { rolls: dice, total };
  }, [diceResults, roll4d6DropLowest, rollsHistory]);
  
  // Возвращаем все необходимые значения и функции
  return {
    diceResults,
    abilityScorePoints,
    rollAllAbilities,
    rollSingleAbility,
    rollsHistory
  };
};
