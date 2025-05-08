
import React from 'react';
import { Rect } from 'react-konva';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  width: number;
  showValue?: boolean;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({ currentHP, maxHP, width, showValue = false }) => {
  const healthPercentage = Math.max(0, Math.min(1, currentHP / maxHP));
  
  // Colors for different health ranges
  const getHealthColor = () => {
    if (healthPercentage > 0.6) return '#4CAF50';
    if (healthPercentage > 0.3) return '#FFC107';
    return '#F44336';
  };
  
  return (
    <>
      {/* Health bar background */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={4}
        fill="rgba(0,0,0,0.5)"
        cornerRadius={2}
      />
      
      {/* Health indicator */}
      <Rect
        x={0}
        y={0}
        width={width * healthPercentage}
        height={4}
        fill={getHealthColor()}
        cornerRadius={2}
      />
    </>
  );
};

export default TokenHealthBar;
