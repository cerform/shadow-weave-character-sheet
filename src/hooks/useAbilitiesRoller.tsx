
import { useState, useEffect, useCallback } from "react";

export const useAbilitiesRoller = (abilitiesMethod: "pointbuy" | "standard" | "roll", characterLevel: number) => {
  const [diceResults, setDiceResults] = useState<number[][]>([]);
  const [abilityScorePoints, setAbilityScorePoints] = useState<number>(27);
  const [rollsHistory, setRollsHistory] = useState<{ ability: string, rolls: number[], total: number }[]>([]);

  // Initialize dice results when method changes to roll
  useEffect(() => {
    if (abilitiesMethod === "roll" && diceResults.length === 0) {
      rollAllAbilities();
    }
  }, [abilitiesMethod]);

  // Calculate point buy points based on character level
  useEffect(() => {
    if (abilitiesMethod === "pointbuy") {
      // Base points is 27 for level 1
      let points = 27;
      
      // Add additional points for higher levels
      // Согласно правилам D&D 5e, при повышении уровня игрок может увеличивать характеристики
      if (characterLevel >= 4) points += 2;  // На 4 уровне
      if (characterLevel >= 8) points += 2;  // На 8 уровне
      if (characterLevel >= 12) points += 2; // На 12 уровне
      if (characterLevel >= 16) points += 2; // На 16 уровне
      if (characterLevel >= 19) points += 2; // На 19 уровне
      
      setAbilityScorePoints(points);
    }
  }, [abilitiesMethod, characterLevel]);

  // Генерация бросков для всех 6 характеристик
  const rollAllAbilities = useCallback(() => {
    // Очищаем историю бросков
    setRollsHistory([]);
    
    // Генерируем 6 наборов бросков (4d6 для каждой характеристики)
    const rolls = [];
    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    
    for (let i = 0; i < 6; i++) {
      // Бросаем 4d6
      const diceRolls = [];
      for (let j = 0; j < 4; j++) {
        diceRolls.push(Math.floor(Math.random() * 6) + 1);
      }
      
      // Сортируем броски по убыванию
      const sortedRolls = [...diceRolls].sort((a, b) => b - a);
      // Берем три наибольших значения (отбрасываем наименьшее)
      const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
      
      // Сохраняем результаты броска
      rolls.push(diceRolls);
      
      // Добавляем результат в историю
      setRollsHistory(prev => [
        ...prev, 
        { ability: abilities[i], rolls: diceRolls, total }
      ]);
    }
    
    setDiceResults(rolls);
  }, []);

  // Бросок кубиков для одной характеристики
  const rollSingleAbility = useCallback((abilityIndex: number) => {
    // Броски 4d6
    const diceRolls = [];
    for (let i = 0; i < 4; i++) {
      diceRolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Сортируем и суммируем три наибольших значения
    const sortedRolls = [...diceRolls].sort((a, b) => b - a);
    const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
    
    // Обновляем результаты бросков для конкретной характеристики
    const newDiceResults = [...diceResults];
    newDiceResults[abilityIndex] = diceRolls;
    setDiceResults(newDiceResults);
    
    // Обновляем историю бросков
    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    setRollsHistory(prev => [
      // Удаляем предыдущий бросок для этой характеристики
      ...prev.filter(roll => roll.ability !== abilities[abilityIndex]),
      // Добавляем новый бросок
      { ability: abilities[abilityIndex], rolls: diceRolls, total }
    ]);
    
    return {
      rolls: diceRolls,
      total: total
    };
  }, [diceResults]);

  return {
    diceResults,
    rollAllAbilities,
    rollSingleAbility,
    abilityScorePoints,
    rollsHistory
  };
};
