
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { AbilityScoreMethodSelector } from "./AbilityScoreMethodSelector";
import AbilityRollingPanel from "./AbilityRollingPanel";
import PointBuyPanel from "./PointBuyPanel";
import StandardArrayPanel from "./StandardArrayPanel";
import ManualInputPanel from "./ManualInputPanel";
import { CharacterSheet, ABILITY_SCORE_CAPS } from "@/types/character";
import { useToast } from "@/hooks/use-toast";

interface CharacterAbilityScoresProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll" | "manual";
  setAbilitiesMethod: (method: "pointbuy" | "standard" | "roll" | "manual") => void;
  diceResults: number[][];
  getModifier: (score: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility?: (abilityIndex: number) => { rolls: number[]; total: number };
  abilityScorePoints?: number;
  rollsHistory?: { ability: string, rolls: number[], total: number }[];
  maxAbilityScore?: number;
}

const CharacterAbilityScores: React.FC<CharacterAbilityScoresProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
  abilitiesMethod,
  setAbilitiesMethod,
  diceResults,
  getModifier,
  rollAllAbilities,
  rollSingleAbility,
  abilityScorePoints = 27,
  rollsHistory = [],
  maxAbilityScore
}) => {
  const { toast } = useToast();
  
  // Инициализируем stats с безопасной проверкой на существование character.abilities или character.stats
  const [stats, setStats] = useState({
    strength: character?.stats?.strength || character?.abilities?.strength || character?.abilities?.STR || 10,
    dexterity: character?.stats?.dexterity || character?.abilities?.dexterity || character?.abilities?.DEX || 10,
    constitution: character?.stats?.constitution || character?.abilities?.constitution || character?.abilities?.CON || 10,
    intelligence: character?.stats?.intelligence || character?.abilities?.intelligence || character?.abilities?.INT || 10,
    wisdom: character?.stats?.wisdom || character?.abilities?.wisdom || character?.abilities?.WIS || 10,
    charisma: character?.stats?.charisma || character?.abilities?.charisma || character?.abilities?.CHA || 10,
  });
  
  // Определяем максимальное значение для характеристик на основе уровня персонажа
  const [maxStatValue, setMaxStatValue] = useState<number>(ABILITY_SCORE_CAPS.BASE_CAP);
  
  // Определяем количество очков для распределения в зависимости от уровня
  const [adjustedPointsLeft, setAdjustedPointsLeft] = useState<number>(abilityScorePoints);
  const [totalPointsAvailable, setTotalPointsAvailable] = useState<number>(abilityScorePoints);
  
  useEffect(() => {
    // Устанавливаем максимальное значение в зависимости от уровня
    if (maxAbilityScore) {
      setMaxStatValue(maxAbilityScore);
    } else if (character.level >= 16) {
      setMaxStatValue(ABILITY_SCORE_CAPS.LEGENDARY_CAP);
    } else if (character.level >= 10) {
      setMaxStatValue(ABILITY_SCORE_CAPS.EPIC_CAP);
    } else {
      setMaxStatValue(ABILITY_SCORE_CAPS.BASE_CAP);
    }
    
    // Уведомляем об изменении лимита
    if (character.level >= 10) {
      toast({
        title: "Повышенный лимит характеристик",
        description: `На уровне ${character.level} максимальное значение характеристики: ${character.level >= 16 ? 24 : 22}`,
      });
    }
    
    setTotalPointsAvailable(abilityScorePoints);
    setAdjustedPointsLeft(abilityScorePoints);
  }, [character.level, toast, abilityScorePoints, maxAbilityScore]);
  
  // Для отслеживания использованных очков в point buy
  const [pointsLeft, setPointsLeft] = useState(totalPointsAvailable);

  useEffect(() => {
    // При изменении метода расчета характеристик обновляем доступные очки
    if (abilitiesMethod === "pointbuy") {
      setPointsLeft(totalPointsAvailable);
    }
  }, [abilitiesMethod, totalPointsAvailable]);

  const [assignedDice, setAssignedDice] = useState<{[key: string]: number | null}>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });
  
  // Константы для расчета Point Buy
  const POINT_COSTS: {[key: number]: number} = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
  };

  useEffect(() => {
    if (abilitiesMethod === "standard") {
      // Стандартный массив: 15, 14, 13, 12, 10, 8
      setStats({
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8,
      });
    } else if (abilitiesMethod === "pointbuy") {
      // Сбрасываем все до 8 и даем очки для распределения
      setStats({
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      });
      setPointsLeft(totalPointsAvailable);
      
      // Уведомляем о доступных очках
      toast({
        title: "Доступные очки",
        description: `У вас ${totalPointsAvailable} очков для распределения характеристик на ${character.level} уровне`
      });
    } else if (abilitiesMethod === "roll") {
      // При выборе метода бросков сбрасываем назначенные кости
      setAssignedDice({
        strength: null,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null,
      });
    }
  }, [abilitiesMethod, totalPointsAvailable, character.level, toast]);

  // Обработчики для Point Buy
  const incrementStat = (stat: keyof typeof stats) => {
    if (stats[stat] < Math.min(15, maxStatValue) && pointsLeft >= getPointCost(stats[stat] + 1)) {
      const newPointsLeft = pointsLeft - getPointCost(stats[stat] + 1);
      setPointsLeft(newPointsLeft);
      setStats({ ...stats, [stat]: stats[stat] + 1 });
    }
  };

  const decrementStat = (stat: keyof typeof stats) => {
    if (stats[stat] > 8) {
      const newPointsLeft = pointsLeft + getPointCost(stats[stat]);
      setPointsLeft(newPointsLeft);
      setStats({ ...stats, [stat]: stats[stat] - 1 });
    }
  };

  const getPointCost = (value: number): number => {
    return POINT_COSTS[value] - POINT_COSTS[value - 1] || 0;
  };

  // Обработчик для ручного ввода
  const updateStat = (stat: keyof typeof stats, value: number) => {
    if (value >= 1 && value <= maxStatValue) {
      setStats({ ...stats, [stat]: value });
    }
  };

  // Обработчики для метода бросков
  const assignDiceToStat = (stat: keyof typeof stats, diceIndex: number) => {
    // Проверяем, что эта кость еще не назначена
    if (Object.values(assignedDice).includes(diceIndex)) {
      return;
    }
    
    // Вычисляем значение из кости (4d6, отбрасывая наименьшее)
    if (diceResults[diceIndex]) {
      const sorted = [...diceResults[diceIndex]].sort((a, b) => b - a);
      const total = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
      
      // Обновляем значение характеристики и помечаем кость как использованную
      setStats({ ...stats, [stat]: total });
      setAssignedDice({ ...assignedDice, [stat]: diceIndex });
    }
  };

  // Функция для броска одиночной характеристики
  const handleRollAbility = (stat: keyof typeof stats) => {
    if (rollSingleAbility) {
      // Определяем индекс характеристики
      const abilityKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
      const index = abilityKeys.indexOf(stat);
      
      if (index !== -1) {
        const result = rollSingleAbility(index);
        setStats({ ...stats, [stat]: result.total });
      }
    }
  };

  const handleNext = () => {
    // Создаем объекты для обоих форматов abilities и stats
    const abilitiesFormat = {
      STR: stats.strength,
      DEX: stats.dexterity,
      CON: stats.constitution,
      INT: stats.intelligence,
      WIS: stats.wisdom,
      CHA: stats.charisma,
      // Для обратной совместимости
      strength: stats.strength,
      dexterity: stats.dexterity,
      constitution: stats.constitution,
      intelligence: stats.intelligence,
      wisdom: stats.wisdom,
      charisma: stats.charisma
    };

    const statsFormat = {
      strength: stats.strength,
      dexterity: stats.dexterity,
      constitution: stats.constitution,
      intelligence: stats.intelligence,
      wisdom: stats.wisdom,
      charisma: stats.charisma
    };
    
    // Сохраняем в оба поля abilities и stats для совместимости
    updateCharacter({ 
      abilities: abilitiesFormat,
      stats: statsFormat,
      abilityPointsUsed: abilitiesMethod === 'pointbuy' ? totalPointsAvailable - pointsLeft : undefined
    });
    nextStep();
  };

  // Проверяем, можно ли перейти к следующему шагу
  const canProceed = () => {
    if (abilitiesMethod === "standard") return true;
    if (abilitiesMethod === "pointbuy") return pointsLeft >= 0;
    if (abilitiesMethod === "roll") return Object.values(stats).every(val => val >= 3);
    if (abilitiesMethod === "manual") return Object.values(stats).every(val => val >= 1 && val <= maxStatValue);
    return false;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-foreground">Распределение характеристик</h2>
      
      <AbilityScoreMethodSelector 
        selectedMethod={abilitiesMethod}
        onChange={setAbilitiesMethod}
      />
      
      <div className="my-6">
        {abilitiesMethod === "pointbuy" && (
          <PointBuyPanel 
            stats={stats}
            pointsLeft={pointsLeft}
            incrementStat={incrementStat}
            decrementStat={decrementStat}
            getModifier={getModifier}
            getPointCost={getPointCost}
            abilityScorePoints={totalPointsAvailable}
            maxAbilityScore={maxStatValue}
          />
        )}
        
        {abilitiesMethod === "standard" && (
          <StandardArrayPanel 
            stats={stats}
            getModifier={getModifier}
          />
        )}
        
        {abilitiesMethod === "roll" && (
          <AbilityRollingPanel 
            diceResults={diceResults}
            assignedDice={assignedDice}
            onRollAllAbilities={rollAllAbilities}
            onAssignDiceToStat={assignDiceToStat}
            onRollSingleAbility={handleRollAbility}
            stats={stats}
            getModifier={getModifier}
          />
        )}
        
        {abilitiesMethod === "manual" && (
          <ManualInputPanel 
            abilityScores={stats}
            setAbilityScores={setStats}
            maxAbilityScore={maxStatValue}
            level={character.level}
          />
        )}
      </div>

      <NavigationButtons
        allowNext={canProceed()}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterAbilityScores;
