
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Character } from '@/types/character';
import { useSocket } from '@/contexts/SocketContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DiceRollResult {
  type: string;
  result: number;
  rolls: number[];
  total: number;
  timestamp: string;
}

// Extend Character type to include lastDiceRoll
declare module '@/types/character' {
  interface Character {
    lastDiceRoll?: DiceRollResult;
  }
}

interface DicePanelProps {
  character: Character;
  compactMode?: boolean;
  isDM?: boolean;
  tokens?: any[];
  selectedTokenId?: number | null;
  setSelectedTokenId?: (id: number | null) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ 
  character,
  compactMode = false,
  isDM = false,
  tokens = [],
  selectedTokenId = null,
  setSelectedTokenId = () => {}
}) => {
  const [rolls, setRolls] = useState<DiceRollResult[]>([]);
  const { toast } = useToast();
  const { sendUpdate } = useSocket();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Доступные типы костей
  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  // Бросок кости
  const rollDice = (sides: number, count: number = 1) => {
    const rolls: number[] = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    const newRoll: DiceRollResult = {
      type: `${count}d${sides}`,
      result: total,
      rolls: rolls,
      total: total,
      timestamp: new Date().toISOString()
    };

    // Добавляем результат в историю
    setRolls(prev => [newRoll, ...prev].slice(0, 10));

    // Отображаем уведомление
    toast({
      title: `Бросок ${count}d${sides}`,
      description: `Результат: ${total} ${rolls.length > 1 ? `(${rolls.join(' + ')})` : ''}`,
    });

    // Отправляем результат через сокет если есть комната
    const updatedCharacter = {
      ...character,
      lastDiceRoll: newRoll
    };
    sendUpdate(updatedCharacter);

    return newRoll;
  };

  // Бросок навыка
  const rollSkill = (skillName: string, modifier: number) => {
    const d20Roll = rollDice(20, 1);
    const total = d20Roll.result + modifier;

    const skillRoll: DiceRollResult = {
      type: `Навык: ${skillName}`,
      result: total,
      rolls: d20Roll.rolls,
      total: total,
      timestamp: new Date().toISOString()
    };

    setRolls(prev => [skillRoll, ...prev].slice(0, 10));

    toast({
      title: `Проверка навыка: ${skillName}`,
      description: `Результат: ${total} (d20: ${d20Roll.result} + модификатор: ${modifier})`,
    });

    // Отправляем результат через сокет
    const updatedCharacter = {
      ...character,
      lastDiceRoll: skillRoll
    };
    sendUpdate(updatedCharacter);
  };

  // Бросок атаки
  const rollAttack = () => {
    const d20Roll = rollDice(20, 1);
    
    // Простой бонус атаки на основе основной характеристики и бонуса мастерства
    const attackBonus = 2 + (character.proficiencyBonus || 2);
    const total = d20Roll.result + attackBonus;

    const attackRoll: DiceRollResult = {
      type: 'Атака',
      result: total,
      rolls: d20Roll.rolls,
      total: total,
      timestamp: new Date().toISOString()
    };

    setRolls(prev => [attackRoll, ...prev].slice(0, 10));

    toast({
      title: 'Бросок атаки',
      description: `Результат: ${total} (d20: ${d20Roll.result} + бонус: ${attackBonus})`,
    });

    // Отправляем результат через сокет
    const updatedCharacter = {
      ...character,
      lastDiceRoll: attackRoll
    };
    sendUpdate(updatedCharacter);
  };

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.textColor }}>Кости</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {diceTypes.map(dt => {
              const sides = parseInt(dt.replace('d', ''));
              return (
                <Button 
                  key={dt} 
                  onClick={() => rollDice(sides)}
                  variant="outline"
                  className="text-center"
                >
                  {dt}
                </Button>
              );
            })}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={rollAttack}
              variant="default"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText || 'white'
              }}
            >
              Атака
            </Button>
            <Button 
              onClick={() => rollDice(6, 2)}
              variant="outline"
            >
              Урон (2d6)
            </Button>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2" style={{ color: currentTheme.textColor }}>История бросков:</h4>
            <ScrollArea className="h-[150px]">
              {rolls.length > 0 ? (
                <div className="space-y-2">
                  {rolls.map((roll, index) => (
                    <div key={`roll-${index}`} className="border p-2 rounded-md flex justify-between">
                      <div>
                        <span className="text-sm font-medium" style={{ color: currentTheme.textColor }}>{roll.type}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTime(roll.timestamp)}
                        </span>
                      </div>
                      <div className="font-bold" style={{ color: currentTheme.textColor }}>
                        {roll.total}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  История бросков пуста
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DicePanel;

// Also export as named export for backwards compatibility
export { DicePanel };
