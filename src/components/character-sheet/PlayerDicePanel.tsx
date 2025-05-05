
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
import { getCurrentUid } from '@/utils/authHelpers';
import { Dices } from 'lucide-react';

interface PlayerDicePanelProps {
  characterId?: string;
  characterName?: string;
  isDM?: boolean;
}

const predefinedRollReasons = [
  { value: 'attack', label: 'Атака' },
  { value: 'skill_check', label: 'Проверка навыка' },
  { value: 'saving_throw', label: 'Спасбросок' },
  { value: 'initiative', label: 'Инициатива' },
  { value: 'damage', label: 'Урон' },
  { value: 'healing', label: 'Лечение' },
  { value: 'custom', label: 'Другое' },
];

export const PlayerDicePanel: React.FC<PlayerDicePanelProps> = ({
  characterId,
  characterName,
  isDM = false
}) => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>('d20');
  const [modifier, setModifier] = useState<number>(0);
  const [rollMessage, setRollMessage] = useState<string>('');
  const [rollReason, setRollReason] = useState<string>('attack');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [useCustomReason, setUseCustomReason] = useState<boolean>(false);
  const [rollHistory, setRollHistory] = useState<any[]>([]);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [forceReroll, setForceReroll] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const handleDiceRollComplete = (result: number) => {
    setRollResult(result);
    
    // Симулируем запись истории бросков
    const now = new Date();
    const rollData = {
      diceCount,
      diceType,
      modifier,
      result,
      total: result + modifier,
      reason: useCustomReason ? rollReason : predefinedRollReasons.find(r => r.value === rollReason)?.label || 'Бросок',
      message: rollMessage,
      timestamp: now.toLocaleTimeString(),
      userId: getCurrentUid() || 'guest',
      characterName: characterName || 'Персонаж'
    };
    
    setRollHistory((prev) => [...prev, rollData]);
    
    toast({
      title: "Бросок успешен",
      description: `${rollData.characterName} бросил ${diceCount}${diceType} ${modifier >= 0 ? '+' + modifier : modifier} = ${result + modifier}`,
    });
  };
  
  const handleRoll = () => {
    // Используем переключение forceReroll для инициирования нового броска
    setForceReroll(prev => !prev);
  };
  
  // Обработчик изменения типа кубика с правильным обновлением состояния
  const handleDiceTypeChange = (newType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20') => {
    setDiceType(newType);
  };
  
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
        <div className="space-y-4">
          {/* Выбор типа кубика */}
          <div className="grid grid-cols-6 gap-1">
            {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((dice) => (
              <Button
                key={dice}
                size="sm"
                variant={diceType === dice ? "default" : "outline"}
                className="h-10 px-2 flex items-center justify-center"
                onClick={() => handleDiceTypeChange(dice as any)}
              >
                {dice}
              </Button>
            ))}
          </div>
          
          {/* 3D кубик в центре - перемещён вверх */}
          <div 
            className="mb-2 bg-black/70 rounded-lg overflow-hidden relative flex items-center justify-center" 
            style={{ height: '220px' }}
          >
            <DiceRoller3D 
              initialDice={diceType}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceRollComplete}
              themeColor={currentTheme.accent}
              diceCount={diceCount}
              forceReroll={forceReroll}
            />
          </div>
          
          {/* Секция настройки броска - перемещена вниз */}
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            {/* Диалог дополнительных настроек */}
            <div>
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
            
            {/* Количество кубиков и модификатор в одну строку */}
            <div className="flex items-center gap-3">
              {/* Количество кубиков */}
              <div className="flex items-center gap-1">
                <Label className="text-sm whitespace-nowrap">Кол-во:</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="px-2 h-8 w-8" 
                  onClick={() => setDiceCount(prev => Math.max(1, prev - 1))}
                >
                  -
                </Button>
                <div className="flex items-center border bg-background/50 rounded px-2 min-w-[30px] justify-center">
                  <span className="text-sm">{diceCount}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="px-2 h-8 w-8" 
                  onClick={() => setDiceCount(prev => Math.min(10, prev + 1))}
                >
                  +
                </Button>
              </div>
              
              {/* Модификатор броска */}
              <div className="flex items-center gap-1">
                <Label className="text-sm whitespace-nowrap">Мод:</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="px-2 h-8 w-8" 
                  onClick={() => setModifier(prev => Math.max(-20, prev - 1))}
                >
                  -
                </Button>
                <div className="flex items-center border bg-background/50 rounded px-2 min-w-[40px] justify-center">
                  <span className="text-sm" style={{ color: modifier > 0 ? '#4ade80' : modifier < 0 ? '#f87171' : 'inherit' }}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="px-2 h-8 w-8" 
                  onClick={() => setModifier(prev => Math.min(20, prev + 1))}
                >
                  +
                </Button>
              </div>
            </div>
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
            
          {/* Кнопка броска - уменьшена */}
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-primary/90 hover:bg-primary h-10 text-sm"
              onClick={handleRoll}
            >
              <Dices className="mr-2" size={14} />
              Бросить {diceCount}{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* История бросков */}
      {rollHistory.length > 0 && (
        <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
          <h3 className="text-lg font-semibold mb-2">История бросков</h3>
          <ScrollArea className="h-40">
            <div className="space-y-2">
              {rollHistory.map((roll, index) => (
                <div key={index} className="p-2 bg-background/40 rounded border border-primary/10">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/10">
                      {roll.timestamp}
                    </Badge>
                    <span className="text-sm font-medium">{roll.reason}</span>
                  </div>
                  <div className="mt-1">
                    <span className="font-bold">{roll.characterName}</span> бросил{' '}
                    <span className="font-medium">{roll.diceCount}{roll.diceType}{roll.modifier !== 0 ? (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier) : ''}</span> ={' '}
                    <span className="font-bold text-lg" style={{ color: currentTheme.accent }}>{roll.total}</span>
                  </div>
                  {roll.message && (
                    <div className="mt-1 text-sm italic">"{roll.message}"</div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

