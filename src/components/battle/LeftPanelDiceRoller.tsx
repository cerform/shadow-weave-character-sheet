
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dices, Plus, Minus } from 'lucide-react';
import SimpleDiceRenderer from '@/components/dice/SimpleDiceRenderer';
import DiceBox3D from '@/components/dice/DiceBox3D';

interface LeftPanelDiceRollerProps {
  playerName?: string;
}

const LeftPanelDiceRoller: React.FC<LeftPanelDiceRollerProps> = ({ playerName }) => {
  const [modifier, setModifier] = useState<number>(0);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const { theme } = useTheme();
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const handleDiceRollComplete = (result: number) => {
    setDiceResult(result);
  };

  return (
    <Card className="w-full h-full bg-background/90 backdrop-blur-sm shadow-lg border border-primary/30">
      <ScrollArea className="h-[calc(100vh-120px)] px-4 py-4">
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
                  style={{
                    backgroundColor: diceType === dice ? currentTheme.accent : undefined,
                    color: diceType === dice ? (currentTheme.accent === '#8B5A2B' || currentTheme.accent === '#F59E0B' ? '#000' : '#fff') : undefined,
                    boxShadow: diceType === dice ? `0 0 8px ${currentTheme.accent}80` : undefined,
                  }}
                >
                  {dice}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
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
                <Minus className="h-3 w-3" />
              </Button>
              <div className="w-8 text-center font-medium bg-black/30 px-2 py-1 rounded">{diceCount}</div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setDiceCount(prev => Math.min(10, prev + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
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
                <Minus className="h-3 w-3" />
              </Button>
              <div className="w-12 text-center font-medium bg-black/30 px-2 py-1 rounded">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8" 
                onClick={() => setModifier(prev => Math.min(20, prev + 1))}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {/* 3D кубик для предпросмотра и бросков */}
          <div className="h-[200px] w-full bg-black/30 backdrop-blur-sm rounded-lg p-2 my-4">
            <DiceBox3D
              diceType={diceType}
              diceCount={diceCount}
              modifier={modifier}
              onRollComplete={handleDiceRollComplete}
              themeColor={currentTheme.accent}
            />
          </div>
          
          {diceResult !== null && (
            <div className="mt-4 p-3 bg-primary/20 border border-primary/30 rounded-lg text-center">
              <span className="text-sm font-medium">Результат:</span>
              <div className="text-2xl font-bold mt-1" style={{ color: currentTheme.accent, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {diceResult}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LeftPanelDiceRoller;
