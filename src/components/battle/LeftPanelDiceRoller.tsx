import React, { useState } from 'react';
import DiceRoller3DFixed from '@/components/character-sheet/DiceRoller3DFixed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface LeftPanelDiceRollerProps {
  playerName?: string;
}

const LeftPanelDiceRoller: React.FC<LeftPanelDiceRollerProps> = ({ playerName }) => {
  const [modifier, setModifier] = useState<number>(0);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <Card className="w-full h-full bg-background/90 backdrop-blur-sm">
      <ScrollArea className="h-[calc(100vh-120px)] px-2">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="modifier" className="text-sm font-medium">
              Модификатор:
            </Label>
            <Input
              type="number"
              id="modifier"
              value={modifier.toString()}
              onChange={(e) => setModifier(parseInt(e.target.value))}
              className="w-20 text-sm"
            />
          </div>
          
          <div className="h-[200px] w-full">
            <DiceRoller3DFixed 
              modifier={modifier} 
              themeColor={currentTheme.accent}
              playerName={playerName}
            />
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LeftPanelDiceRoller;

