
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
    if (healthPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
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
      
      <div 
        className={`relative w-full overflow-hidden rounded-full bg-gray-800/50`} 
        style={{ height }}
      >
        {/* Основная полоса здоровья */}
        <motion.div 
          className={`absolute top-0 left-0 h-full transition-all ${getHealthColor()}`} 
          style={{ width: `${healthPercentage}%` }}
          initial={{ width: `${prevCurrentHp / maxHp * 100}%` }}
          animate={{ width: `${healthPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
        
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
