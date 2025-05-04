
import React, { useEffect, useState } from 'react';

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
  // Защита от некорректных значений
  const safeCurrentHP = isNaN(currentHP) ? 0 : Math.max(0, currentHP);
  const safeMaxHP = isNaN(maxHP) || maxHP <= 0 ? 1 : maxHP;
  
  // Для анимированного обновления используем локальное состояние с useEffect
  const [healthPercentage, setHealthPercentage] = useState(0);
  const [displayedCurrentHP, setDisplayedCurrentHP] = useState(safeCurrentHP);
  const [displayedMaxHP, setDisplayedMaxHP] = useState(safeMaxHP);
  
  // Обновляем локальное состояние при изменении props
  useEffect(() => {
    setDisplayedCurrentHP(safeCurrentHP);
    setDisplayedMaxHP(safeMaxHP);
    
    // Расчет процента здоровья
    const calculatedPercentage = safeMaxHP > 0 
      ? Math.max(0, Math.min(100, (safeCurrentHP / safeMaxHP) * 100)) 
      : 0;
    
    setHealthPercentage(calculatedPercentage);
  }, [safeCurrentHP, safeMaxHP]);
  
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
          {displayedCurrentHP}/{displayedMaxHP}
        </div>
      )}
    </div>
  );
};

export default TokenHealthBar;
