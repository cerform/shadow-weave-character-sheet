
import React, { useEffect, useState } from 'react';
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
  
  // Обработка изменения HP для анимации
  useEffect(() => {
    if (currentHp !== prevCurrentHp) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevCurrentHp(currentHp);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [currentHp, prevCurrentHp]);
  
  // Расчет процентов для HP баров
  const healthPercentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const tempHpPercentage = Math.max(0, Math.min(100, (tempHp / maxHp) * 100));
  
  // Определяем цвет обычного HP на основе процента здоровья
  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Создаем сегментированную полосу здоровья
  const segments = 20;
  const segmentWidth = `${100 / segments}%`;
  
  return (
    <div className={`w-full ${className}`}>
      {showValues && (
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-1 text-red-500" />
            <span className="text-sm font-medium" style={{ color: currentTheme.textColor }}>
              Здоровье
            </span>
          </div>
          <span className="text-sm" style={{ color: currentTheme.textColor }}>
            {currentHp} / {maxHp}
            {tempHp > 0 && (
              <span className="ml-1 text-emerald-400">(+{tempHp})</span>
            )}
          </span>
        </div>
      )}
      
      <div className={`relative w-full overflow-hidden rounded-full bg-gray-800/50`} style={{ height }}>
        {/* Основной HP бар - сегментированный */}
        <div className="flex h-full w-full">
          {Array.from({ length: segments }).map((_, i) => {
            const filled = (i + 1) / segments * 100 <= healthPercentage;
            return (
              <motion.div
                key={i}
                className={`h-full mx-[0.5px] first:ml-0 last:mr-0 ${filled ? getHealthColor() : 'bg-gray-700/20'}`}
                style={{ width: segmentWidth }}
                initial={{ scaleY: 0.5, opacity: 0.5 }}
                animate={{ 
                  scaleY: filled ? 1 : 0.5, 
                  opacity: filled ? 1 : 0.2,
                }}
                transition={{ duration: 0.3, delay: filled ? i * 0.01 : 0 }}
              />
            );
          })}
        </div>
        
        {/* Индикатор изменения HP */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div 
              className={`absolute top-0 left-0 h-full ${currentHp < prevCurrentHp ? 'bg-red-500' : 'bg-green-500'}/30`}
              style={{ width: `${Math.max(healthPercentage, (prevCurrentHp / maxHp) * 100)}%` }}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
        
        {/* Временное HP */}
        {tempHp > 0 && (
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
      </div>
    </div>
  );
};
