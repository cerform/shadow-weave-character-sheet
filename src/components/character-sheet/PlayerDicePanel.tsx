import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useSession } from '@/contexts/SessionContext';
import DiceBox3D from '@/components/dice/DiceBox3D';
import { Dices, Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerDicePanelProps {
  compactMode?: boolean;
  fixedPosition?: boolean;
}

// Предопределенные причины для бросков
const diceRollReasons = [
  { value: 'attack', label: 'Атака' },
  { value: 'skill_check', label: 'Проверка навыка' },
  { value: 'saving_throw', label: 'Спасбросок' },
  { value: 'damage', label: 'Урон' },
  { value: 'initiative', label: 'Инициатива' },
  { value: 'heal', label: 'Лечение' },
  { value: 'ability_check', label: 'Проверка характеристики' },
  { value: 'other', label: 'Другое...' }
];

export const PlayerDicePanel: React.FC<PlayerDicePanelProps> = ({
  compactMode = false,
  fixedPosition = false
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [rollReason, setRollReason] = useState<string>("attack");
  const [customReason, setCustomReason] = useState<string>("");
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [rollHistory, setRollHistory] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Используем try-catch для безопасного получения контекстов
  let socket;
  let currentSession;
  let player = null;
  let character = null;
  let characterName = "Игрок";
  
  try {
    socket = useSocket();
    currentSession = useSession()?.currentSession;
    player = currentSession?.players.find(p => p.connected) || null;
    character = player?.character || null;
    characterName = character?.name || player?.name || "Игрок";
  } catch (error) {
    // Если контекст недоступен, используем значения по умолчанию
    console.log("Контекст сокета или сессии недоступен:", error);
  }
  
  useEffect(() => {
    // Подписываемся только при наличии socket и если это собственные броски игрока
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
  
  // Функция для получения отображаемого текста причины броска
  const getReasonText = () => {
    if (rollReason === 'other') {
      return customReason || "Бросок персонажа";
    }
    const reasonObj = diceRollReasons.find(r => r.value === rollReason);
    return reasonObj ? reasonObj.label : "Бросок персонажа";
  };
  
  const handleDiceRollComplete = (result: number) => {
    setRollResult(result);
    
    // Создаем данные для истории и отправки в сокет
    const formula = `${diceCount}${diceType}${modifier >= 0 ? '+' + modifier : modifier}`;
    const reason = getReasonText();
    
    // Отправляем результат броска через сокет
    if (socket && socket.sendRoll) {
      try {
        socket.sendRoll(formula, reason);
      } catch (error) {
        console.log("Ошибка отправки броска:", error);
      }
    }
    
    // Генерируем имитацию отдельных бросков кубиков для истории
    const rolls = Array(diceCount).fill(0).map(() => 
      Math.floor(Math.random() * Number(diceType.slice(1))) + 1
    );
    
    // Результат без модификатора для истории
    const rawResult = rolls.reduce((sum, roll) => sum + roll, 0);
    
    const rollData = {
      diceType,
      diceCount,
      modifier,
      rolls,
      total: result,
      reason: reason,
      rolledBy: characterName
    };
    
    setRollHistory((prev) => [...prev.slice(-9), rollData]);
    
    // Показываем уведомление
    toast({
      title: "Кости брошены",
      description: `${formula} = ${result} (${reason})`,
      duration: 3000,
    });
  };

  return (
    <div className="player-dice-panel flex flex-col gap-5">
      <div className="dice-controls space-y-5">
        <div>
          <Label 
            className="text-base mb-3 block font-medium"
            style={{ 
              color: currentTheme.textColor || '#FFFFFF',
              textShadow: `0 0 5px ${currentTheme.accent}40`
            }}
          >
            Тип кубика:
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
              <Button
                key={dice}
                size="sm"
                variant={diceType === dice ? "default" : "outline"}
                className="h-12 text-sm px-0 font-bold"
                style={{
                  backgroundColor: diceType === dice ? currentTheme.accent : 'rgba(255,255,255,0.05)',
                  color: diceType === dice ? '#FFFFFF' : '#FFFFFF',
                  boxShadow: diceType === dice ? `0 0 10px ${currentTheme.accent}80` : 'none',
                }}
              >
                {dice}
              </Button>
            ))}
          </div>
        </div>
        
        <div 
          className="flex items-center justify-between gap-2 p-4 rounded-md"
          style={{
            backgroundColor: `${currentTheme.accent}10`,
            boxShadow: `inset 0 0 8px ${currentTheme.accent}20`
          }}
        >
          <Label 
            className="text-base whitespace-nowrap font-medium"
            style={{ color: currentTheme.textColor || '#FFFFFF' }}
          >
            Кол-во:
          </Label>
          <div className="flex items-center space-x-3">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10" 
              style={{
                color: currentTheme.textColor || 'white',
                borderColor: `${currentTheme.accent}50`
              }}
              onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span 
              className="w-8 text-xl font-bold text-center"
              style={{ 
                color: currentTheme.textColor || 'white',
                textShadow: `0 0 5px ${currentTheme.accent}70`
              }}
            >
              {diceCount}
            </span>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10"
              style={{
                color: currentTheme.textColor || 'white',
                borderColor: `${currentTheme.accent}50`
              }}
              onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className="flex items-center justify-between gap-2 p-4 rounded-md"
          style={{
            backgroundColor: `${currentTheme.accent}10`,
            boxShadow: `inset 0 0 8px ${currentTheme.accent}20`
          }}
        >
          <Label 
            className="text-base whitespace-nowrap font-medium"
            style={{ color: currentTheme.textColor || '#FFFFFF' }}
          >
            Модификатор:
          </Label>
          <div className="flex items-center space-x-3">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10"
              style={{
                color: currentTheme.textColor || 'white',
                borderColor: `${currentTheme.accent}50`
              }}
              onClick={() => setModifier(Math.max(-20, modifier - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span 
              className="w-10 text-xl font-bold text-center"
              style={{ 
                color: modifier >= 0 ? "#4ade80" : "#f87171",
                textShadow: `0 0 5px ${modifier >= 0 ? "rgba(74, 222, 128, 0.5)" : "rgba(248, 113, 113, 0.5)"}`
              }}
            >
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-10 w-10"
              style={{
                color: currentTheme.textColor || 'white',
                borderColor: `${currentTheme.accent}50`
              }}
              onClick={() => setModifier(Math.min(20, modifier + 1))}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label 
            className="text-base mb-3 block font-medium"
            style={{ 
              color: currentTheme.textColor || '#FFFFFF',
              textShadow: `0 0 5px ${currentTheme.accent}40`
            }}
          >
            Причина броска:
          </Label>
          <Select value={rollReason} onValueChange={setRollReason}>
            <SelectTrigger 
              className="h-12 border-white/30"
              style={{
                backgroundColor: `${currentTheme.accent}10`,
                color: currentTheme.textColor || 'white',
                boxShadow: `inset 0 0 8px ${currentTheme.accent}20`,
                borderColor: `${currentTheme.accent}30`
              }}
            >
              <SelectValue placeholder="Выберите причину броска" />
            </SelectTrigger>
            <SelectContent 
              style={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: `${currentTheme.accent}30`,
                color: currentTheme.textColor || 'white'
              }}
            >
              {diceRollReasons.map((reason) => (
                <SelectItem 
                  key={reason.value} 
                  value={reason.value} 
                  style={{
                    color: currentTheme.textColor || 'white'
                  }}
                >
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {rollReason === 'other' && (
            <Input 
              className="mt-3 h-12"
              style={{
                backgroundColor: `${currentTheme.accent}10`,
                color: currentTheme.textColor || 'white',
                boxShadow: `inset 0 0 8px ${currentTheme.accent}20`,
                borderColor: `${currentTheme.accent}30`
              }}
              placeholder="Укажите свою причину..." 
              value={customReason} 
              onChange={(e) => setCustomReason(e.target.value)} 
            />
          )}
        </div>
      </div>
      
      <div className="dice-box-area h-80 rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(0,0,0,0.3)',
          boxShadow: `inset 0 0 15px ${currentTheme.accent}20, 0 0 10px rgba(0,0,0,0.5)`
        }}
      >
        <DiceBox3D
          diceType={diceType}
          diceCount={diceCount}
          modifier={modifier}
          onRollComplete={handleDiceRollComplete}
          themeColor={currentTheme.accent}
        />
      </div>
      
      {rollHistory.length > 0 && (
        <div>
          <Label 
            className="text-base mb-3 block font-medium"
            style={{ 
              color: currentTheme.textColor || '#FFFFFF',
              textShadow: `0 0 5px ${currentTheme.accent}40`
            }}
          >
            История бросков:
          </Label>
          <ScrollArea 
            className="h-52 rounded-md border"
            style={{
              backgroundColor: `rgba(0,0,0,0.3)`,
              borderColor: `${currentTheme.accent}30`,
              boxShadow: `inset 0 0 10px ${currentTheme.accent}20`
            }}
          >
            <div className="p-3 space-y-3">
              {rollHistory.slice().reverse().map((roll, index) => (
                <Card 
                  key={index} 
                  className="p-3 text-base border-white/20"
                  style={{
                    backgroundColor: `${currentTheme.accent}15`,
                    borderColor: `${currentTheme.accent}30`,
                    boxShadow: `0 0 10px ${currentTheme.accent}20`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge 
                        variant="outline" 
                        className="mr-2 font-bold"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          color: currentTheme.textColor || 'white',
                          borderColor: `${currentTheme.accent}40`
                        }}
                      >
                        {roll.diceCount}{roll.diceType}{roll.modifier >= 0 ? '+' + roll.modifier : roll.modifier}
                      </Badge>
                      <span 
                        className="font-bold text-lg"
                        style={{
                          color: currentTheme.textColor || 'white',
                          textShadow: `0 0 5px ${currentTheme.accent}60`
                        }}
                      >
                        {roll.total}
                      </span>
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{
                        color: currentTheme.textColor || '#FFFFFF',
                        opacity: 0.9
                      }}
                    >
                      {roll.reason}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
