
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useSocket } from '@/contexts/SocketContext';

interface DicePanelProps {
  isDM?: boolean;
  useDmMode?: boolean;
  selectedTokenId?: number | null;
  tokens?: any[];
  setSelectedTokenId?: (id: number | null) => void;
  compactMode?: boolean;
  fixedPosition?: boolean;
}

const predefinedRollReasons = [
  { value: 'attack', label: 'Атака' },
  { value: 'skill_check', label: 'Проверка навыка' },
  { value: 'saving_throw', label: 'Спасбросок' },
  { value: 'initiative', label: 'Инициатива' },
  { value: 'custom', label: 'Другое' },
];

export const DicePanel: React.FC<DicePanelProps> = ({
  isDM = false,
  useDmMode = false,
  selectedTokenId = null,
  tokens = [],
  setSelectedTokenId = () => {},
  compactMode = false,
  fixedPosition = false
}) => {
  const [diceCount] = useState(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [modifier, setModifier] = useState<number>(0);
  const [rollMessage, setRollMessage] = useState<string>('');
  const [rollReason, setRollReason] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [useCustomReason, setUseCustomReason] = useState<boolean>(false);
  const [rollHistory, setRollHistory] = useState<any[]>([]);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const { toast } = useToast();
  
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const socket = useSocket();
  
  const handleDiceRollComplete = (result: number) => {
    setRollResult(result);
  };
  
  useEffect(() => {
    // Создаем обработчик бросков кубиков
    const handleRoll = (data: any) => {
      setRollHistory((prev) => [...prev, data]);
    };
    
    // Подключаемся к событиям получения бросков через socketService
    const socketService = socket?.socketService;
    if (socketService && socketService.on) {
      const unsubscribe = socketService.on('receive-roll', handleRoll);
      
      return () => {
        // Используем возвращаемую функцию отписки
        unsubscribe();
      };
    }
    
    return () => {};
  }, [socket]);
  
  const handleRoll = async () => {
    const diceRoll = Math.floor(Math.random() * Number(diceType.slice(1))) + 1;
    const totalResult = diceRoll + modifier;
    
    setRollResult(totalResult);
    
    const reason = useCustomReason ? rollReason : predefinedRollReasons.find(r => r.value === rollReason)?.label || 'Бросок';
    
    const rollData = {
      diceCount,
      diceType,
      modifier,
      result: diceRoll,
      total: totalResult,
      reason: reason,
      message: rollMessage,
      rolledBy: selectedTokenId ? tokens.find(t => t.id === selectedTokenId)?.name : 'Мастер',
    };
    
    setRollHistory((prev) => [...prev, rollData]);
    
    if (socket && socket.sendRoll) {
      // Используем метод sendRoll из контекста для отправки броска
      const formula = `${diceCount}${diceType}${modifier >= 0 ? '+' + modifier : modifier}`;
      socket.sendRoll(formula, reason);
    }
    
    toast({
      title: "Бросок успешен",
      description: `Вы бросили ${diceCount}${diceType} + ${modifier} = ${totalResult}`,
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
              <Button size="sm" variant="outline" className="px-2 h-8 min-w-8" onClick={() => setModifier(prev => Math.max(-20, prev - 1))}>-</Button>
              <div className="flex items-center border bg-background/50 rounded px-2 min-w-[50px]">
                <span className="text-sm">{modifier >= 0 ? '+' : ''}{modifier}</span>
              </div>
              <Button size="sm" variant="outline" className="px-2 h-8 min-w-8" onClick={() => setModifier(prev => Math.min(20, prev + 1))}>+</Button>
            </div>
            
            {/* Диалог дополнительных настроек */}
            <div className="ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
                      {showDetails ? 'Скрыть' : 'Опции'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Дополнительные опции броска</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* 3D кубик в центре */}
          <div 
            className="mb-4 bg-black/70 rounded-lg overflow-hidden relative flex items-center justify-center" 
            style={{ height: diceContainerHeight, zIndex: fixedPosition ? 1 : 'auto' }}
          >
            <DiceRoller3D 
              initialDice={diceType}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceRollComplete}
              fixedPosition={fixedPosition}
            />
          </div>
          
          {/* Дополнительные настройки */}
          {showDetails && (
            <div className="p-2 bg-background/50 rounded border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-reason">Своя причина броска</Label>
                  <Switch 
                    id="custom-reason" 
                    checked={useCustomReason} 
                    onCheckedChange={setUseCustomReason} 
                  />
                </div>
                
                {useCustomReason ? (
                  <Input 
                    type="text" 
                    placeholder="Причина броска..." 
                    value={rollReason} 
                    onChange={(e) => setRollReason(e.target.value)}
                  />
                ) : (
                  <Select value={rollReason} onValueChange={setRollReason}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите причину броска" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedRollReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Input 
                  type="text" 
                  placeholder="Сообщение (опционально)" 
                  value={rollMessage} 
                  onChange={(e) => setRollMessage(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {/* Кнопка броска и выбор от имени кого */}
          <div className="flex flex-col gap-2">
            {(useDmMode || isDM) && tokens.length > 0 && (
              <Select 
                value={selectedTokenId ? String(selectedTokenId) : "dm"}
                onValueChange={(value) => {
                  if (value === "dm") {
                    setSelectedTokenId(null);
                  } else {
                    setSelectedTokenId(Number(value));
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="От имени..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dm">Мастер</SelectItem>
                  {tokens.map((token) => (
                    <SelectItem key={token.id} value={String(token.id)}>
                      {token.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button 
              className="w-full bg-primary/90 hover:bg-primary"
              onClick={handleRoll}
            >
              Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
            </Button>
          </div>
        </div>
        
        {/* История бросков */}
        {rollHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">История бросков</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setRollHistory([])}
              >
                Очистить
              </Button>
            </div>
            <ScrollArea className="h-32 rounded border bg-background/50 p-2">
              <div className="space-y-2">
                {rollHistory.map((roll, index) => (
                  <div key={index} className="text-sm p-1 border-b border-dashed flex justify-between items-center">
                    <div>
                      <span className="font-medium">{roll.diceCount}{roll.diceType}</span>
                      {roll.modifier !== 0 && (
                        <span>{roll.modifier > 0 ? ' +' : ' '}{roll.modifier}</span>
                      )}
                      {roll.rolledBy && (
                        <span className="text-muted-foreground ml-1">
                          ({roll.rolledBy})
                        </span>
                      )}
                    </div>
                    <Badge variant="outline">
                      {roll.result}
                      {roll.modifier !== 0 && (
                        <> = {roll.result + roll.modifier}</>
                      )}
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
