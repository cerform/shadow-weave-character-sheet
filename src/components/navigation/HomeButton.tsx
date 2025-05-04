
import React from 'react';
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
  
  // Упрощенный обработчик навигации без setTimeout
  const handleHomeNavigation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Проверяем, не находимся ли мы уже на главной странице
    if (location.pathname !== '/') {
      console.log("Навигация на главную страницу");
      navigate('/', { replace: true });
    } else {
      console.log("Уже на главной странице");
    }
  };
  
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
