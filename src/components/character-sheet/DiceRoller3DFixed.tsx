
import React, { useState } from 'react';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface DiceRoller3DFixedProps {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';
  hideControls?: boolean;
  modifier?: number;
  onRollComplete?: (result: number) => void;
  fixedPosition?: boolean;
}

export const DiceRoller3DFixed: React.FC<DiceRoller3DFixedProps> = ({
  initialDice = 'd20',
  hideControls = false,
  modifier = 0,
  onRollComplete,
  fixedPosition = false
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  return (
    <DiceRoller3D
      initialDice={initialDice}
      hideControls={hideControls}
      modifier={modifier}
      onRollComplete={onRollComplete}
      themeColor={currentTheme.accent}
      fixedPosition={fixedPosition}
    />
  );
};

export default DiceRoller3DFixed;
