
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DiceRoll } from './DiceRoll';
import { toast } from 'sonner';

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
  
  const [abilityMethod, setAbilityMethod] = useState<'pointbuy' | 'standard' | 'roll'>('pointbuy');
  const [currentRollingAbility, setCurrentRollingAbility] = useState<keyof typeof abilities | null>(null);
  const [diceRolls, setDiceRolls] = useState<number[][]>([]);
  
  const standardArray = [15, 14, 13, 12, 10, 8];
  const [assignedStandard, setAssignedStandard] = useState<{[key: string]: number | null}>({
    strength: null,
    dexterity: null,
    constitution: null,
    intelligence: null,
    wisdom: null,
    charisma: null
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
  
  const rollAbility = () => {
    // Roll 4d6, drop the lowest
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    const sum = rolls.slice(0, 3).reduce((acc, val) => acc + val, 0);
    
    return { rolls, sum };
  };
  
  const handleRollAllAbilities = () => {
    const newRolls: number[][] = [];
    const newAbilities = { ...abilities };
    
    Object.keys(abilities).forEach((ability) => {
      const { rolls, sum } = rollAbility();
      newRolls.push(rolls);
      newAbilities[ability as keyof typeof abilities] = sum;
    });
    
    setDiceRolls(newRolls);
    setAbilities(newAbilities);
    onUpdateCharacter({ abilities: newAbilities });
    
    toast.success("Все характеристики были сгенерированы!");
  };
  
  const handleRollAbility = (ability: keyof typeof abilities) => {
    setCurrentRollingAbility(ability);
    const { rolls, sum } = rollAbility();
    
    const newDiceRolls = [...diceRolls];
    const abilityIndex = Object.keys(abilities).indexOf(ability);
    if (abilityIndex >= 0 && abilityIndex < newDiceRolls.length) {
      newDiceRolls[abilityIndex] = rolls;
    } else {
      newDiceRolls.push(rolls);
    }
    
    setDiceRolls(newDiceRolls);
    
    const newAbilities = { ...abilities, [ability]: sum };
    setAbilities(newAbilities);
    onUpdateCharacter({ abilities: newAbilities });
    
    toast.success(`${abilityLabels[ability]}: ${sum} (${rolls.slice(0, 3).join(' + ')})`);
  };
  
  const handleUseStandardArray = () => {
    setAbilityMethod('standard');
    setAssignedStandard({
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      wisdom: null,
      charisma: null
    });
  };
  
  const assignStandardValue = (ability: keyof typeof abilities, index: number) => {
    // Check if this value is already assigned
    const usedValues = Object.values(assignedStandard).filter(v => v !== null);
    if (usedValues.includes(standardArray[index])) {
      toast.error("Это значение уже назначено другой характеристике");
      return;
    }
    
    const newAssigned = { ...assignedStandard, [ability]: standardArray[index] };
    setAssignedStandard(newAssigned);
    
    const newAbilities = { ...abilities, [ability]: standardArray[index] };
    setAbilities(newAbilities);
    onUpdateCharacter({ abilities: newAbilities });
  };
  
  const totalPoints = getUsedPoints();
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Характеристики персонажа</h2>
      <p className="mb-4 text-muted-foreground">
        Выберите метод распределения характеристик для вашего персонажа.
      </p>
      
      <div className="mb-6">
        <RadioGroup 
          value={abilityMethod} 
          onValueChange={(value) => setAbilityMethod(value as 'pointbuy' | 'standard' | 'roll')}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="pointbuy" id="pointbuy" />
            <Label htmlFor="pointbuy">Покупка за очки</Label>
          </div>
          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">Стандартный набор</Label>
          </div>
          <div className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem value="roll" id="roll" />
            <Label htmlFor="roll">Бросок костей</Label>
          </div>
        </RadioGroup>
      </div>
      
      {abilityMethod === 'pointbuy' && (
        <>
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
        </>
      )}
      
      {abilityMethod === 'standard' && (
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 rounded-md mb-4">
            <p>Стандартный набор: {standardArray.join(', ')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Распределите эти значения между вашими характеристиками.
            </p>
          </div>
          
          {Object.entries(abilities).map(([ability, _]) => (
            <div key={ability} className="p-4 border rounded-md bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-lg font-semibold">
                  {abilityLabels[ability as keyof typeof abilityLabels]}
                </Label>
                <span className="text-sm text-muted-foreground">
                  Модификатор: {calculateModifier(assignedStandard[ability] || 10)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {standardArray.map((value, idx) => (
                  <Button
                    key={idx}
                    variant={assignedStandard[ability] === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => assignStandardValue(ability as keyof typeof abilities, idx)}
                    disabled={Object.values(assignedStandard).includes(value) && assignedStandard[ability] !== value}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {abilityMethod === 'roll' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Метод броска: 4d6, отбрасывая наименьшее значение
            </p>
            <Button onClick={handleRollAllAbilities}>
              Бросить все характеристики
            </Button>
          </div>
          
          <div className="flex justify-center my-4">
            <DiceRoll sides={6} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{value}</div>
                  <Button 
                    onClick={() => handleRollAbility(ability as keyof typeof abilities)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Dice6 size={16} />
                    Бросить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
