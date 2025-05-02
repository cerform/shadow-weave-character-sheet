
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Dices } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

interface LeftPanelDiceRollerProps {
  playerName?: string;
}

const LeftPanelDiceRoller: React.FC<LeftPanelDiceRollerProps> = ({ playerName }) => {
  const [modifier, setModifier] = useState<number>(0);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rollFormula, setRollFormula] = useState<string>('');
  const [rollHistory, setRollHistory] = useState<{formula: string, result: number}[]>([]);
  const { theme } = useTheme();
  const { username } = useSessionStore();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Используем имя пользователя из сессии, если имя игрока не предоставлено
  const displayName = playerName || username || 'Игрок';

  // Функция броска кубика
  const handleRollDice = () => {
    // Симулируем броски нескольких кубиков
    let totalResult = 0;
    const rolls = [];
    
    for (let i = 0; i < diceCount; i++) {
      const max = parseInt(diceType.substring(1));
      const roll = Math.floor(Math.random() * max) + 1;
      totalResult += roll;
      rolls.push(roll);
    }
    
    // Применяем модификатор
    totalResult += modifier;
    
    const formula = `${diceCount}${diceType}${modifier >= 0 ? '+' + modifier : modifier}`;
    setRollFormula(formula);
    setRollResult(totalResult);
    
    // Добавляем в историю бросков
    setRollHistory(prev => [{formula, result: totalResult}, ...prev].slice(0, 5));
  };
  
  return (
    <Card className="w-full h-full bg-background/90 backdrop-blur-sm">
      <ScrollArea className="h-[calc(100vh-120px)] px-2">
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {/* Результаты броска */}
          <div className="w-full p-4 bg-black/30 rounded-lg text-center mb-4">
            {rollResult !== null ? (
              <div>
                <div className="text-2xl font-bold" style={{ color: currentTheme.accent }}>
                  {rollResult}
                </div>
                <div className="text-sm text-muted-foreground">
                  {displayName} бросил {rollFormula}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Бросьте кубик</div>
            )}
          </div>
          
          {/* История бросков */}
          {rollHistory.length > 0 && (
            <div className="w-full p-2 border-t border-b border-border/40 mb-2">
              <p className="text-xs text-muted-foreground mb-1">История бросков:</p>
              {rollHistory.map((roll, idx) => (
                <div key={idx} className="text-xs mb-1">
                  {roll.formula} = <span className="font-semibold">{roll.result}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col w-full space-y-4">
            <div className="text-center mb-2">
              <Label className="text-sm font-medium">
                Тип кубика:
              </Label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
                  <Button
                    key={dice}
                    size="sm"
                    variant={diceType === dice ? "default" : "outline"}
                    className="h-8 text-xs"
                    style={diceType === dice ? {
                      backgroundColor: currentTheme.accent,
                      color: currentTheme.textColor
                    } : {}}
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
            
            <Button 
              className="w-full mt-2" 
              variant="default"
              onClick={handleRollDice}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <Dices className="mr-2" size={16} />
              Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default LeftPanelDiceRoller;
