import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { Input } from '@/components/ui/input';
import { getModifierFromAbilityScore } from '@/utils/characterUtils';
import { Token } from '@/stores/battleStore';

interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onDiceRoll?: (dice: string, result: number, modifier: number) => void;
  compactMode?: boolean;
  isDM?: boolean;
  tokens?: Token[];
  selectedTokenId?: number | null;
  onSelectToken?: (id: number | null) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ 
  character, 
  onUpdate, 
  onDiceRoll,
  compactMode = false,
  isDM = false,
  tokens = [],
  selectedTokenId = null,
  onSelectToken = () => {}
}) => {
  const [diceSides, setDiceSides] = useState<number>(20);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollLabel, setRollLabel] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ dice: string, result: number, total: number } | null>(null);
  
  const diceTypes = [4, 6, 8, 10, 12, 20, 100];
  
  const rollDice = (sides: number, modifier: number = 0) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    const diceNotation = `d${sides}`;
    
    setLastRoll({ dice: diceNotation, result, total });
    
    // Вызываем колбэк если он передан
    if (onDiceRoll) {
      onDiceRoll(diceNotation, result, modifier);
    }
    
    // Simulate dice rolling delay
    setTimeout(() => {
      setIsRolling(false);
    }, 600);
  };
  
  const handleCustomRoll = () => {
    if (diceCount <= 0) return;
    
    rollDice(diceSides, modifier);
  };
  
  const handleAbilityCheck = (ability: string) => {
    const abilityScore = character[ability.toLowerCase() as keyof Character] as number;
    const abilityMod = getModifierFromAbilityScore(abilityScore);
    
    rollDice(20, Number(abilityMod));
  };
  
  // Format the dice roll result for display
  const formatRollResult = () => {
    if (!lastRoll) return null;
    
    const { dice, result, total } = lastRoll;
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    
    return (
      <div className="text-center my-2 p-2 bg-muted/20 rounded-md">
        <p className="text-sm text-muted-foreground">{dice}</p>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span
            className={`inline-block px-2 py-1 rounded text-sm font-medium ${
              result === parseInt(dice.slice(1)) ? 'bg-success text-success-foreground' :
              result === 1 ? 'bg-destructive text-destructive-foreground' :
              'bg-secondary text-secondary-foreground'
            }`}
          >
            {result}
          </span>
        </div>
        {diceCount > 1 || modifier !== 0 ? (
          <p className="text-sm mt-1">
            {result} {modifier !== 0 ? modifierStr : ''} = <span className="font-bold">{total}</span>
          </p>
        ) : (
          <p className="text-sm mt-1">
            <span className="font-bold">{total}</span>
          </p>
        )}
      </div>
    );
  };

  // Компактный режим отображения
  if (compactMode) {
    return (
      <div className="space-y-2">
        {character.lastDiceRoll && formatRollResult()}
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diceTypes.map(sides => (
            <Button
              key={sides}
              variant="secondary"
              size="sm"
              onClick={() => rollDice(sides, 0)}
              disabled={isRolling}
              className="text-xs"
            >
              d{sides}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-1">
          <Input
            type="number"
            min={1}
            max={10}
            value={diceCount}
            onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
            className="w-12 h-8 text-xs"
          />
          <span>d</span>
          <Input
            type="number"
            min={2}
            value={diceSides}
            onChange={(e) => setDiceSides(parseInt(e.target.value) || 20)}
            className="w-12 h-8 text-xs"
          />
          <span>+</span>
          <Input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
            className="w-12 h-8 text-xs"
          />
          <Button
            onClick={handleCustomRoll}
            disabled={isRolling}
            variant="default"
            size="sm"
            className="h-8"
          >
            {isRolling ? "..." : "Бросок"}
          </Button>
        </div>
      </div>
    );
  }
  
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
              onClick={() => rollDice(sides, 0)}
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
