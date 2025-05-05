
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Input } from '@/components/ui/input';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';

interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ character, onUpdate }) => {
  const [diceSides, setDiceSides] = useState<number>(20);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollLabel, setRollLabel] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];
  
  const rollDice = (sides: number, count: number, mod: number, label: string) => {
    setIsRolling(true);
    
    // Simulate dice rolling delay
    setTimeout(() => {
      const rolls = Array(count).fill(0).map(() => Math.floor(Math.random() * sides) + 1);
      const total = rolls.reduce((sum, roll) => sum + roll, 0) + mod;
      
      const newRoll = {
        diceType: `d${sides}`,
        count: count,
        modifier: mod,
        rolls: rolls,
        total: total,
        label: label || `${count}d${sides}${mod >= 0 ? '+' + mod : mod}`,
        timestamp: new Date().toISOString()
      };
      
      onUpdate({ 
        lastDiceRoll: newRoll 
      });
      
      setIsRolling(false);
    }, 600);
  };
  
  const handleCustomRoll = () => {
    if (diceCount <= 0) return;
    
    const label = rollLabel.trim() || `${diceCount}d${diceSides}${modifier >= 0 ? '+' + modifier : modifier}`;
    rollDice(diceSides, diceCount, modifier, label);
  };
  
  const handleAbilityCheck = (ability: string) => {
    const abilityScore = character[ability.toLowerCase() as keyof Character] as number;
    const abilityMod = getModifierFromAbilityScore(abilityScore);
    
    rollDice(20, 1, abilityMod, `Проверка ${getAbilityLabel(ability)}`);
  };
  
  const getAbilityLabel = (ability: string): string => {
    const abilityLabels: Record<string, string> = {
      strength: 'Силы',
      dexterity: 'Ловкости',
      constitution: 'Телосложения',
      intelligence: 'Интеллекта',
      wisdom: 'Мудрости',
      charisma: 'Харизмы'
    };
    return abilityLabels[ability.toLowerCase()] || ability;
  };
  
  // Format the dice roll result for display
  const formatRollResult = () => {
    if (!character.lastDiceRoll) return null;
    
    const { diceType, count, modifier, rolls, total, label } = character.lastDiceRoll;
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    return (
      <div className="text-center my-2 p-2 bg-muted/20 rounded-md">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {rolls.map((roll, i) => (
            <span
              key={i}
              className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                roll === parseInt(diceType.slice(1)) ? 'bg-success text-success-foreground' :
                roll === 1 ? 'bg-destructive text-destructive-foreground' :
                'bg-secondary text-secondary-foreground'
              }`}
            >
              {roll}
            </span>
          ))}
        </div>
        {count > 1 || modifier !== 0 ? (
          <p className="text-sm mt-1">
            {rolls.join(' + ')} {modifier !== 0 ? modifierStr : ''} = <span className="font-bold">{total}</span>
          </p>
        ) : (
          <p className="text-sm mt-1">
            <span className="font-bold">{total}</span>
          </p>
        )}
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Кости</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display last roll result */}
        {character.lastDiceRoll && formatRollResult()}
        
        {/* Ability checks */}
        <div className="grid grid-cols-3 gap-1 mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('strength')}
            disabled={isRolling}
          >
            СИЛ
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('dexterity')}
            disabled={isRolling}
          >
            ЛОВ
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('constitution')}
            disabled={isRolling}
          >
            ТЕЛ
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('intelligence')}
            disabled={isRolling}
          >
            ИНТ
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('wisdom')}
            disabled={isRolling}
          >
            МДР
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleAbilityCheck('charisma')}
            disabled={isRolling}
          >
            ХАР
          </Button>
        </div>
        
        {/* Common dice rolls */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {diceTypes.map(sides => (
            <Button
              key={sides}
              variant="secondary"
              size="sm"
              onClick={() => rollDice(sides, 1, 0, `d${sides}`)}
              disabled={isRolling}
              className="text-xs sm:text-sm"
            >
              d{sides}
            </Button>
          ))}
        </div>
        
        {/* Custom roll */}
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            min={1}
            max={10}
            value={diceCount}
            onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
            className="w-16"
          />
          <span>d</span>
          <Input
            type="number"
            min={2}
            value={diceSides}
            onChange={(e) => setDiceSides(parseInt(e.target.value) || 20)}
            className="w-16"
          />
          <span>+</span>
          <Input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="w-16"
          />
          <Button
            onClick={handleCustomRoll}
            disabled={isRolling}
            variant="default"
            size="sm"
          >
            {isRolling ? "..." : "Бросок"}
          </Button>
        </div>
        
        <Input
          placeholder="Название броска"
          value={rollLabel}
          onChange={(e) => setRollLabel(e.target.value)}
          className="mt-2"
        />
      </CardContent>
    </Card>
  );
};

export default DicePanel;
