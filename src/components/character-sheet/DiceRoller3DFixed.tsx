
import React from 'react';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

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
  
  return (
    <DiceRoller3D
      initialDice={initialDice}
      hideControls={hideControls}
      modifier={modifier}
      onRollComplete={onRollComplete}
      themeColor={themeColor || currentTheme.accent}
      fixedPosition={fixedPosition}
      playerName={playerName}
      diceCount={diceCount}
    />
  );
};

export default DiceRoller3DFixed;
