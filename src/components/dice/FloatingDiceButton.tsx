
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import DiceDrawer from './DiceDrawer';
import { useMediaQuery } from '@/hooks/use-media-query';

interface Position {
  x: number;
  y: number;
}

const FloatingDiceButton: React.FC = () => {
  const { themeStyles } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  
  // Инициализация позиции кнопки
  useEffect(() => {
    // Устанавливаем кнопку в правый нижний угол с отступами
    const x = window.innerWidth - (isMobile ? 80 : 100);
    const y = window.innerHeight - (isMobile ? 150 : 100);
    setPosition({ x, y });
    
    // При изменении размера окна перемещаем кнопку, чтобы она оставалась видимой
    const handleResize = () => {
      setPosition(prev => {
        const newX = Math.min(prev.x, window.innerWidth - (isMobile ? 80 : 100));
        const newY = Math.min(prev.y, window.innerHeight - (isMobile ? 150 : 100));
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Обработчики для drag-n-drop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x,
      y: e.clientY - position.y 
    });
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y 
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Проверяем границы экрана
      const maxX = window.innerWidth - (isMobile ? 50 : 60);
      const maxY = window.innerHeight - (isMobile ? 50 : 60);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      // Проверяем границы экрана
      const maxX = window.innerWidth - (isMobile ? 50 : 60);
      const maxY = window.innerHeight - (isMobile ? 50 : 60);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Добавляем обработчики событий
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragStart]);

  // Стили для кнопки в зависимости от темы
  const buttonStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: themeStyles?.accent,
    color: themeStyles?.textColor,
    boxShadow: `0 0 10px ${themeStyles?.accent}50`,
    width: isMobile ? '50px' : '60px',
    height: isMobile ? '50px' : '60px',
    borderRadius: '50%',
  };

  return (
    <div 
      className={`fixed z-50 dice-button-container ${isDragging ? 'dragging' : ''}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <DiceDrawer>
        <Button 
          variant="outline" 
          size="icon" 
          style={buttonStyle}
          className="relative transition-all hover:scale-105"
        >
          <Dices className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rotate-0 scale-100 transition-all`} />
          <span className="sr-only">Открыть кубики</span>
          <div 
            className="absolute bottom-1 right-1 h-2 w-2 rounded-full" 
            style={{ backgroundColor: themeStyles?.accent }}
          />
        </Button>
      </DiceDrawer>
    </div>
  );
};

export default FloatingDiceButton;
