
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenHealthBarProps {
  currentHP: number;
  maxHP: number;
  temporaryHP?: number;
  width?: number;
  showValue?: boolean;
}

const TokenHealthBar: React.FC<TokenHealthBarProps> = ({
  currentHP,
  maxHP,
  temporaryHP = 0,
  width = 30,
  showValue = false
}) => {
  // Защита от некорректных значений
  const safeCurrentHP = isNaN(currentHP) ? 0 : Math.max(0, currentHP);
  const safeMaxHP = isNaN(maxHP) || maxHP <= 0 ? 1 : maxHP;
  const safeTempHP = isNaN(temporaryHP) ? 0 : Math.max(0, temporaryHP);
  
  // Для анимированного обновления используем локальное состояние с useEffect
  const [prevHP, setPrevHP] = useState(safeCurrentHP);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Расчет процентов для HP баров
  const healthPercentage = safeMaxHP > 0 
    ? Math.max(0, Math.min(100, (safeCurrentHP / safeMaxHP) * 100)) 
    : 0;
  
  const tempHealthPercentage = safeMaxHP > 0 
    ? Math.max(0, Math.min(100, (safeTempHP / safeMaxHP) * 100)) 
    : 0;
  
  // Обновляем локальное состояние при изменении props
  useEffect(() => {
    if (safeCurrentHP !== prevHP) {
      setIsAnimating(true);
      
      // Останавливаем анимацию через короткий промежуток времени
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevHP(safeCurrentHP);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [safeCurrentHP, prevHP]);
  
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
        className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden shadow-sm border border-black/30 relative"
        style={{ width: `${width}px` }}
      >
        {/* Основная полоса здоровья */}
        <motion.div 
          className="h-full rounded-full absolute top-0 left-0"
          style={{ 
            width: `${healthPercentage}%`, 
            backgroundColor: barColor,
            boxShadow: `0 0 5px ${barColor}`
          }}
          initial={{ width: `${prevHP / safeMaxHP * 100}%` }}
          animate={{ width: `${healthPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Индикатор изменения здоровья */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div 
              className={`absolute top-0 left-0 h-full ${safeCurrentHP < prevHP ? 'bg-red-500/30' : 'bg-green-500/30'}`}
              style={{ width: `${Math.max(healthPercentage, (prevHP / safeMaxHP) * 100)}%` }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
        
        {/* Полоса временного здоровья */}
        {safeTempHP > 0 && (
          <motion.div
            className="absolute top-0 h-full bg-emerald-400/70"
            style={{ 
              left: `${healthPercentage}%`,
              width: `${tempHealthPercentage}%`,
              boxShadow: `0 0 5px rgba(52, 211, 153, 0.7)`
            }}
            initial={{ width: 0, opacity: 0.5 }}
            animate={{ width: `${tempHealthPercentage}%`, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      
      {showValue && (
        <div className="absolute -bottom-4 text-xs font-bold text-white drop-shadow-md">
          {safeCurrentHP}/{safeMaxHP}
          {safeTempHP > 0 && <span className="text-emerald-400">(+{safeTempHP})</span>}
        </div>
      )}
    </div>
  );
};

export default TokenHealthBar;
