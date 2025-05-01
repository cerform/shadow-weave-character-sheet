
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Button } from "@/components/ui/button";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3D";
import { Dices } from "lucide-react";

interface CharacterAbilityScoresProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll";
  diceResults: number[][];
  getModifier: (score: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility?: () => { rolls: number[]; total: number };
  abilityScorePoints?: number;
}

const CharacterAbilityScores: React.FC<CharacterAbilityScoresProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
  abilitiesMethod,
  diceResults,
  getModifier,
  rollAllAbilities,
  rollSingleAbility,
  abilityScorePoints = 27
}) => {
  const [stats, setStats] = useState({
    strength: character.stats.strength,
    dexterity: character.stats.dexterity,
    constitution: character.stats.constitution,
    intelligence: character.stats.intelligence,
    wisdom: character.stats.wisdom,
    charisma: character.stats.charisma,
  });

  const [pointsLeft, setPointsLeft] = useState(abilityScorePoints); // Для метода Point Buy
  const [assignedDice, setAssignedDice] = useState<{[key: string]: number | null}>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null,
  });
  
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [activeAbility, setActiveAbility] = useState<string | null>(null);
  const [diceRollResult, setDiceRollResult] = useState<number | null>(null);

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
      setPointsLeft(abilityScorePoints);
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
  }, [abilitiesMethod, abilityScorePoints]);

  // Обработчики для Point Buy
  const incrementStat = (stat: keyof typeof stats) => {
    if (stats[stat] < 15 && pointsLeft >= getPointCost(stats[stat] + 1)) {
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
  
  // Обработчик для 3D кубиков
  const handleRollAbility = (stat: keyof typeof stats) => {
    setActiveAbility(stat);
    setShowDiceRoller(true);
  };
  
  const handleDiceResult = (result: number) => {
    if (activeAbility) {
      setDiceRollResult(result);
      setStats({ ...stats, [activeAbility]: result });
      
      // Задержка перед закрытием, чтобы пользователь увидел результат
      setTimeout(() => {
        setShowDiceRoller(false);
        setActiveAbility(null);
        setDiceRollResult(null);
      }, 2000);
    }
  };

  const handleNext = () => {
    updateCharacter({ stats });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Распределение характеристик</h2>
      
      {/* 3D Dice Roller */}
      {showDiceRoller && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Бросок для {getStatName(activeAbility || '')}</h3>
          <div className="h-80 relative">
            <DiceRoller3D onRollComplete={handleDiceResult} />
            
            {diceRollResult && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="bg-primary/20 backdrop-blur-md p-3 rounded-md shadow-lg inline-block">
                  <span className="font-bold text-2xl">{diceRollResult}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {abilitiesMethod === "pointbuy" && (
        <div className="mb-4">
          <p className="mb-2">
            Осталось очков: <span className="font-bold">{pointsLeft}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Распределите {abilityScorePoints} очков между характеристиками. Значение от 8 до 15.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.keys(stats).map((key) => {
          const stat = key as keyof typeof stats;
          const value = stats[stat];
          const modifier = getModifier(value);
          
          return (
            <div key={key} className="p-4 border rounded text-center">
              <h3 className="font-bold text-lg mb-1">{getStatName(stat)}</h3>
              <div className="text-3xl font-bold mb-1">{value}</div>
              <div className="text-xl mb-3">{modifier}</div>
              
              {abilitiesMethod === "pointbuy" && (
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={() => decrementStat(stat)}
                    disabled={value <= 8}
                    size="sm"
                  >
                    -
                  </Button>
                  <Button
                    onClick={() => incrementStat(stat)}
                    disabled={value >= 15 || pointsLeft < getPointCost(value + 1)}
                    size="sm"
                  >
                    +
                  </Button>
                </div>
              )}
              
              {abilitiesMethod === "roll" && (
                <Button
                  onClick={() => handleRollAbility(stat)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Dices className="h-4 w-4" />
                  <span>Бросить 3D кубик</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <NavigationButtons
        allowNext={
          abilitiesMethod === "standard" ||
          (abilitiesMethod === "pointbuy" && pointsLeft >= 0) ||
          (abilitiesMethod === "roll" && Object.values(stats).every(val => val >= 3))
        }
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

// Вспомогательные функции
function getStatName(stat: string): string {
  const names: {[key: string]: string} = {
    'strength': 'Сила',
    'dexterity': 'Ловкость',
    'constitution': 'Телосложение',
    'intelligence': 'Интеллект',
    'wisdom': 'Мудрость',
    'charisma': 'Харизма'
  };
  return names[stat] || stat;
}

export default CharacterAbilityScores;
