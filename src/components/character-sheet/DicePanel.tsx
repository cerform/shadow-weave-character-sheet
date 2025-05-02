
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRoller3D } from './DiceRoller3DFixed';

const DICE_TYPES = {
  'd4': { sides: 4, color: '#FF5555', mesh: 'tetrahedron' },
  'd6': { sides: 6, color: '#55FF55', mesh: 'cube' },
  'd8': { sides: 8, color: '#5555FF', mesh: 'octahedron' },
  'd10': { sides: 10, color: '#FFAA55', mesh: 'decahedron' },
  'd12': { sides: 12, color: '#FF55FF', mesh: 'dodecahedron' },
  'd20': { sides: 20, color: '#FFFFFF', mesh: 'icosahedron' },
};

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
  const DiceIcon = ({ value, diceType, size = 30 }: { value: number, diceType?: string, size?: number }) => {
    const type = diceType?.replace('d', '') || '20';
    const diceColor = currentTheme.accent;
    const textColor = currentTheme.textColor;
    
    // Определяем форму для разных типов кубиков
    let shape = 'rounded-full';
    if (diceType === 'd4') shape = 'clip-path-triangle';
    else if (diceType === 'd6') shape = 'rounded-md';
    else if (diceType === 'd8') shape = 'clip-path-diamond'; 
    else if (diceType === 'd10') shape = 'clip-path-pentagon';
    else if (diceType === 'd12') shape = 'clip-path-dodecagon';
    else if (diceType === 'd20') shape = 'clip-path-icosahedron';
    
    return (
      <div 
        className={`inline-flex items-center justify-center font-bold ${shape}`}
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
        {/* 3D Dice Roller - центрируем компонент и фиксируем его положение */}
        <div className="h-[180px] mb-4 bg-black/20 rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <DiceRoller3D 
              key={diceKey}
              initialDice={diceType as any}
              hideControls={true}
              modifier={modifier}
              onRollComplete={handleDiceResult}
              themeColor={currentTheme.accent}
              fixedPosition={true}
            />
          </div>
        </div>
        
        {/* Улучшенные кнопки-кубики с визуализацией формы */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {Object.keys(DICE_TYPES).map((dice) => {
            const isActive = diceType === dice;
            const diceSides = dice.replace('d', '');
            
            return (
              <Button 
                key={dice}
                variant={isActive ? "default" : "outline"} 
                onClick={() => rollDice(dice)} 
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
                  <span className="text-sm">d{diceSides}</span>
                </div>
              </Button>
            );
          })}
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
          className="w-full dice-button" 
          disabled={isRolling}
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.textColor,
            boxShadow: `0 4px 12px ${currentTheme.accent}40`
          }}
        >
          Бросить {diceType}
        </Button>
      
        {diceResult && !isRolling && (
          <div 
            className="p-2 mt-3 mb-4 rounded-md text-center"
            style={{ backgroundColor: `${currentTheme.accent}10`, borderLeft: `3px solid ${currentTheme.accent}` }}
          >
            <div className="mb-2">
              <span className="text-primary font-medium">Результат: </span>
              <span 
                className="text-2xl font-bold"
                style={{ color: currentTheme.accent }}
              >{diceResult}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {rollsHistory[0]?.rolls.map((roll, idx) => (
                <div key={idx} className="inline-flex items-center justify-center">
                  <DiceIcon value={roll} diceType={diceType} />
                </div>
              ))}
              {rollsHistory[0]?.modifier !== 0 && (
                <span 
                  className="inline-flex items-center justify-center font-bold text-lg"
                  style={{ color: currentTheme.accent }}
                >
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
                style={{ color: currentTheme.accent, borderColor: `${currentTheme.accent}30` }}
              >
                Бросить снова
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-2" style={{ backgroundColor: `${currentTheme.accent}20` }} />
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1 text-foreground">История бросков</h4>
        <div className="max-h-32 overflow-y-auto">
          {rollsHistory.map((roll, index) => (
            <div 
              key={index} 
              className="text-sm p-1 flex justify-between items-center"
              style={{ borderBottom: `1px solid ${currentTheme.accent}10` }}
            >
              <span className="text-foreground/80 flex items-center">
                <small className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary/10 mr-1">
                  {roll.type}
                </small>
                <span className="text-xs ml-1">[{roll.rolls.join(', ')}]</span>
                {roll.modifier !== 0 && (
                  <span className="ml-1 text-xs">{roll.modifier > 0 ? '+' : ''}{roll.modifier}</span>
                )}
              </span>
              <span 
                className="font-medium"
                style={{ color: currentTheme.accent }}
              >{roll.total}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
