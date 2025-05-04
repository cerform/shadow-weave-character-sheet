
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dices, MoveHorizontal } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { PlayerDicePanel } from './components/character-sheet/PlayerDicePanel';

export const AppDiceButton: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Состояния для перетаскивания
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const [showDragIcon, setShowDragIcon] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  // Инициализация позиции кнопки при первой загрузке
  useEffect(() => {
    try {
      // Восстановление сохраненной позиции из localStorage
      const savedPosition = localStorage.getItem('diceButtonPosition');
      
      if (savedPosition) {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } else {
        resetPosition();
      }
    } catch (e) {
      // При ошибке разбора JSON используем значения по умолчанию
      resetPosition();
    }
  }, []);
  
  // Сбрасываем позицию кнопки к значениям по умолчанию (правый нижний угол)
  const resetPosition = () => {
    setPosition({ x: -1, y: -1 });
  };
  
  // При изменении позиции сохраняем её в localStorage
  useEffect(() => {
    if (position.x !== -1 && position.y !== -1) {
      try {
        localStorage.setItem('diceButtonPosition', JSON.stringify(position));
      } catch (e) {
        console.error("Ошибка при сохранении позиции кнопки:", e);
      }
    }
  }, [position]);
  
  // Начало перетаскивания
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    
    setIsDragging(true);
    
    // Для событий мыши
    if ('clientX' in e) {
      const rect = buttonRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const x = moveEvent.clientX - offsetX;
        const y = moveEvent.clientY - offsetY;
        updatePosition(x, y);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setIsDragging(false);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    // Для сенсорных событий
    else if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = buttonRef.current.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      
      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length > 0) {
          const touchMove = moveEvent.touches[0];
          const x = touchMove.clientX - offsetX;
          const y = touchMove.clientY - offsetY;
          updatePosition(x, y);
          moveEvent.preventDefault(); // Предотвращаем скролл во время перетаскивания
        }
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        setIsDragging(false);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
  };
  
  // Обновление позиции с проверкой границ экрана
  const updatePosition = (x: number, y: number) => {
    if (!buttonRef.current) return;
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonWidth = buttonRef.current.offsetWidth;
    const buttonHeight = buttonRef.current.offsetHeight;
    
    // Ограничиваем позицию в пределах окна браузера
    const boundedX = Math.max(0, Math.min(windowWidth - buttonWidth, x));
    const boundedY = Math.max(0, Math.min(windowHeight - buttonHeight, y));
    
    setPosition({ x: boundedX, y: boundedY });
  };
  
  // Исключаем страницы, на которых не нужно показывать плавающую кнопку кубиков
  const excludedPaths = [
    '/auth' // Можно добавить другие пути, где кнопка не нужна
  ];
  
  // Проверяем, не находимся ли мы на странице из исключений
  const shouldRenderButton = !excludedPaths.some(path => 
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );
  
  if (!shouldRenderButton) {
    return null;
  }
  
  // Применение стилей позиционирования
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
    cursor: isDragging ? 'grabbing' : 'grab',
    ...(position.x !== -1 && position.y !== -1 
        ? { top: `${position.y}px`, left: `${position.x}px`, right: 'auto', bottom: 'auto' } 
        : { bottom: '24px', right: '24px' })
  };
  
  return (
    <div 
      ref={buttonRef}
      className={`dice-button-container ${isDragging ? 'dragging' : ''}`}
      style={buttonStyle}
      onMouseEnter={() => setShowDragIcon(true)}
      onMouseLeave={() => setShowDragIcon(false)}
      onMouseDown={handleDragStart}
      onTouchStart={(e) => {
        setShowDragIcon(true);
        handleDragStart(e);
      }}
    >
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button 
          size="lg" 
          className="rounded-full shadow-lg relative"
          style={{ 
            width: '80px',
            height: '80px',
            backgroundColor: `${currentTheme.accent}`,
            color: currentTheme.textColor,
            boxShadow: `0 0 20px ${currentTheme.accent}80`
          }}
          onClick={() => setIsOpen(true)}
        >
          <Dices className="h-12 w-12" />
          {showDragIcon && (
            <div className="absolute top-0 left-0 bg-black/40 w-full h-full rounded-full flex items-center justify-center">
              <MoveHorizontal className="h-8 w-8 animate-pulse" />
            </div>
          )}
        </Button>
        
        <SheetContent side="right" className="sm:max-w-md md:max-w-lg w-[95%] bg-black/95 border-white/20 p-0 pt-4">
          <SheetHeader className="px-6">
            <SheetTitle className="text-white text-2xl font-bold">Кубики</SheetTitle>
            <SheetDescription className="text-white/90 text-base">
              Используйте виртуальные кубики для бросков
            </SheetDescription>
          </SheetHeader>
          <div className="py-2 h-[calc(100vh-120px)] overflow-y-auto px-6">
            <PlayerDicePanel />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AppDiceButton;
