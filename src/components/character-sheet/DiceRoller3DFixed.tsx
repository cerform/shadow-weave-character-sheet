
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRenderer } from '@/components/dice/DiceRenderer';

interface DiceRoller3DFixedProps {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  hideControls?: boolean;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  fixedPosition?: boolean;
  themeColor?: string;
  playerName?: string;
  diceCount?: number;
}

export const DiceRoller3DFixed: React.FC<DiceRoller3DFixedProps> = ({
  initialDice = 'd20',
  hideControls = false,
  modifier = 0,
  onRollComplete,
  fixedPosition = false,
  themeColor,
  playerName,
  diceCount = 1
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Преобразуем d100 в d10 для отображения (так как физически d100 — это d10 x 10)
  const actualDiceType = initialDice === 'd100' ? 'd10' : initialDice;
  
  const handleRollComplete = (result: number) => {
    // Для d100 умножаем результат на 10
    const finalResult = initialDice === 'd100' ? result * 10 : result;
    
    // Добавляем модификатор к результату
    const modifiedResult = finalResult + modifier;
    
    if (onRollComplete) {
      onRollComplete(modifiedResult);
    }
  };
  
  return (
    <DiceRenderer
      defaultDiceType={actualDiceType as any}
      defaultDiceCount={diceCount}
      onRollComplete={handleRollComplete}
      showControls={!hideControls}
      fixedPosition={fixedPosition}
      themeColor={themeColor || currentTheme.accent}
      height="100%"
      width="100%"
    />
  );
};

export default DiceRoller3DFixed;
