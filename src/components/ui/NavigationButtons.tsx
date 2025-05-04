
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useDeviceType } from '@/hooks/use-mobile';
import { useUserTheme } from '@/hooks/use-user-theme';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const navigate = useNavigate();
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

  // Функции для навигации
  const goTo = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={() => goTo('/')}
        className="flex items-center gap-2 font-semibold"
        size={isMobile ? "sm" : "default"}
        style={buttonStyle}
      >
        <Home className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "На главную" : ""}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => goTo('/handbook')}
        className="flex items-center gap-2 font-semibold"
        size={isMobile ? "sm" : "default"}
        style={buttonStyle}
      >
        <BookOpen className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Руководство игрока" : ""}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => goTo('/spellbook')}
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
          onClick={() => goTo('/dm/battle')}
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
        onClick={() => goTo('/character-creation')}
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
          onClick={() => goTo('/dm-dashboard')}
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
