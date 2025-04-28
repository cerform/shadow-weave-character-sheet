import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

interface CharacterAbilityScoresProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const defaultStats = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8,
};

const costTable = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const CharacterAbilityScores: React.FC<CharacterAbilityScoresProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [stats, setStats] = useState(character.stats || defaultStats);
  const [points, setPoints] = useState(calculatePoints(stats));

  function calculatePoints(currentStats: any) {
    let total = 27;
    for (const key in currentStats) {
      total -= costTable[currentStats[key] as keyof typeof costTable];
    }
    return total;
  }

  const handleIncrease = (stat: string) => {
    const currentValue = stats[stat];
    if (currentValue >= 15) return;

    const newCost = costTable[currentValue + 1];
    const oldCost = costTable[currentValue];
    const diff = newCost - oldCost;

    if (points - diff < 0) return;

    const newStats = {
      ...stats,
      [stat]: currentValue + 1,
    };

    setStats(newStats);
    setPoints(calculatePoints(newStats));
  };

  const handleDecrease = (stat: string) => {
    const currentValue = stats[stat];
    if (currentValue <= 8) return;

    const newCost = costTable[currentValue - 1];
    const oldCost = costTable[currentValue];
    const diff = oldCost - newCost;

    const newStats = {
      ...stats,
      [stat]: currentValue - 1,
    };

    setStats(newStats);
    setPoints(calculatePoints(newStats));
  };

  const handleNext = () => {
    updateCharacter({ stats });
    nextStep();
  };

  const abilityNames = {
    strength: "Сила",
    dexterity: "Ловкость",
    constitution: "Телосложение",
    intelligence: "Интеллект",
    wisdom: "Мудрость",
    charisma: "Харизма",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Распределение характеристик (Point Buy)</h2>
      <p className="mb-6 text-muted-foreground">
        Используйте свои 27 очков для распределения характеристик. Осталось:{" "}
        <span className="font-bold">{points}</span> очков.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.keys(stats).map((stat) => (
          <div key={stat} className="flex flex-col items-center space-y-2 p-4 border rounded bg-primary/5">
            <span className="text-lg font-semibold">{abilityNames[stat as keyof typeof abilityNames]}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrease(stat)}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                -
              </button>
              <span className="text-2xl font-bold">{stats[stat]}</span>
              <button
                onClick={() => handleIncrease(stat)}
                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* КНОПКИ НАВИГАЦИИ */}
      <NavigationButtons
        allowNext={points === 0}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterAbilityScores;
