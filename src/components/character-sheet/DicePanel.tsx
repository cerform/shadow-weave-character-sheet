
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
  const [diceCount] = useState(1);
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
    // Используем разные цвета для разных типов кубиков
    let diceColor;
    switch (diceType) {
      case 'd4': diceColor = '#B0E0E6'; break;
      case 'd6': diceColor = '#98FB98'; break;
      case 'd8': diceColor = '#FFA07A'; break;
      case 'd10': diceColor = '#DDA0DD'; break;
      case 'd12': diceColor = '#FFD700'; break;
      case 'd20': diceColor = '#87CEEB'; break;
      default: diceColor = currentTheme.accent;
    }
    
    const textColor = '#000000'; // Черный текст для лучшей читаемости
    
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
          <div className="h-[220px] mb-5 bg-black/20 rounded-lg overflow-hidden relative"> {/* Увеличена высота с 180px до 220px */}
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
          
          <div className="grid grid-cols-6 gap-2 mb-4"> {/* Увеличен отступ снизу с 3 до 4 */}
            {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const).map((dice) => {
              const isActive = diceType === dice;
              // Используем те же цвета что и в 3D визуализации
              let diceColor;
              switch (dice) {
                case 'd4': diceColor = '#B0E0E6'; break;
                case 'd6': diceColor = '#98FB98'; break;
                case 'd8': diceColor = '#FFA07A'; break;
                case 'd10': diceColor = '#DDA0DD'; break;
                case 'd12': diceColor = '#FFD700'; break;
                case 'd20': diceColor = '#87CEEB'; break;
                default: diceColor = currentTheme.accent;
              }
              
              return (
                <Button 
                  key={dice}
                  variant={isActive ? "default" : "outline"} 
                  onClick={() => setDiceType(dice)} 
                  disabled={isRolling} 
                  className={`dice-button h-12 ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:text-primary hover:border-primary'}`}
                  style={{
                    backgroundColor: isActive ? diceColor : 'transparent',
                    color: isActive ? 'black' : currentTheme.textColor,
                    borderColor: `${diceColor}${isActive ? 'FF' : '40'}`,
                    boxShadow: isActive ? `0 0 8px ${diceColor}80` : 'none'
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
          <div className="grid grid-cols-2 gap-2 mb-4"> {/* Увеличен отступ снизу с 3 до 4 */}
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
              backgroundColor: isRolling ? '#888888' : (diceType === 'd4' ? '#B0E0E6' : 
                                                     diceType === 'd6' ? '#98FB98' :
                                                     diceType === 'd8' ? '#FFA07A' :
                                                     diceType === 'd10' ? '#DDA0DD' :
                                                     diceType === 'd12' ? '#FFD700' : '#87CEEB'),
              color: 'black',
              boxShadow: `0 4px 12px ${currentTheme.accent}40`,
              height: '45px', // Увеличена высота кнопки
              fontSize: '16px', // Увеличен размер шрифта
              fontWeight: 'bold'
            }}
          >
            {isRolling ? 'Бросаем...' : `Бросить ${diceType}`}
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <div className="max-h-[380px] overflow-y-auto"> {/* Увеличена высота для истории */}
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
