import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useSocket } from '@/contexts/SocketContext';
import { 
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  CircleCheck, ChevronsDown, ChevronsUp
} from 'lucide-react';

export interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  compactMode?: boolean;
  isDM?: boolean;
  tokens?: any[];
  selectedTokenId?: number;
  onSelectToken?: (id: number | null) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ 
  character,
  onUpdate,
  compactMode = false,
  isDM = false,
  tokens = [],
  selectedTokenId,
  onSelectToken
}) => {
  const { toast } = useToast();
  const [diceType, setDiceType] = useState('d20');
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [customModifier, setCustomModifier] = useState('');
  const [lastRoll, setLastRoll] = useState<number[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const { connected, sendUpdate } = useSocket();

  // Roll the dice
  const rollDice = (sides: number, count: number = 1, mod: number = 0, label: string = '') => {
    // Generate random roll results
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    
    // Calculate total
    const rollTotal = rolls.reduce((sum, roll) => sum + roll, 0) + mod;
    
    // Update state
    setLastRoll(rolls);
    setTotal(rollTotal);
    
    // Store the roll in character data for history
    if (character) {
      onUpdate({
        lastDiceRoll: {
          diceType: `d${sides}`,
          count,
          modifier: mod,
          rolls,
          total: rollTotal,
          label,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Show toast notification
    const modDisplay = mod > 0 ? `+${mod}` : mod < 0 ? mod : '';
    toast({
      title: `${label || 'Dice Roll'}: ${count}d${sides}${modDisplay}`,
      description: `Rolls: [${rolls.join(', ')}] = ${rollTotal}`,
    });
    
    // Send update to socket if connected
    if (connected && sendUpdate) {
      const updatedCharacter = {
        ...character,
        lastDiceRoll: {
          diceType: `d${sides}`,
          count,
          modifier: mod,
          rolls,
          total: rollTotal,
          label,
          timestamp: new Date().toISOString()
        }
      };
      sendUpdate(updatedCharacter);
    }
    
    return { rolls, total: rollTotal };
  };

  // Roll abilities
  const rollAbility = (ability: string) => {
    let abilityScore = 10;
    let abilityName = '';
    
    // Get ability score based on ability name
    switch (ability.toLowerCase()) {
      case 'str':
      case 'strength':
        abilityScore = character.strength || 10;
        abilityName = 'Сила';
        break;
      case 'dex':
      case 'dexterity':
        abilityScore = character.dexterity || 10;
        abilityName = 'Ловкость';
        break;
      case 'con':
      case 'constitution':
        abilityScore = character.constitution || 10;
        abilityName = 'Телосложение';
        break;
      case 'int':
      case 'intelligence':
        abilityScore = character.intelligence || 10;
        abilityName = 'Интеллект';
        break;
      case 'wis':
      case 'wisdom':
        abilityScore = character.wisdom || 10;
        abilityName = 'Мудрость';
        break;
      case 'cha':
      case 'charisma':
        abilityScore = character.charisma || 10;
        abilityName = 'Харизма';
        break;
    }
    
    // Calculate modifier
    const mod = Math.floor((abilityScore - 10) / 2);
    
    // Roll the dice with the modifier
    return rollDice(20, 1, mod, `${abilityName} (${mod >= 0 ? '+' + mod : mod})`);
  };

  // Handle custom roll
  const handleCustomRoll = () => {
    const mod = parseInt(customModifier) || 0;
    const sides = parseInt(diceType.replace('d', ''));
    
    rollDice(sides, diceCount, mod, `Custom ${diceCount}${diceType}${mod > 0 ? '+' + mod : mod < 0 ? mod : ''}`);
  };

  // Increment/decrement dice count
  const changeDiceCount = (increment: boolean) => {
    if (increment && diceCount < 20) {
      setDiceCount(diceCount + 1);
    } else if (!increment && diceCount > 1) {
      setDiceCount(diceCount - 1);
    }
  };

  // Get dice icon based on result
  const getDiceIcon = (result: number) => {
    switch (result) {
      case 1: return <Dice1 className="h-6 w-6" />;
      case 2: return <Dice2 className="h-6 w-6" />;
      case 3: return <Dice3 className="h-6 w-6" />;
      case 4: return <Dice4 className="h-6 w-6" />;
      case 5: return <Dice5 className="h-6 w-6" />;
      case 6: return <Dice6 className="h-6 w-6" />;
      default: return result;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Бросок костей</span>
          {total !== null && (
            <div className="text-2xl font-bold">{total}</div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Last Roll Results */}
        {lastRoll.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 p-2 bg-secondary/30 rounded-md">
            {lastRoll.map((roll, i) => (
              <span 
                key={i} 
                className={`inline-flex items-center justify-center h-8 w-8 rounded-md 
                  ${roll === 1 ? 'bg-red-500 text-white' : roll === 20 ? 'bg-green-500 text-white' : 'bg-secondary'}`
                }
              >
                {diceType === 'd6' ? getDiceIcon(roll) : roll}
              </span>
            ))}
          </div>
        )}
        
        {/* Ability Rolls */}
        {!compactMode && (
          <div className="grid grid-cols-3 gap-1 mb-3">
            {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
              <Button 
                key={ability} 
                variant="outline" 
                size="sm"
                onClick={() => rollAbility(ability)}
                className="text-xs py-1 h-auto"
              >
                {ability}
              </Button>
            ))}
          </div>
        )}
        
        {/* Dice Type Selection */}
        <div className="grid grid-cols-6 gap-1 mb-3">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
            <Button
              key={dice}
              variant={diceType === dice ? "default" : "outline"}
              size="sm"
              onClick={() => setDiceType(dice)}
              className="text-xs py-1 h-auto"
            >
              {dice}
            </Button>
          ))}
        </div>
        
        {/* Dice Count */}
        <div className="flex items-center mb-3 gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => changeDiceCount(false)}
          >
            <ChevronsDown className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 text-center">
            {diceCount} {diceType}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => changeDiceCount(true)}
          >
            <ChevronsUp className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Modifier */}
        <div className="flex items-center mb-3">
          <span className="mr-2">Модификатор:</span>
          <input
            type="text"
            value={customModifier}
            onChange={(e) => setCustomModifier(e.target.value)}
            placeholder="0"
            className="w-12 h-8 px-2 bg-background border rounded-md text-center"
          />
        </div>
        
        {/* Roll Button */}
        <Button 
          className="w-full" 
          onClick={handleCustomRoll}
        >
          Бросить {diceCount}{diceType}{customModifier && parseInt(customModifier) > 0 ? '+' + customModifier : customModifier}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DicePanel;
