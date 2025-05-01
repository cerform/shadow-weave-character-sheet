
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface CharacterAbilityScoresProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll";
  diceResults: number[][];
  getModifier: (score: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility?: (abilityIndex: number) => { rolls: number[]; total: number };
  abilityScorePoints?: number;
  rollsHistory?: { ability: string, rolls: number[], total: number }[];
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
  abilityScorePoints = 27,
  rollsHistory = []
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
  
  // Получаем текущую тему для динамического стилизования
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
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

  // Функция для броска одиночной характеристики
  const handleRollAbility = (stat: keyof typeof stats) => {
    if (rollSingleAbility) {
      const result = rollSingleAbility(0); // Используем индекс 0, т.к. бросаем одну характеристику
      setStats({ ...stats, [stat]: result.total });
      console.log(`Бросок для ${getStatName(stat)}: ${result.rolls.join(', ')} = ${result.total}`);
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
            Распределите {abilityScorePoints} очков между характеристиками. Значение от 8 до 15.
          </p>
        </div>
      )}
      
      {abilitiesMethod === "roll" && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {diceResults.map((roll, index) => {
              const sortedRolls = [...roll].sort((a, b) => b - a);
              const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
              const isAssigned = Object.values(assignedDice).includes(index);
              
              return (
                <div 
                  key={index}
                  className={`p-2 border rounded text-center ${isAssigned ? 'bg-gray-200 opacity-50' : 'bg-card'}`}
                >
                  <div className="text-sm">Бросок {index + 1}</div>
                  <div className="font-bold text-lg">{total}</div>
                  <div className="text-xs" style={{ color: currentTheme.accent }}>
                    {sortedRolls.slice(0, 3).join(' + ')} {roll.length > 3 && <span className="line-through">+ {sortedRolls[3]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          
          <Button 
            onClick={rollAllAbilities}
            className="w-full mb-4"
            variant="outline"
          >
            <Dices className="mr-2 h-4 w-4" />
            Перебросить все кубики
          </Button>
          
          <p className="text-sm text-muted-foreground mb-2">
            Выберите результат броска для каждой характеристики, кликнув по характеристике, а затем по значению броска.
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
              <div className="text-xl mb-3" style={{ color: currentTheme.accent }}>{modifier}</div>
              
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
                <div className="grid grid-cols-2 gap-2">
                  {diceResults.map((roll, index) => {
                    const sortedRolls = [...roll].sort((a, b) => b - a);
                    const total = sortedRolls.slice(0, 3).reduce((a, b) => a + b, 0);
                    const isAssigned = Object.values(assignedDice).includes(index);
                    const isAssignedToThisStat = assignedDice[stat] === index;
                    
                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant={isAssignedToThisStat ? "default" : "outline"}
                        disabled={isAssigned && !isAssignedToThisStat}
                        onClick={() => assignDiceToStat(stat, index)}
                      >
                        {total}
                      </Button>
                    );
                  })}
                </div>
              )}
              
              {abilitiesMethod === "roll" && rollSingleAbility && (
                <Button
                  onClick={() => handleRollAbility(stat)}
                  size="sm"
                  className="mt-2 w-full"
                >
                  <Dices className="mr-1 h-4 w-4" />
                  Отдельный бросок
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
