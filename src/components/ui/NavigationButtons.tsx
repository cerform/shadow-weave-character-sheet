
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useDeviceType } from '@/hooks/use-mobile';
import { useUserTheme } from '@/hooks/use-user-theme';
import HomeButton from '@/components/navigation/HomeButton';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  
  // Используем активную тему из UserThemeContext с запасным вариантом из ThemeContext
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Стили для кнопок на основе текущей темы
  const buttonStyle = {
    color: currentTheme.buttonText || '#FFFFFF',
    borderColor: currentTheme.accent,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    boxShadow: `0 0 5px ${currentTheme.accent}30`
  };

  // Оптимизированная функция для навигации с использованием useCallback
  const handleNavigation = useCallback((e: React.MouseEvent, path: string) => {
    // Предотвращаем стандартное поведение и всплытие события
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    
    // Если мы уже на этой странице, ничего не делаем
    if (location.pathname === path) {
      console.log(`Уже на странице ${path}, навигация не требуется`);
      return;
    }
    
    // Делаем небольшую задержку перед навигацией
    setTimeout(() => {
      // Используем replace вместо push для предотвращения накопления истории браузера
      navigate(path, { replace: true });
    }, 10);
  }, [navigate, location.pathname]);
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <HomeButton />
      
      <Button 
        variant="outline" 
        onClick={(e) => handleNavigation(e, '/handbook')}
        className="flex items-center gap-2 font-semibold"
        size={isMobile ? "sm" : "default"}
        style={buttonStyle}
      >
        <BookOpen className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Руководство игрока" : ""}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={(e) => handleNavigation(e, '/spellbook')}
        className="flex items-center gap-2 font-semibold"
        size={isMobile ? "sm" : "default"}
        style={buttonStyle}
      >
        <Scroll className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Книга заклинаний" : ""}
      </Button>
      
      {/* Показывать кнопку боевой карты только Мастерам */}
      {isDM && (
        <Button 
          variant="outline" 
          onClick={(e) => handleNavigation(e, '/dm/battle')}
          className="flex items-center gap-2 font-semibold"
          size={isMobile ? "sm" : "default"}
          style={buttonStyle}
        >
          <Map className={isMobile ? "size-4" : "size-4"} />
          {!isMobile ? "Боевая карта" : ""}
        </Button>
      )}
      
      <Button 
        variant="outline" 
        onClick={(e) => handleNavigation(e, '/character-creation')}
        className="flex items-center gap-2 font-semibold"
        size={isMobile ? "sm" : "default"}
        style={buttonStyle}
      >
        <Users className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Создание персонажа" : ""}
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          onClick={(e) => handleNavigation(e, '/dm-dashboard')}
          className="flex items-center gap-2 font-semibold"
          size={isMobile ? "sm" : "default"}
          style={buttonStyle}
        >
          <Book className={isMobile ? "size-4" : "size-4"} />
          {!isMobile ? "Панель Мастера" : ""}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
