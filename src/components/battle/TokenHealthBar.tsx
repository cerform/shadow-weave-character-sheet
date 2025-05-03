
import React from 'react';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  width?: number;
  showValue?: boolean;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  currentHP,
  maxHP,
  width = 30,
  showValue = false
}) => {
  const healthPercentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  
  // Определяем цвет полоски здоровья в зависимости от процента
  const getHealthColor = (percent: number) => {
    if (percent > 60) return 'rgb(52, 211, 153)'; // зеленый
    if (percent > 30) return 'rgb(251, 191, 36)'; // желтый
    return 'rgb(239, 68, 68)'; // красный
  };
  
  const barColor = getHealthColor(healthPercentage);
  
  return (
    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
      <div 
        className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden shadow-sm border border-black/30"
        style={{ width: `${width}px` }}
      >
        <div 
          className="h-full transition-all duration-300 rounded-full"
          style={{ 
            width: `${healthPercentage}%`, 
            backgroundColor: barColor,
            boxShadow: `0 0 5px ${barColor}`
          }}
        />
      </div>
      
      {showValue && (
        <div className="absolute -bottom-4 text-xs font-bold text-white text-shadow">
          {currentHP}/{maxHP}
        </div>
      )}
    </div>
  );
};

export default TokenHealthBar;
