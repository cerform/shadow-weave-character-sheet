
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
  
  // Для правильного обновления используем локальное состояние с useEffect
  const [healthPercentage, setHealthPercentage] = useState(0);
  
  useEffect(() => {
    // Расчет процента здоровья при изменении props
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
  
  // Определяем градиент для полоски здоровья
  const getHealthGradient = (percent: number) => {
    if (percent > 60) return 'linear-gradient(90deg, rgba(52, 211, 153, 0.7) 0%, rgba(52, 211, 153, 1) 100%)';
    if (percent > 30) return 'linear-gradient(90deg, rgba(251, 191, 36, 0.7) 0%, rgba(251, 191, 36, 1) 100%)';
    return 'linear-gradient(90deg, rgba(239, 68, 68, 0.7) 0%, rgba(239, 68, 68, 1) 100%)';
  };
  
  const barColor = getHealthColor(healthPercentage);
  const barGradient = getHealthGradient(healthPercentage);
  
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
            background: barGradient,
            boxShadow: `0 0 5px ${barColor}`
          }}
        />
      </div>
      
      {showValue && (
        <div className="absolute -bottom-4 text-xs font-bold text-white text-shadow">
          {safeCurrentHP}/{safeMaxHP}
        </div>
      )}
    </div>
  );
};

export default TokenHealthBar;
