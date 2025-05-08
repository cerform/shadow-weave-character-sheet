
import React from 'react';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  width: number;
  showValue?: boolean;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({ currentHP, maxHP, width, showValue = false }) => {
  const healthPercent = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  
  // Determine color based on health percentage
  const getHealthColor = () => {
    if (healthPercent > 66) return '#4CAF50'; // Green
    if (healthPercent > 33) return '#FFC107'; // Yellow
    return '#F44336'; // Red
  };
  
  return (
    <div className="absolute -top-6 left-0" style={{ width: `${width}px` }}>
      {/* Background */}
      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
        {/* Health bar */}
        <div 
          className="h-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${healthPercent}%`,
            backgroundColor: getHealthColor()
          }}
        />
      </div>
      
      {/* Display health values if showValue is true */}
      {showValue && (
        <div className="text-white text-xs text-center mt-0.5 text-shadow">
          {currentHP}/{maxHP}
        </div>
      )}
    </div>
  );
};

export default TokenHealthBar;
