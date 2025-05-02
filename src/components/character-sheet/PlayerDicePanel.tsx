
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSession } from '@/contexts/SessionContext';
import DiceRoller3DFixed from './DiceRoller3DFixed';

interface PlayerDicePanelProps {
  compactMode?: boolean;
  fixedPosition?: boolean;
}

export const PlayerDicePanel: React.FC<PlayerDicePanelProps> = ({
  compactMode = false,
  fixedPosition = false
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [modifier, setModifier] = useState<number>(0);
  const [rollReason, setRollReason] = useState<string>('');
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const socket = useSocket();
  const { currentSession } = useSession();
  
  const player = currentSession?.players.find(p => p.connected) || null;
  const character = player?.character || null;
  const characterName = character?.name || player?.name || "Игрок";
  
  useEffect(() => {
    // Подписываемся только на собственные броски игрока
    if (socket?.socketService) {
      const unsubscribe = socket.socketService.on('receive-roll', (data) => {
        // Проверяем, что это бросок текущего игрока
        if (data.rolledBy === characterName) {
          setRollHistory((prev) => [...prev.slice(-9), data]);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
    
    return () => {};
  }, [socket, characterName]);
  
  const handleDiceRollComplete = (result: number) => {
    setRollResult(result);
  };
  
  const handleRoll = async () => {
    const totalResult = rollResult !== null ? rollResult + modifier : Math.floor(Math.random() * Number(diceType.slice(1))) + 1 + modifier;
    
    const formula = `1${diceType}${modifier >= 0 ? '+' + modifier : modifier}`;
    const reason = rollReason || "Бросок персонажа";
    
    // Отправляем результат броска через сокет
    if (socket && socket.sendRoll) {
      socket.sendRoll(formula, reason);
    }
    
    const rollData = {
      diceType,
      modifier,
      result: totalResult - modifier,
      total: totalResult,
      reason: reason,
      rolledBy: characterName
    };
    
    setRollHistory((prev) => [...prev.slice(-9), rollData]);
    
    toast({
      title: "Бросок успешен",
      description: `${characterName} бросил ${diceType} + ${modifier} = ${totalResult}`,
    });
  };
  
  // Вычисляем высоту для 3D кубика в зависимости от режима
  const diceContainerHeight = compactMode ? '200px' : '220px';
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <div className="space-y-4">
        {/* Кнопки типов кубиков в ряд */}
        <div className="grid grid-cols-6 gap-1">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
            <Button
              key={dice}
              size="sm"
              variant={diceType === dice ? "default" : "outline"}
              className="h-10 px-2 flex items-center justify-center"
              onClick={() => setDiceType(dice as any)}
              style={{
                backgroundColor: diceType === dice ? `rgba(${currentTheme.accent}, 0.7)` : 'rgba(0, 0, 0, 0.2)',
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              {dice}
            </Button>
          ))}
        </div>
        
        {/* Секция настройки броска */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Модификатор броска */}
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 min-w-8" 
                onClick={() => setModifier(prev => Math.max(-20, prev - 1))}
                style={{
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >-</Button>
              <div 
                className="flex items-center border rounded px-2 min-w-[50px] justify-center"
                style={{
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >
                <span className="text-sm">{modifier >= 0 ? '+' : ''}{modifier}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 min-w-8" 
                onClick={() => setModifier(prev => Math.min(20, prev + 1))}
                style={{
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              >+</Button>
            </div>
            
            <div className="ml-auto">
              <Label 
                htmlFor="roll-reason" 
                className="text-xs mr-2"
                style={{ color: currentTheme.textColor }}
              >
                Причина броска:
              </Label>
              <Input
                id="roll-reason"
                type="text"
                placeholder="Опишите цель броска..."
                value={rollReason}
                onChange={(e) => setRollReason(e.target.value)}
                className="h-8 w-[150px] text-xs"
                style={{
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor
                }}
              />
            </div>
          </div>
          
          {/* 3D кубик в центре */}
          <div 
            className="mb-4 bg-black/70 rounded-lg overflow-hidden relative flex items-center justify-center" 
            style={{ height: diceContainerHeight, zIndex: fixedPosition ? 1 : 'auto' }}
          >
            <DiceRoller3DFixed 
              initialDice={diceType}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceRollComplete}
              fixedPosition={fixedPosition}
              themeColor={currentTheme.accent}
            />
          </div>
          
          <Button 
            className="w-full"
            onClick={handleRoll}
            style={{
              backgroundColor: `rgba(${currentTheme.accent}, 0.7)`,
              color: currentTheme.textColor
            }}
          >
            Бросить {diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''} от имени {characterName}
          </Button>
        </div>
        
        {/* История бросков */}
        {rollHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 
                className="text-sm font-medium"
                style={{ color: currentTheme.textColor }}
              >
                Ваши броски
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setRollHistory([])}
                style={{ color: currentTheme.textColor }}
              >
                Очистить
              </Button>
            </div>
            <ScrollArea className="h-32 rounded border p-2" style={{ borderColor: currentTheme.accent, background: 'rgba(0, 0, 0, 0.3)' }}>
              <div className="space-y-2">
                {rollHistory.map((roll, index) => (
                  <div 
                    key={index} 
                    className="text-sm p-1 border-b border-dashed flex justify-between items-center"
                    style={{ borderColor: `rgba(${currentTheme.accent}, 0.3)` }}
                  >
                    <div style={{ color: currentTheme.textColor }}>
                      <span className="font-medium">{roll.diceType}</span>
                      {roll.modifier !== 0 && (
                        <span>{roll.modifier > 0 ? ' +' : ' '}{roll.modifier}</span>
                      )}
                      {roll.reason && (
                        <span className="text-muted-foreground ml-1">
                          ({roll.reason})
                        </span>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: currentTheme.accent,
                        color: currentTheme.textColor
                      }}
                    >
                      {roll.result} = {roll.total}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlayerDicePanel;
