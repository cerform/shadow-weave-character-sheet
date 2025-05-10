import React, { ReactNode, useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface BackgroundWrapperProps {
  children: ReactNode;
  withOverlay?: boolean;
  opacity?: number;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ 
  children, 
  withOverlay = true,
  opacity = 0.8
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const [scale, setScale] = useState(1);

  // Добавляем медленное масштабирование для создания эффекта дыхания фона
  useEffect(() => {
    let timeoutId: number | null = null;
    let direction = 1;
    const maxScale = 1.05;
    const minScale = 1;
    const step = 0.0005;
    
    const animate = () => {
      setScale(prev => {
        const newScale = prev + (step * direction);
        
        // Меняем направление при достижении пределов
        if (newScale >= maxScale) direction = -1;
        if (newScale <= minScale) direction = 1;
        
        return newScale;
      });
      
      timeoutId = window.setTimeout(animate, 100);
    };
    
    timeoutId = window.setTimeout(animate, 100);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // ДЛЯ ИЗМЕНЕНИЯ ФОНА:
  // 1. Загрузите ваше изображение в папку public/lovable-uploads
  // 2. Замените путь в backgroundImage ниже на путь к вашему изображению
  // 3. Вы можете использовать любое изображение формата jpg, png, svg и т.д.
  
  const backgroundBrightness = currentTheme.backgroundBrightness || 1;
  const backgroundGradient = currentTheme.backgroundGradient || 'none';
  const decorativeCorners = currentTheme.decorativeCorners !== undefined ? currentTheme.decorativeCorners : false;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
    >
      {/* Фоновая картинка с эффектом дыхания */}
      <div 
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out"
        style={{ 
          backgroundImage: `url('/lovable-uploads/91719f56-2b3a-49c7-904f-35af06f9d3b3.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `scale(${scale})`,
          filter: `brightness(${backgroundBrightness})`,
          transition: 'transform 0.5s ease-out'
        }}
      />
      
      {/* Накладываем тематический градиент поверх фона */}
      {withOverlay && (
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ 
            background: backgroundGradient || 
              `linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity - 0.1}))`,
            opacity: opacity
          }}
        />
      )}
      
      {/* Добавляем декоративные элементы по углам */}
      {decorativeCorners && (
        <>
          <div className="absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat z-10 opacity-70"
               style={{ backgroundImage: 'url("/lovable-uploads/corner-tl.png")' }} />
          <div className="absolute top-0 right-0 w-24 h-24 bg-contain bg-no-repeat z-10 opacity-70"
               style={{ backgroundImage: 'url("/lovable-uploads/corner-tr.png")', transform: 'rotate(90deg)' }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-contain bg-no-repeat z-10 opacity-70"
               style={{ backgroundImage: 'url("/lovable-uploads/corner-bl.png")', transform: 'rotate(-90deg)' }} />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-contain bg-no-repeat z-10 opacity-70"
               style={{ backgroundImage: 'url("/lovable-uploads/corner-br.png")', transform: 'rotate(180deg)' }} />
        </>
      )}
      
      {/* Контент страницы */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
