
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRoller3D } from '../dice/DiceRoller3D';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from '@/contexts/SocketContext';
import { useSession } from '@/contexts/SessionContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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

interface DicePanelProps {
  useDmMode?: boolean;
  selectedTokenId?: number | null;
  tokens?: any[];
}

// Предопределенные причины бросков
const rollReasons = [
  { value: "attack", label: "Бросок атаки" },
  { value: "damage", label: "Бросок урона" },
  { value: "saving", label: "Спасбросок" },
  { value: "skill", label: "Проверка навыка" },
  { value: "ability", label: "Проверка характеристики" },
  { value: "initiative", label: "Инициатива" },
  { value: "death", label: "Спасбросок от смерти" },
  { value: "other", label: "Другое" }
];

export const DicePanel: React.FC<DicePanelProps> = ({ 
  useDmMode = false,
  selectedTokenId = null,
  tokens = []
}) => {
  const [diceCount] = useState(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [modifier, setModifier] = useState(0);
  const [rollsHistory, setRollsHistory] = useState<DiceRollRecord[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [isRolling, setIsRolling] = useState(false);
  const [lastRollResult, setLastRollResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  const { toast } = useToast();
  const { sessionData } = useSocket();
  const { currentSession } = useSession();
  
  // Определяем имя игрока из выбранного токена или из введенного имени
  const getActivePlayerName = () => {
    if (useDmMode && selectedTokenId && tokens) {
      const selectedToken = tokens.find((token: any) => token.id === selectedTokenId);
      if (selectedToken) {
        return selectedToken.name;
      }
    }
    
    // Если это режим DM и нет выбранного токена, используем "DM"
    if (useDmMode) {
      return "DM";
    }
    
    // В обычном режиме используем введенное имя или "Игрок"
    return playerName || 'Игрок';
  };
  
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
    setLastRollResult(value);
    
    const effectivePlayerName = getActivePlayerName();
    
    // Получаем название причины броска из выбранной опции
    const reasonText = selectedReason 
      ? rollReasons.find(r => r.value === selectedReason)?.label || selectedReason
      : reason;
    
    // Сохраняем результат броска в историю
    const newRoll: DiceRollRecord = { 
      id: Date.now(),
      playerName: effectivePlayerName,
      diceType, 
      result: value,
      modifier,
      total: finalTotal,
      timestamp: new Date(),
      reason: reasonText || undefined
    };
    
    setRollsHistory(prev => [newRoll, ...prev]);
    
    // Показываем уведомление с результатом
    toast({
      title: `${effectivePlayerName} бросает ${diceType}`,
      description: reasonText ? 
        `${reasonText}: ${value}${modifier !== 0 ? ` + ${modifier} = ${finalTotal}` : ''}` : 
        `Результат: ${value}${modifier !== 0 ? ` + ${modifier} = ${finalTotal}` : ''}`,
    });
    
    setIsRolling(false);
  };
  
  const handleRoll = () => {
    setIsRolling(true);
    setLastRollResult(null); // Сбрасываем предыдущий результат
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

  // Определяем цвет для текущего типа кубика
  const getDiceColor = (type: string) => {
    switch (type) {
      case 'd4': return '#B0E0E6';
      case 'd6': return '#98FB98';
      case 'd8': return '#FFA07A';
      case 'd10': return '#DDA0DD';
      case 'd12': return '#FFD700';
      case 'd20': return '#87CEEB';
      default: return currentTheme.accent;
    }
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <Tabs defaultValue="dice" className="w-full">
        <TabsList className="w-full mb-2">
          <TabsTrigger value="dice" className="w-1/2">Кубики</TabsTrigger>
          <TabsTrigger value="history" className="w-1/2">История</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dice" className="mt-0">
          <div className="h-[300px] mb-8 bg-black/70 rounded-lg overflow-hidden relative">
            <DiceRoller3D 
              initialDice={diceType}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceResult}
              themeColor={getDiceColor(diceType)}
              fixedPosition={true}
              playerName={getActivePlayerName()}
            />
          </div>

          {/* Результат броска с увеличенным отступом */}
          <div className="mb-8 p-5 bg-black/80 rounded-xl border text-center"
               style={{ borderColor: isRolling ? '#888888' : getDiceColor(diceType), width: '100%' }}>
            <div className="text-sm text-white/70 mb-2">Результат</div>
            {isRolling ? (
              <div className="text-3xl font-bold animate-pulse py-1">Бросаем...</div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-1">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-bold">{lastRollResult}</span>
                  {modifier !== 0 && lastRollResult !== null && (
                    <>
                      <span className="text-2xl text-white/70">{modifier > 0 ? '+' : ''}{modifier}</span>
                      <span className="text-4xl font-bold" style={{ color: getDiceColor(diceType) }}>
                        = {lastRollResult + modifier}
                      </span>
                    </>
                  )}
                </div>
                {(selectedReason || reason) && (
                  <div className="text-sm text-white/80 mt-1">
                    {selectedReason 
                      ? rollReasons.find(r => r.value === selectedReason)?.label || selectedReason
                      : reason}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Если в режиме DM и есть токены, показываем селектор токенов */}
          {useDmMode && tokens && tokens.length > 0 && (
            <div className="mb-3">
              <label className="text-sm font-medium text-white mb-1 block">Выбрать токен:</label>
              <Select 
                onValueChange={(value) => {
                  const tokenId = parseInt(value);
                  if (!isNaN(tokenId)) {
                    // Находим токен по id и используем его имя как имя игрока
                    const token = tokens.find((t: any) => t.id === tokenId);
                    if (token && token.id === tokenId) {
                      setSelectedTokenId(tokenId);
                    }
                  }
                }}
                value={selectedTokenId?.toString() || ""}
              >
                <SelectTrigger className="w-full bg-black/50 border-white/20 text-white">
                  <SelectValue placeholder="Выберите токен" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white">
                  <SelectItem value="dm">DM (Мастер)</SelectItem>
                  {tokens.map((token: any) => (
                    <SelectItem key={token.id} value={token.id.toString()}>
                      {token.name} ({token.type === "player" ? "Игрок" : token.type === "boss" ? "Босс" : "Монстр"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Показываем поле ввода имени только если не в режиме DM */}
          {!useDmMode && (
            <div className="mb-3">
              <label className="text-sm font-medium text-white mb-1 block">Имя игрока:</label>
              <Input 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                placeholder="Введите имя"
                className="w-full mt-1 text-white bg-black/50 border-white/20"
              />
            </div>
          )}
          
          <div className="grid grid-cols-6 gap-2 mb-5 p-3 bg-black/40 rounded-lg">
            {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const).map((dice) => {
              const isActive = diceType === dice;
              const buttonColor = getDiceColor(dice);
              
              return (
                <Button 
                  key={dice}
                  variant={isActive ? "default" : "outline"} 
                  onClick={() => setDiceType(dice)} 
                  disabled={isRolling} 
                  className={`dice-button h-14 ${isActive ? 'text-black' : 'text-white hover:text-black'}`}
                  style={{
                    backgroundColor: isActive ? buttonColor : 'transparent',
                    borderColor: `${buttonColor}${isActive ? 'FF' : '40'}`,
                    boxShadow: isActive ? `0 0 8px ${buttonColor}80` : 'none'
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-base font-bold">{dice}</span>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {/* Модификаторы и причина броска */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Причина броска:</label>
              <Select
                onValueChange={(value) => setSelectedReason(value)}
                value={selectedReason}
              >
                <SelectTrigger className="w-full bg-black/50 border-white/20 text-white">
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white">
                  {rollReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedReason === "other" && (
                <Input 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Укажите причину"
                  className="w-full mt-2 text-white bg-black/50 border-white/20"
                />
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-white mb-1 block">Модификатор:</label>
              <Input 
                type="number" 
                value={modifier} 
                onChange={(e) => setModifier(Number(e.target.value))} 
                className="w-full text-white bg-black/50 border-white/20"
              />
            </div>
          </div>
          
          <Button 
            onClick={handleRoll} 
            className="w-full font-bold py-3"
            disabled={isRolling}
            style={{
              backgroundColor: isRolling ? '#888888' : getDiceColor(diceType),
              color: 'black',
              boxShadow: `0 4px 12px ${getDiceColor(diceType)}40`,
              height: '55px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            {isRolling ? 'Бросаем...' : `Бросить ${diceType}`}
          </Button>
        </TabsContent>
        
        <TabsContent value="history" className="mt-0">
          <div className="max-h-[450px] overflow-y-auto rounded-md bg-black/50 border border-white/10">
            {rollsHistory.length > 0 ? rollsHistory.map((roll) => (
              <div 
                key={roll.id} 
                className="text-sm p-3 flex flex-col"
                style={{ borderBottom: `1px solid ${currentTheme.accent}20` }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{roll.playerName}</span>
                  <span className="text-xs text-white/50">{formatTime(new Date(roll.timestamp))}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center">
                    <DiceIcon value={roll.result} diceType={roll.diceType} />
                    {roll.modifier !== 0 && (
                      <span className="ml-2 text-sm text-white">{roll.modifier > 0 ? '+' : ''}{roll.modifier}</span>
                    )}
                  </div>
                  <span 
                    className="font-bold text-lg"
                    style={{ color: getDiceColor(roll.diceType) }}
                  >{roll.total}</span>
                </div>
                
                {roll.reason && (
                  <div className="mt-1 text-xs text-white/70">{roll.reason}</div>
                )}
              </div>
            )) : (
              <div className="text-center py-4 text-white/50">
                История бросков пуста
              </div>
            )}
          </div>
          
          {rollsHistory.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 border-white/20 text-white/70 hover:bg-white/10" 
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
