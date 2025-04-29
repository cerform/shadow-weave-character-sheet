
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Button } from "@/components/ui/button";

interface CharacterAbilityScoresProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll";
  diceResults: number[][];
  getModifier: (score: number) => string;
}

const CharacterAbilityScores: React.FC<CharacterAbilityScoresProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
  abilitiesMethod,
  diceResults,
  getModifier
}) => {
  const [stats, setStats] = useState({
    strength: character.stats.strength,
    dexterity: character.stats.dexterity,
    constitution: character.stats.constitution,
    intelligence: character.stats.intelligence,
    wisdom: character.stats.wisdom,
    charisma: character.stats.charisma,
  });

  const [pointsLeft, setPointsLeft] = useState(27); // Для метода Point Buy
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
      // Сбрасываем все до 8 и даем 27 очков для распределения
      setStats({
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8,
      });
      setPointsLeft(27);
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
  }, [abilitiesMethod]);

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

  const handleNext = () => {
    updateCharacter({ stats });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Распределение характеристик</h2>
      
      {abilitiesMethod === "pointbuy" && (
        <div className="mb-4">
          <p className="mb-2">
            Осталось очков: <span className="font-bold">{pointsLeft}</span>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Распределите 27 очков между характеристиками. Значение от 8 до 15.
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
                <div>
                  {assignedDice[stat] !== null ? (
                    <Button
                      onClick={() => setAssignedDice({...assignedDice, [stat]: null})}
                      size="sm"
                      variant="outline"
                    >
                      Сбросить
                    </Button>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      {diceResults.map((dice, idx) => {
                        // Проверяем, что эта кость еще не назначена
                        const isAssigned = Object.values(assignedDice).includes(idx);
                        const sorted = [...dice].sort((a, b) => b - a);
                        const total = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
                        
                        return (
                          <Button
                            key={idx}
                            onClick={() => assignDiceToStat(stat, idx)}
                            disabled={isAssigned}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            {total}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <NavigationButtons
        allowNext={
          abilitiesMethod === "standard" ||
          (abilitiesMethod === "pointbuy" && pointsLeft >= 0) ||
          (abilitiesMethod === "roll" && !Object.values(assignedDice).includes(null))
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
