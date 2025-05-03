
import { useState, useCallback, useEffect } from 'react';
import { ABILITY_SCORE_CAPS } from '@/types/character';

export type AbilityMethod = 'pointbuy' | 'standard' | 'roll' | 'manual';

// Хук для генерации и управления значениями характеристик
export const useAbilitiesRoller = (method: AbilityMethod, level: number = 1) => {
  // Массив результатов бросков для каждой характеристики (с доп. элементами для метода roll)
  const [diceResults, setDiceResults] = useState<number[][]>(Array(6).fill([]).map(() => [0, 0, 0, 0]));
  
  // Доступные очки для метода pointbuy
  const [abilityScorePoints, setAbilityScorePoints] = useState<number>(27);
  
  // История бросков
  const [rollsHistory, setRollsHistory] = useState<{ ability: string; rolls: number[]; total: number }[]>([]);
  
  // Максимальное значение характеристики в зависимости от уровня
  const [maxAbilityScore, setMaxAbilityScore] = useState<number>(ABILITY_SCORE_CAPS.BASE_CAP);
  
  // Обновляем максимальное значение характеристик при изменении уровня
  useEffect(() => {
    if (level >= 16) {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.LEGENDARY_CAP); // 24 для персонажей 16+ уровня
    } else if (level >= 10) {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.EPIC_CAP);     // 22 для персонажей 10+ уровня
    } else {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.BASE_CAP);     // 20 для персонажей до 10 уровня
    }
    
    // Регулируем очки для point buy в зависимости от уровня
    if (method === 'pointbuy') {
      let basePoints = 27;
      // Добавляем дополнительные очки за высокие уровни
      if (level >= 5) basePoints += 3;
      if (level >= 10) basePoints += 5;
      if (level >= 15) basePoints += 7;
      setAbilityScorePoints(basePoints);
    }
  }, [level, method]);

  // Функция для броска 4d6, отбрасывая наименьшее значение
  const roll4d6DropLowest = useCallback((): { rolls: number[]; total: number } => {
    // Бросаем 4d6
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    
    // Сортируем результаты от большего к меньшему
    const sortedRolls = [...rolls].sort((a, b) => b - a);
    
    // Суммируем три наибольших результата
    const total = sortedRolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    
    return { rolls, total };
  }, []);

  // Функция для броска всех 6 характеристик
  const rollAllAbilities = useCallback(() => {
    const newResults: number[][] = [];
    const newHistory: { ability: string; rolls: number[]; total: number }[] = [];
    
    // Названия характеристик для истории
    const abilityNames = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'];
    
    // Бросаем кости для каждой характеристики
    for (let i = 0; i < 6; i++) {
      const { rolls, total } = roll4d6DropLowest();
      newResults.push(rolls);
      
      // Добавляем результат в историю
      newHistory.push({
        ability: abilityNames[i],
        rolls,
        total
      });
    }
    
    setDiceResults(newResults);
    setRollsHistory(prev => [...prev, ...newHistory]);
    
    return newResults;
  }, [roll4d6DropLowest]);

  // Функция для броска конкретной характеристики
  const rollSingleAbility = useCallback((abilityIndex: number): { rolls: number[]; total: number } => {
    // Названия характеристик для истории
    const abilityNames = ['Сила', 'Ловкость', 'Телосложение', 'Интеллект', 'Мудрость', 'Харизма'];
    
    // Бросаем кости для выбранной характеристики
    const { rolls, total } = roll4d6DropLowest();
    
    // Обновляем результаты
    setDiceResults(prev => {
      const newResults = [...prev];
      newResults[abilityIndex] = rolls;
      return newResults;
    });
    
    // Добавляем результат в историю
    setRollsHistory(prev => [
      ...prev,
      {
        ability: abilityNames[abilityIndex],
        rolls,
        total
      }
    ]);
    
    return { rolls, total };
  }, [roll4d6DropLowest]);

  // Сброс доступных очков для метода pointbuy
  const resetPoints = useCallback(() => {
    let basePoints = 27;
    // Добавляем дополнительные очки за высокие уровни
    if (level >= 5) basePoints += 3;
    if (level >= 10) basePoints += 5;
    if (level >= 15) basePoints += 7;
    setAbilityScorePoints(basePoints);
  }, [level]);

  // Обновляем очки при изменении метода
  const updateAbilityPoints = useCallback(() => {
    if (method === 'pointbuy') {
      resetPoints();
    }
  }, [method, resetPoints]);

  return {
    diceResults,
    abilityScorePoints,
    rollsHistory,
    maxAbilityScore,
    rollAllAbilities,
    rollSingleAbility,
    resetPoints,
    updateAbilityPoints
  };
};

export default useAbilitiesRoller;
