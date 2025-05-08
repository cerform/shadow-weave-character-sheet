
import React from 'react';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  width: number;
  showValue?: boolean;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  currentHP,
  maxHP,
  width,
  showValue = false
}) => {
  // Процент оставшегося здоровья
  const healthPercentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  
  // Определяем цвет полосы здоровья
  let barColor = '#10b981'; // зеленый (> 50%)
  
  if (healthPercentage < 25) {
    barColor = '#ef4444'; // красный (< 25%)
  } else if (healthPercentage < 50) {
    barColor = '#f59e0b'; // оранжевый (< 50%)
  }
  
  // Стиль контейнера
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: `${width}px`,
    height: '4px',
    backgroundColor: '#374151',
    borderRadius: '2px',
    overflow: 'hidden',
    zIndex: 5
  };
  
  // Стиль полосы здоровья
  const barStyle: React.CSSProperties = {
    height: '100%',
    width: `${healthPercentage}%`,
    backgroundColor: barColor,
    transition: 'width 0.3s ease, background-color 0.3s ease'
  };
  
  // Стиль для текста
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-18px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
    whiteSpace: 'nowrap'
  };
  
  return (
    <>
      <div style={containerStyle}>
        <div style={barStyle}></div>
      </div>
      
      {showValue && (
        <div style={textStyle}>
          {currentHP}/{maxHP}
        </div>
      )}
    </>
  );
};

export default TokenHealthBar;
