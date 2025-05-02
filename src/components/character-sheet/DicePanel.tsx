
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dices, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

export const DicePanel = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceResult, setDiceResult] = useState<string | null>(null);
  const [diceType, setDiceType] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [rollsHistory, setRollsHistory] = useState<{type: string, rolls: number[], total: number, modifier: number}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  // Компонент дайса для отображения в результате
  const DiceIcon = ({ value, size = 24 }: { value: number, size?: number }) => {
    const icons = {
      1: <Dice1 size={size} className="text-primary" />,
      2: <Dice2 size={size} className="text-primary" />,
      3: <Dice3 size={size} className="text-primary" />,
      4: <Dice4 size={size} className="text-primary" />,
      5: <Dice5 size={size} className="text-primary" />,
      6: <Dice6 size={size} className="text-primary" />
    };
    
    return icons[value as keyof typeof icons] || <span className="text-primary font-bold">{value}</span>;
  };
  
  const rollDice = (type: string) => {
    setDiceType(type);
    setIsRolling(true);
    
    // Небольшая задержка для эффекта "броска"
    setTimeout(() => {
      const count = Math.max(1, Math.min(20, diceCount));
      const max = parseInt(type.replace('d', ''));
      
      let rolls = [];
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * max) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      // Добавляем модификатор
      const finalTotal = total + modifier;
      
      // Сохраняем результат броска
      const newRoll = { type, rolls, total: finalTotal, modifier };
      setRollsHistory(prev => [newRoll, ...prev.slice(0, 9)]);
      
      setDiceResult(`${finalTotal}`);
      setIsRolling(false);
    }, 500);
  };
  
  // Сброс состояния броска, чтобы кнопку можно было нажать снова
  const resetRoll = () => {
    setDiceResult(null);
    setIsRolling(false);
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-2 text-foreground">Кубики</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-sm text-foreground">Количество:</label>
          <Input 
            type="number" 
            value={diceCount} 
            onChange={(e) => setDiceCount(Number(e.target.value))} 
            min={1}
            max={20}
            className="w-full mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-foreground">Модификатор:</label>
          <Input 
            type="number" 
            value={modifier} 
            onChange={(e) => setModifier(Number(e.target.value))} 
            className="w-full mt-1"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => rollDice('d4')} disabled={isRolling}>d4</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d6')} disabled={isRolling}>d6</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d8')} disabled={isRolling}>d8</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d10')} disabled={isRolling}>d10</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d12')} disabled={isRolling}>d12</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d20')} disabled={isRolling}>d20</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d100')} disabled={isRolling}>d100</Button>
      </div>
      
      {isRolling && (
        <div className="p-2 mb-2 bg-primary/10 rounded-md text-center">
          <Dices className="inline-block animate-spin text-primary" />
          <span className="ml-2 text-primary">Бросок...</span>
        </div>
      )}
      
      {diceResult && !isRolling && (
        <div className="p-2 mb-4 bg-primary/10 rounded-md text-center">
          <div className="mb-2">
            <span className="text-primary font-medium">Результат: </span>
            <span className="text-2xl font-bold text-primary">{diceResult}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            {rollsHistory[0]?.rolls.map((roll, idx) => (
              <div key={idx} className="inline-flex items-center justify-center">
                <DiceIcon value={roll} />
              </div>
            ))}
            {rollsHistory[0]?.modifier !== 0 && (
              <span className="inline-flex items-center justify-center text-primary font-bold">
                {rollsHistory[0]?.modifier > 0 ? '+' : ''}{rollsHistory[0]?.modifier}
              </span>
            )}
          </div>
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetRoll} 
              className="w-full text-primary"
            >
              Бросить снова
            </Button>
          </div>
        </div>
      )}
      
      <Separator className="my-2" />
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1 text-foreground">История бросков</h4>
        <div className="max-h-32 overflow-y-auto">
          {rollsHistory.map((roll, index) => (
            <div key={index} className="text-sm p-1 border-b border-primary/10 flex justify-between">
              <span className="text-foreground/80">
                {roll.rolls.length}× {roll.type} 
                <span className="text-xs ml-1">[{roll.rolls.join(', ')}]</span>
                {roll.modifier !== 0 && (
                  <span className="ml-1">{roll.modifier > 0 ? '+' : ''}{roll.modifier}</span>
                )}
              </span>
              <span className="font-medium text-primary">{roll.total}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
