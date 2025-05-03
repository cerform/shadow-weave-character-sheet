
import React, { useState } from 'react';
import DiceRoller3DFixed from '@/components/character-sheet/DiceRoller3DFixed';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dices } from 'lucide-react';
import SimpleDiceRenderer from '@/components/dice/SimpleDiceRenderer';

interface LeftPanelDiceRollerProps {
  playerName?: string;
}

const LeftPanelDiceRoller: React.FC<LeftPanelDiceRollerProps> = ({ playerName }) => {
  const [modifier, setModifier] = useState<number>(0);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [previewDice, setPreviewDice] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const { theme } = useTheme();
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Обновляем превью кубика при изменении типа
  const handleDiceTypeChange = (type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20') => {
    setDiceType(type);
    setPreviewDice(type);
  };

  // Функция для броска кубика
  const rollDice = () => {
    let total = 0;
    for (let i = 0; i < diceCount; i++) {
      // Получаем макс. значение кубика (например, для d6 это 6)
      const max = parseInt(diceType.substring(1));
      total += Math.floor(Math.random() * max) + 1;
    }
    // Добавляем модификатор
    total += modifier;
    setDiceResult(total);
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
                  onClick={() => handleDiceTypeChange(dice as any)}
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
                -
              </Button>
              <div className="w-8 text-center font-medium bg-black/30 px-2 py-1 rounded">{diceCount}</div>
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
                -
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
                +
              </Button>
            </div>
          </div>
          
          {/* Заменяем DiceRoller3DFixed на SimpleDiceRenderer для предпросмотра */}
          <div className="h-[200px] w-full flex justify-center items-center bg-black/30 backdrop-blur-sm rounded-lg p-4 my-4">
            <SimpleDiceRenderer
              type={previewDice}
              size={120}
              themeColor={currentTheme.accent}
              result={diceResult !== null ? diceResult : undefined}
            />
          </div>
          
          <Button 
            className="w-full mt-2" 
            variant="default"
            onClick={rollDice}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.accent === '#8B5A2B' || currentTheme.accent === '#F59E0B' ? '#000' : '#fff',
              boxShadow: `0 0 10px ${currentTheme.accent}50`
            }}
          >
            <Dices className="mr-2" size={16} />
            Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
          </Button>

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
