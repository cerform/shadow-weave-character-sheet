
import React, { useState } from 'react';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dices } from 'lucide-react';

interface LeftPanelDiceRollerProps {
  playerName?: string;
}

const LeftPanelDiceRoller: React.FC<LeftPanelDiceRollerProps> = ({ playerName }) => {
  const [modifier, setModifier] = useState<number>(0);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Dummy function for onClose that's required by DiceRoller3DFixed
  const handleClose = () => {
    // This is just a placeholder since we're not actually closing anything in this context
    console.log("DiceRoller close button clicked (no action needed)");
  };
  
  return (
    <Card className="w-full h-full bg-background/90 backdrop-blur-sm">
      <ScrollArea className="h-[calc(100vh-120px)] px-2">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium">
              Тип кубика:
            </Label>
            <div className="grid grid-cols-3 gap-1">
              {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
                <Button
                  key={dice}
                  size="sm"
                  variant={diceType === dice ? "default" : "outline"}
                  className="h-8 text-xs"
                  onClick={() => setDiceType(dice as any)}
                >
                  {dice}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="diceCount" className="text-sm font-medium">
              Количество:
            </Label>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setDiceCount(prev => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <div className="w-8 text-center">{diceCount}</div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setDiceCount(prev => Math.min(10, prev + 1))}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="modifier" className="text-sm font-medium">
              Модификатор:
            </Label>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setModifier(prev => Math.max(-20, prev - 1))}
              >
                -
              </Button>
              <div className="w-8 text-center">{modifier >= 0 ? `+${modifier}` : modifier}</div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setModifier(prev => Math.min(20, prev + 1))}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <DiceRoller3DFixed 
              initialDice={diceType}
              modifier={modifier} 
              themeColor={currentTheme.accent}
              playerName={playerName}
              diceCount={diceCount}
              onClose={handleClose} // Add the required onClose prop
            />
          </div>
          
          <Button 
            className="w-full mt-2" 
            variant="default"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <Dices className="mr-2" size={16} />
            Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
          </Button>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LeftPanelDiceRoller;
