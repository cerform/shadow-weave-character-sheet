
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CharacterAbilityScoresProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterAbilityScores = ({ character, onUpdateCharacter }: CharacterAbilityScoresProps) => {
  const initialPoints = 27;
  const [pointsRemaining, setPointsRemaining] = useState(initialPoints);
  const [abilities, setAbilities] = useState({
    strength: character.abilities.strength || 8,
    dexterity: character.abilities.dexterity || 8,
    constitution: character.abilities.constitution || 8,
    intelligence: character.abilities.intelligence || 8,
    wisdom: character.abilities.wisdom || 8,
    charisma: character.abilities.charisma || 8
  });
  
  const abilityLabels = {
    strength: "Сила",
    dexterity: "Ловкость",
    constitution: "Телосложение",
    intelligence: "Интеллект",
    wisdom: "Мудрость",
    charisma: "Харизма"
  };
  
  const abilityDescriptions = {
    strength: "Физическая мощь, атлетические способности",
    dexterity: "Ловкость, проворство, рефлексы",
    constitution: "Выносливость, здоровье, жизненная сила",
    intelligence: "Память, рассудительность, логика",
    wisdom: "Интуиция, восприятие, проницательность",
    charisma: "Сила личности, лидерство, убеждение"
  };
  
  const calculatePointCost = (value: number): number => {
    if (value <= 13) return value - 8;
    if (value === 14) return 7;
    if (value === 15) return 9;
    return 0;
  };
  
  const calculateModifier = (value: number): string => {
    const modifier = Math.floor((value - 10) / 2);
    if (modifier >= 0) return `+${modifier}`;
    return `${modifier}`;
  };
  
  const getUsedPoints = (): number => {
    return Object.values(abilities).reduce(
      (total, value) => total + calculatePointCost(value), 
      0
    );
  };
  
  const handleIncrease = (ability: keyof typeof abilities) => {
    if (abilities[ability] < 15 && getUsedPoints() < initialPoints) {
      const newValue = abilities[ability] + 1;
      const newCost = calculatePointCost(newValue);
      const oldCost = calculatePointCost(abilities[ability]);
      
      if (getUsedPoints() - oldCost + newCost <= initialPoints) {
        const newAbilities = { ...abilities, [ability]: newValue };
        setAbilities(newAbilities);
        onUpdateCharacter({ abilities: newAbilities });
        setPointsRemaining(initialPoints - getUsedPoints() + oldCost - newCost);
      }
    }
  };
  
  const handleDecrease = (ability: keyof typeof abilities) => {
    if (abilities[ability] > 8) {
      const newValue = abilities[ability] - 1;
      const newCost = calculatePointCost(newValue);
      const oldCost = calculatePointCost(abilities[ability]);
      
      const newAbilities = { ...abilities, [ability]: newValue };
      setAbilities(newAbilities);
      onUpdateCharacter({ abilities: newAbilities });
      setPointsRemaining(initialPoints - getUsedPoints() - oldCost + newCost);
    }
  };

  const totalPoints = getUsedPoints();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Характеристики персонажа</h2>
      <p className="mb-2 text-muted-foreground">
        Распределите очки между шестью базовыми характеристиками вашего персонажа.
      </p>
      <p className="mb-4 text-muted-foreground">
        У вас есть {initialPoints} очков. Характеристики от 8 до 13 стоят столько, сколько их значение минус 8.
        14 стоит 7 очков, а 15 стоит 9 очков.
      </p>
      
      <div className="mb-6 p-3 bg-primary/10 rounded-md flex items-center justify-between">
        <span>Использовано очков: <strong>{totalPoints} из {initialPoints}</strong></span>
        <span>Осталось: <strong>{initialPoints - totalPoints}</strong></span>
      </div>
      
      <div className="space-y-4">
        {Object.entries(abilities).map(([ability, value]) => (
          <div key={ability} className="p-4 border rounded-md bg-card/30">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-lg font-semibold">
                {abilityLabels[ability as keyof typeof abilityLabels]}
              </Label>
              <span className="text-sm text-muted-foreground">
                Модификатор: {calculateModifier(value)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleDecrease(ability as keyof typeof abilities)}
                disabled={value <= 8}
              >
                -
              </Button>
              
              <div className="w-20 text-center font-bold text-xl">
                {value}
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleIncrease(ability as keyof typeof abilities)}
                disabled={value >= 15 || totalPoints >= initialPoints}
              >
                +
              </Button>
              
              <div className="text-sm text-muted-foreground ml-2">
                {abilityDescriptions[ability as keyof typeof abilityDescriptions]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
