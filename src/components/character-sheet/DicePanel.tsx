
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRoller3D } from './DiceRoller3D';

export const DicePanel = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceResult, setDiceResult] = useState<string | null>(null);
  const [diceType, setDiceType] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [rollsHistory, setRollsHistory] = useState<{type: string, rolls: number[], total: number, modifier: number}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  const [diceKey, setDiceKey] = useState(0); // Для форсирования пересоздания компонента DiceRoller3D
  
  // Компонент дайса для отображения в результате
  const DiceIcon = ({ value, size = 24 }: { value: number, size?: number }) => {
    return (
      <div 
        className="inline-flex items-center justify-center font-bold rounded-md"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: `${currentTheme.accent}20`,
          color: currentTheme.accent,
          border: `1px solid ${currentTheme.accent}40`
        }}
      >
        {value}
      </div>
    );
  };
  
  const rollDice = (type: string) => {
    setDiceType(type);
    setIsRolling(true);
    setDiceKey(prev => prev + 1); // Перерисовываем кубик для нового броска
  };
  
  // Обработчик результата броска из 3D компонента
  const handleDiceResult = (value: number) => {
    const count = Math.max(1, Math.min(20, diceCount));
    const max = parseInt(diceType.replace('d', ''));
    
    let rolls = [value];
    let total = value;
    
    // Добавляем модификатор
    const finalTotal = total + modifier;
    
    // Сохраняем результат броска
    const newRoll = { type: diceType, rolls, total: finalTotal, modifier };
    setRollsHistory(prev => [newRoll, ...prev.slice(0, 9)]);
    
    setDiceResult(`${finalTotal}`);
    setIsRolling(false);
  };
  
  // Сброс состояния броска, чтобы кнопку можно было нажать снова
  const resetRoll = () => {
    setDiceResult(null);
    setIsRolling(false);
    setDiceKey(prev => prev + 1); // Перерисовываем кубик для нового броска
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Кубики</h3>
      
      <div className="mt-4">
        {/* 3D Dice Roller - центрируем компонент */}
        <div className="h-[180px] mb-4 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
          <DiceRoller3D 
            key={diceKey}
            initialDice={diceType as any}
            hideControls={true}
            modifier={modifier}
            onRollComplete={handleDiceResult}
            themeColor={currentTheme.accent}
          />
        </div>
        
        {/* Строка кнопок-кубиков с улучшенным стилем */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(dice => (
            <Button 
              key={dice}
              variant={diceType === dice ? "default" : "outline"} 
              onClick={() => rollDice(dice)} 
              disabled={isRolling} 
              className={`dice-button ${diceType === dice ? 'bg-primary text-primary-foreground' : 'text-foreground hover:text-primary hover:border-primary'}`}
              style={diceType === dice ? {} : {borderColor: `${currentTheme.accent}40`}}
            >
              {dice}
            </Button>
          ))}
        </div>
        
        {/* Модификаторы */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-sm text-foreground">Количество:</label>
            <Input 
              type="number" 
              value={diceCount} 
              onChange={(e) => setDiceCount(Number(e.target.value))} 
              min={1}
              max={20}
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
          onClick={() => rollDice(diceType)} 
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground dice-button" 
          disabled={isRolling}
        >
          Бросить {diceType}
        </Button>
      
        {diceResult && !isRolling && (
          <div className="p-2 mt-3 mb-4 bg-primary/10 rounded-md text-center">
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
                className="w-full text-primary border-primary/30 hover:bg-primary/10"
              >
                Бросить снова
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-2 bg-primary/20" />
      
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
