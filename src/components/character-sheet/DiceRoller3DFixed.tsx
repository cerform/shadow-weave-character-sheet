
import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import DiceBox3D from '@/components/dice/DiceBox3D';

interface DiceRoller3DFixedProps {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  hideControls?: boolean;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  fixedPosition?: boolean;
  themeColor?: string;
  playerName?: string;
  initialCount?: number;
}

export const DiceRoller3DFixed: React.FC<DiceRoller3DFixedProps> = ({
  initialDice = 'd20',
  hideControls = false,
  modifier = 0,
  onRollComplete,
  fixedPosition = false,
  themeColor,
  playerName,
  initialCount = 1
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Преобразуем d100 в d10 для отображения (так как физически d100 — это d10 x 10)
  const actualDiceType = initialDice === 'd100' ? 'd10' : initialDice as 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  
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
    <DiceBox3D
      diceType={actualDiceType}
      diceCount={initialCount}
      modifier={modifier}
      onRollComplete={handleRollComplete}
      hideControls={hideControls}
      themeColor={themeColor || currentTheme.accent}
    />
  );
};

export default DiceRoller3DFixed;
