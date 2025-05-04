
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface HPBarProps {
  currentHp: number;
  maxHp: number;
  tempHp?: number;
  showValues?: boolean;
  height?: string;
  className?: string;
}

export const HPBar: React.FC<HPBarProps> = ({ 
  currentHp, 
  maxHp, 
  tempHp = 0,
  showValues = true,
  height = '1.5rem',
  className = ''
}) => {
  const [prevCurrentHp, setPrevCurrentHp] = useState(currentHp);
  const [isAnimating, setIsAnimating] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const initializedRef = useRef(false);
  
  // Безопасные значения для расчетов
  const safeCurrentHp = isNaN(currentHp) ? 0 : Math.max(0, currentHp);
  const safeMaxHp = isNaN(maxHp) || maxHp <= 0 ? 1 : maxHp;
  const safeTempHp = isNaN(tempHp) ? 0 : Math.max(0, tempHp);
  
  // Обработка изменения HP для анимации
  useEffect(() => {
    // Пропускаем анимацию при первой инициализации
    if (!initializedRef.current) {
      initializedRef.current = true;
      setPrevCurrentHp(safeCurrentHp);
      return;
    }
    
    // Анимируем только при реальных изменениях
    if (safeCurrentHp !== prevCurrentHp) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevCurrentHp(safeCurrentHp);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [safeCurrentHp, prevCurrentHp]);
  
  // Расчет процентов для HP баров
  const healthPercentage = Math.max(0, Math.min(100, (safeCurrentHp / safeMaxHp) * 100));
  const tempHpPercentage = Math.max(0, Math.min(100, (safeTempHp / safeMaxHp) * 100));
  
  // Определяем цвет обычного HP на основе процента здоровья
  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Получаем цвет анимации изменения HP
  const getAnimationColor = () => {
    return safeCurrentHp < prevCurrentHp ? 'bg-red-500/30' : 'bg-green-500/30';
  };
  
  // ARIA атрибуты для доступности
  const ariaLabel = `Здоровье: ${safeCurrentHp} из ${safeMaxHp}${safeTempHp > 0 ? `, временных: ${safeTempHp}` : ''}`;
  
  return (
    <div 
      className={`w-full ${className}`}
      role="progressbar" 
      aria-valuenow={safeCurrentHp} 
      aria-valuemin={0} 
      aria-valuemax={safeMaxHp}
      aria-label={ariaLabel}
    >
      {showValues && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-1 text-red-500" />
            <span className="text-sm font-medium" style={{ color: currentTheme.textColor }}>
              Здоровье
            </span>
          </div>
          <span className="text-sm" style={{ color: currentTheme.textColor }}>
            {safeCurrentHp} / {safeMaxHp}
            {safeTempHp > 0 && (
              <span className="ml-1 text-emerald-400">(+{safeTempHp})</span>
            )}
          </span>
        </div>
      )}
      
      <div 
        className="relative w-full overflow-hidden rounded-full bg-gray-800/50" 
        style={{ height }}
      >
        {/* Основная полоса здоровья */}
        <motion.div 
          className={`absolute top-0 left-0 h-full transition-all ${getHealthColor()}`} 
          style={{ width: `${healthPercentage}%` }}
          initial={{ width: `${prevCurrentHp / safeMaxHp * 100}%` }}
          animate={{ width: `${healthPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Индикатор изменения HP */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div 
              className={`absolute top-0 left-0 h-full ${getAnimationColor()}`}
              style={{ width: `${Math.max(healthPercentage, (prevCurrentHp / safeMaxHp) * 100)}%` }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
        
        {/* Временное HP */}
        {safeTempHp > 0 && (
          <motion.div
            className="absolute top-0 h-full bg-emerald-400/70"
            style={{ 
              left: `${healthPercentage}%`,
              width: `${tempHpPercentage}%`,
              boxShadow: '0 0 5px rgba(52, 211, 153, 0.7)'
            }}
            initial={{ width: 0, opacity: 0.5 }}
            animate={{ width: `${tempHpPercentage}%`, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Сегментированный оверлей для стильного эффекта */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 border-r border-black/20 last:border-0" 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
