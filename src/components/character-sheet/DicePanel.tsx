
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRoller3D } from '../dice/DiceRoller3D';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

type DiceRollRecord = {
  id: number;
  playerName: string;
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  result: number;
  modifier: number;
  total: number;
  timestamp: Date;
  reason?: string;
};

export const DicePanel = () => {
  const [diceCount] = useState(1); // В будущем можно добавить поддержку нескольких кубиков
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [modifier, setModifier] = useState(0);
  const [rollsHistory, setRollsHistory] = useState<DiceRollRecord[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [reason, setReason] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  const { toast } = useToast();
  
  // Компонент дайса для отображения в результате
  const DiceIcon = ({ value, diceType, size = 30 }: { value: number, diceType: string, size?: number }) => {
    const diceColor = currentTheme.accent;
    const textColor = currentTheme.textColor || '#FFFFFF';
    
    return (
      <div 
        className="inline-flex items-center justify-center font-bold rounded-md"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: diceColor,
          color: textColor,
          boxShadow: `0 2px 8px ${diceColor}80`
        }}
      >
        <div className="transform scale-90">{value}</div>
      </div>
    );
  };
  
  // Обработчик результата броска из 3D компонента
  const handleDiceResult = (value: number) => {
    const finalTotal = value + modifier;
    
    // Сохраняем результат броска в историю
    const newRoll: DiceRollRecord = { 
      id: Date.now(),
      playerName: playerName || 'Игрок',
      diceType, 
      result: value,
      modifier,
      total: finalTotal,
      timestamp: new Date(),
      reason: reason || undefined
    };
    
    setRollsHistory(prev => [newRoll, ...prev]);
    
    // Показываем уведомление с результатом
    toast({
      title: `${playerName || 'Игрок'} бросает ${diceType}`,
      description: reason ? 
        `${reason}: ${value}${modifier !== 0 ? ` + ${modifier} = ${finalTotal}` : ''}` : 
        `Результат: ${value}${modifier !== 0 ? ` + ${modifier} = ${finalTotal}` : ''}`,
    });
    
    setIsRolling(false);
  };
  
  const handleRoll = () => {
    setIsRolling(true);
  };
  
  // Загружаем историю из localStorage при монтировании
  useEffect(() => {
    const savedHistory = localStorage.getItem('diceRollsHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setRollsHistory(parsedHistory);
      } catch (e) {
        console.error('Failed to parse dice roll history', e);
      }
    }
  }, []);
  
  // Сохраняем историю в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('diceRollsHistory', JSON.stringify(rollsHistory.slice(0, 50))); // Сохраняем только последние 50 записей
  }, [rollsHistory]);
  
  // Форматирование времени для отображения в истории
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <Tabs defaultValue="dice" className="w-full">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="dice" className="w-1/2">Кубики</TabsTrigger>
          <TabsTrigger value="history" className="w-1/2">История</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dice" className="mt-0">
          <div className="h-[180px] mb-4 bg-black/20 rounded-lg overflow-hidden relative">
            <DiceRoller3D 
              initialDice={diceType}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceResult}
              themeColor={currentTheme.accent}
              fixedPosition={true}
              playerName={playerName || undefined}
            />
          </div>
          
          <div className="mb-3">
            <label className="text-sm text-foreground">Имя игрока:</label>
            <Input 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              placeholder="Введите имя"
              className="w-full mt-1 text-foreground bg-black/20 border-primary/30"
            />
          </div>
          
          <div className="grid grid-cols-6 gap-2 mb-3">
            {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const).map((dice) => {
              const isActive = diceType === dice;
              
              return (
                <Button 
                  key={dice}
                  variant={isActive ? "default" : "outline"} 
                  onClick={() => setDiceType(dice)} 
                  disabled={isRolling} 
                  className={`dice-button h-12 ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:text-primary hover:border-primary'}`}
                  style={{
                    backgroundColor: isActive ? currentTheme.accent : 'transparent',
                    color: isActive ? currentTheme.textColor : currentTheme.textColor,
                    borderColor: `${currentTheme.accent}${isActive ? 'FF' : '40'}`,
                    boxShadow: isActive ? `0 0 8px ${currentTheme.accent}80` : 'none'
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm">{dice}</span>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {/* Модификаторы */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-sm text-foreground">Причина броска:</label>
              <Input 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="Например: Атака мечом"
                className="w-full mt-1 text-foreground bg-black/20 border-primary/30"
              />
            </div>
            <div>
              <label className="text-sm text-foreground">Модификатор:</label>
              <Input 
                type="number" 
                value={modifier} 
                onChange={(e) => setModifier(Number(e.target.value))} 
                className="w-full mt-1 text-foreground bg-black/20 border-primary/30"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleRoll} 
            className="w-full dice-button" 
            disabled={isRolling}
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.textColor,
              boxShadow: `0 4px 12px ${currentTheme.accent}40`
            }}
          >
            {isRolling ? 'Бросаем...' : `Бросить ${diceType}`}
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <div className="max-h-[350px] overflow-y-auto">
            {rollsHistory.length > 0 ? rollsHistory.map((roll) => (
              <div 
                key={roll.id} 
                className="text-sm p-2 flex flex-col"
                style={{ borderBottom: `1px solid ${currentTheme.accent}10` }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{roll.playerName}</span>
                  <span className="text-xs text-muted-foreground">{formatTime(new Date(roll.timestamp))}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center">
                    <DiceIcon value={roll.result} diceType={roll.diceType} />
                    {roll.modifier !== 0 && (
                      <span className="ml-1 text-xs">{roll.modifier > 0 ? '+' : ''}{roll.modifier}</span>
                    )}
                    {roll.reason && (
                      <span className="ml-2 text-xs text-muted-foreground">({roll.reason})</span>
                    )}
                  </div>
                  <span 
                    className="font-medium"
                    style={{ color: currentTheme.accent }}
                  >{roll.total}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-muted-foreground">
                История бросков пуста
              </div>
            )}
          </div>
          
          {rollsHistory.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3" 
              onClick={() => {
                setRollsHistory([]);
                localStorage.removeItem('diceRollsHistory');
                toast({
                  title: "История бросков очищена",
                });
              }}
            >
              Очистить историю
            </Button>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
