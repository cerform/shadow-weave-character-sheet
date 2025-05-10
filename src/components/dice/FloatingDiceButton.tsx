
import React, { useState, useRef, useEffect } from 'react';
import { Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { DiceRollModal } from './DiceRollModal';
import { themes } from '@/lib/themes';

interface Position {
  x: number;
  y: number;
}

const FloatingDiceButton: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Кешируем цвет кнопки для предотвращения мерцания
  const buttonColor = currentTheme.accent || '#8B5A2B';

  // Сохраняем позицию в localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('diceButtonPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse saved dice button position', e);
      }
    }
  }, []);

  // Обновляем localStorage при изменении позиции
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('diceButtonPosition', JSON.stringify(position));
    }
  }, [position, isDragging]);

  // Проверка и коррекция позиции, чтобы кнопка не вышла за экран
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        const buttonWidth = buttonRef.current.offsetWidth;
        const buttonHeight = buttonRef.current.offsetHeight;
        
        const maxX = window.innerWidth - buttonWidth;
        const maxY = window.innerHeight - buttonHeight;
        
        if (position.x < 0 || position.x > maxX || position.y < 0 || position.y > maxY) {
          setPosition({
            x: Math.max(0, Math.min(position.x, maxX)),
            y: Math.max(0, Math.min(position.y, maxY))
          });
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем обработчики событий
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Обработчики тач-событий
  const handleTouchStart = (e: React.TouchEvent) => {
    if (buttonRef.current) {
      const touch = e.touches[0];
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      });
      e.preventDefault(); // Предотвращаем прокрутку страницы
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Добавляем обработчики тач-событий
  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (buttonElement) {
      if (isDragging) {
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
      } else {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      }
    }
    
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <>
      <div
        ref={buttonRef}
        className={`fixed z-50 flex items-center justify-center p-3 rounded-full shadow-lg cursor-pointer transition-all 
                   ${isDragging ? 'scale-110' : 'hover:scale-110'}`}
        style={{
          backgroundColor: buttonColor,
          color: '#FFFFFF',
          boxShadow: `0 4px 12px ${buttonColor}40`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onClick={() => !isDragging && setIsOpen(true)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <Dices size={24} />
      </div>

      <DiceRollModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingDiceButton;
