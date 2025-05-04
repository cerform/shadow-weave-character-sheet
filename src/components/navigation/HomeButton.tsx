
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useDeviceType } from '@/hooks/use-mobile';
import { useUserTheme } from '@/hooks/use-user-theme';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "outline";
}

const HomeButton: React.FC<HomeButtonProps> = ({ 
  className = "", 
  showText = true,
  variant = "outline"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTheme } = useUserTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Берем активную тему
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Базовые стили для кнопки
  const buttonStyle = {
    color: currentTheme.buttonText || '#FFFFFF',
    borderColor: currentTheme.accent,
    backgroundColor: variant === 'default' ? currentTheme.accent : 'rgba(0, 0, 0, 0.7)',
    boxShadow: `0 0 5px ${currentTheme.accent}30`,
    textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)"
  };
  
  // Оптимизированный обработчик навигации с использованием useCallback
  const handleHomeNavigation = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Предотвращаем стандартное поведение и всплытие события
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Проверяем, не находимся ли мы уже на главной странице
    if (location.pathname === '/') {
      console.log("Уже на главной странице, навигация не требуется");
      return;
    }
    
    // Делаем небольшую задержку перед навигацией, чтобы дать время завершиться другим процессам
    setTimeout(() => {
      // Используем replace вместо push для предотвращения накопления истории браузера
      navigate('/', { replace: true });
    }, 10);
  }, [navigate, location.pathname]);
  
  return (
    <Button 
      variant={variant}
      onClick={handleHomeNavigation}
      className={`flex items-center gap-2 font-semibold ${className}`}
      size={isMobile ? "sm" : "default"}
      style={buttonStyle}
    >
      <Home className={isMobile ? "size-4" : "size-4"} />
      {(showText && !isMobile) && "На главную"}
    </Button>
  );
};

export default HomeButton;
