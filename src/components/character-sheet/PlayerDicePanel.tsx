
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
import GradientDice from '@/components/dice/GradientDice';
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
  const [isRolling, setIsRolling] = useState(false);
  
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
    setIsRolling(false);
  };
  
  const handleRoll = async () => {
    setIsRolling(true);
    
    // Симулируем броски нескольких кубиков
    const rolls = [];
    let totalResult = 0;
    
    for (let i = 0; i < diceCount; i++) {
      const roll = Math.floor(Math.random() * Number(diceType.slice(1))) + 1;
      rolls.push(roll);
      totalResult += roll;
    }
    
    // Добавляем модификатор к общему результату
    totalResult += modifier;
    
    const formula = `${diceCount}${diceType}${modifier >= 0 ? '+' + modifier : modifier}`;
    const reason = getReasonText();
    
    // Отправляем результат броска через сокет только если соединение доступно
    if (socket && socket.sendRoll) {
      try {
        socket.sendRoll(formula, reason);
      } catch (error) {
        console.log("Ошибка отправки броска:", error);
      }
    }
    
    const rollData = {
      diceType,
      diceCount,
      modifier,
      rolls,
      total: totalResult,
      reason: reason,
      rolledBy: characterName
    };
    
    setRollHistory((prev) => [...prev.slice(-9), rollData]);
    setRollResult(totalResult);
    
    // Задержка для имитации броска кубика
    setTimeout(() => {
      setIsRolling(false);
      
      toast({
        title: "Бросок успешен",
        description: `${characterName} бросил ${diceCount}${diceType} + ${modifier} = ${totalResult} (${reason})`,
      });
    }, 800);
  };
  
  // Вычисляем высоту для 3D кубика в зависимости от режима
  const diceContainerHeight = compactMode ? '200px' : '220px';

  // Стили для улучшения контрастности
  const buttonStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    border: `1px solid ${currentTheme.accent}`,
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
  };
  
  const selectedButtonStyle = {
    backgroundColor: currentTheme.accent,
    color: '#FFFFFF',
    fontWeight: 'bold',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
  };
  
  const inputStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    border: `1px solid ${currentTheme.accent}60`
  };
  
  const counterStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
    border: `1px solid ${currentTheme.accent}60`
  };
  
  const textStyle = {
    color: '#FFFFFF',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 1)'
  };
  
  return (
    <Card className="p-4 bg-black/80 backdrop-blur-sm border-white/20">
      <div className="space-y-4">
        {/* Кнопки типов кубиков в ряд */}
        <div className="grid grid-cols-6 gap-1">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
            <Button
              key={dice}
              size="sm"
              variant={diceType === dice ? "default" : "outline"}
              className={`h-10 px-2 flex items-center justify-center ${diceType === dice ? 'font-semibold' : ''}`}
              style={diceType === dice ? selectedButtonStyle : buttonStyle}
              onClick={() => setDiceType(dice as any)}
            >
              {dice}
            </Button>
          ))}
        </div>
        
        {/* Секция настройки броска */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Количество кубиков */}
            <div className="flex items-center gap-1">
              <Label className="text-xs text-white font-medium" style={textStyle}>Кол-во:</Label>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 w-8" 
                style={buttonStyle}
                onClick={() => setDiceCount(prev => Math.max(1, prev - 1))}
              >
                <Minus size={14} />
              </Button>
              <div className="flex items-center border rounded px-2 min-w-[30px] justify-center" style={counterStyle}>
                <span className="text-sm text-white">{diceCount}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 w-8" 
                style={buttonStyle}
                onClick={() => setDiceCount(prev => Math.min(10, prev + 1))}
              >
                <Plus size={14} />
              </Button>
            </div>
            
            {/* Модификатор броска */}
            <div className="flex items-center gap-1 ml-2">
              <Label className="text-xs text-white font-medium" style={textStyle}>Мод:</Label>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 w-8" 
                style={buttonStyle} 
                onClick={() => setModifier(prev => Math.max(-20, prev - 1))}
              >
                <Minus size={14} />
              </Button>
              <div className="flex items-center border rounded px-2 min-w-[40px] justify-center" style={counterStyle}>
                <span className="text-sm text-white">{modifier >= 0 ? '+' : ''}{modifier}</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-2 h-8 w-8" 
                style={buttonStyle}
                onClick={() => setModifier(prev => Math.min(20, prev + 1))}
              >
                <Plus size={14} />
              </Button>
            </div>
            
            <div className="ml-auto">
              <Label 
                htmlFor="roll-reason" 
                className="text-xs mb-1 block text-white font-medium"
                style={textStyle}
              >
                Причина броска:
              </Label>
              <Select value={rollReason} onValueChange={setRollReason}>
                <SelectTrigger className="h-8 w-[150px] text-xs text-white" style={inputStyle}>
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 text-white border-white/30">
                  {diceRollReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value} className="text-white hover:bg-white/10">
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {rollReason === 'other' && (
            <Input
              type="text"
              placeholder="Опишите причину броска..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="h-8 text-xs mt-1"
              style={inputStyle}
            />
          )}
          
          {/* Градиентные кубики в центре */}
          <div 
            className="mb-4 bg-black/90 rounded-lg overflow-hidden relative flex items-center justify-center" 
            style={{ 
              height: diceContainerHeight, 
              zIndex: fixedPosition ? 1 : 'auto',
              border: `1px solid ${currentTheme.accent}40`
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <GradientDice 
                diceType={diceType}
                size={120}
                rolling={isRolling}
                result={rollResult}
                showNumber={true}
              />
            </div>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary/80"
            style={{ 
              backgroundColor: currentTheme.accent,
              color: '#FFFFFF',
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)'
            }}
            onClick={handleRoll}
          >
            <Dices className="mr-2" size={16} />
            Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
          </Button>
        </div>
        
        {/* История бросков */}
        {rollHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white" style={textStyle}>
                Ваши броски
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-white hover:bg-white/10"
                onClick={() => setRollHistory([])}
              >
                Очистить
              </Button>
            </div>
            <ScrollArea className="h-32 rounded border p-2 bg-black/90 border-white/30">
              <div className="space-y-2">
                {rollHistory.map((roll, index) => (
                  <div 
                    key={index} 
                    className="text-sm p-1 border-b border-dashed flex justify-between items-center border-white/30"
                  >
                    <div className="text-white">
                      <span className="font-medium">{roll.diceCount}{roll.diceType}</span>
                      {roll.modifier !== 0 && (
                        <span>{roll.modifier > 0 ? ' +' : ' '}{roll.modifier}</span>
                      )}
                      {roll.reason && (
                        <span className="text-white/80 ml-1">
                          ({roll.reason})
                        </span>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      className="border-white/50 text-white bg-black/50"
                    >
                      {Array.isArray(roll.rolls) 
                        ? roll.rolls.join(', ') 
                        : roll.result} = {roll.total}
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
