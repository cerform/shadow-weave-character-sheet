
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceScene } from '@/components/dice/DiceScene';

export const DiceRoller3D = ({ 
  initialDice = 'd20', 
  hideControls = false, 
  modifier = 0, 
  onRollComplete,
  fixedPosition = false,
  themeColor = '#ffffff',
  diceCount = 1
}: {
  initialDice?: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100',
  hideControls?: boolean,
  modifier?: number,
  onRollComplete?: (result: number) => void,
  fixedPosition?: boolean,
  themeColor?: string,
  diceCount?: number
}) => {
  const [diceType, setDiceType] = useState<'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'>(
    initialDice === 'd100' ? 'd10' : initialDice as any
  );
  const [roll, setRoll] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const actualThemeColor = themeColor || currentTheme.accent;
  
  const handleDiceChange = (type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20') => {
    setDiceType(type);
  };
  
  const handleRoll = () => {
    // Calculate total result from multiple dice
    let total = 0;
    let rolls: number[] = [];
    
    for (let i = 0; i < diceCount; i++) {
      const max = parseInt(diceType.substring(1));
      const roll = Math.floor(Math.random() * max) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    // Apply modifier
    const finalResult = total + modifier;
    
    setRollResult(finalResult);
    
    if (onRollComplete) {
      onRollComplete(finalResult);
    }
    
    // Reset result after some time
    setTimeout(() => {
      setRollResult(null);
    }, 3000);
  };
  
  // Override style for the container
  const containerStyle: React.CSSProperties = {
    width: '100%', 
    height: '100%', 
    position: 'relative',
    overflow: 'hidden'
  };
  
  if (fixedPosition) {
    containerStyle.position = 'fixed';
    containerStyle.top = '0';
    containerStyle.left = '0';
    containerStyle.right = '0';
    containerStyle.bottom = '0';
    containerStyle.zIndex = 1000;
  }
  
  // Кнопка броска внизу для лучшей доступности
  const buttonBottom = hideControls ? "10px" : "55px";
  
  return (
    <div style={containerStyle}>
      <DiceScene 
        initialDiceType={diceType}
        hideControls={hideControls}
        height={hideControls ? 220 : 280}
      />
      
      {!hideControls && (
        <div style={{ 
          position: 'absolute', 
          bottom: buttonBottom, 
          left: 0, 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px',
          background: 'rgba(0,0,0,0.2)',
          padding: '8px',
          borderRadius: '8px',
        }}>
          {(['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const).map((type) => (
            <button 
              key={type}
              onClick={() => handleDiceChange(type)} 
              style={{ 
                padding: '4px 8px', 
                opacity: diceType === type ? 1 : 0.6,
                backgroundColor: diceType === type ? actualThemeColor : 'rgba(255,255,255,0.1)',
                color: diceType === type ? 'black' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      
      {!hideControls && (
        <button 
          onClick={handleRoll}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            padding: '8px 16px',
            backgroundColor: actualThemeColor,
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Бросить {diceCount > 1 ? `${diceCount}${diceType}` : diceType} 
          {modifier !== 0 ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : ''}
        </button>
      )}
      
      {rollResult !== null && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: actualThemeColor,
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          boxShadow: `0 0 20px ${actualThemeColor}`,
          zIndex: 10
        }}>
          {rollResult}
        </div>
      )}
    </div>
  );
};
