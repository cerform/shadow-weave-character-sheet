
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book, Home, LogIn } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  // Общие стили для всех кнопок
  const buttonStyle = {
    borderColor: currentTheme.accent,
    color: currentTheme.textColor,
    boxShadow: `0 0 5px ${currentTheme.accent}30`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  };

  // Стили для наведения
  const buttonHoverStyle = {
    borderColor: currentTheme.accent,
    boxShadow: `0 0 10px ${currentTheme.accent}`,
    backgroundColor: `${currentTheme.accent}40`,
    color: currentTheme.buttonText || '#fff'
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/">
          <Home className="size-4" />
          <span className="sr-only">Главная</span>
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/handbook">
          <BookOpen className="size-4" />
          <span className="sr-only">Руководство игрока</span>
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/spellbook">
          <Scroll className="size-4" />
          <span className="sr-only">Книга заклинаний</span>
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/character-creation">
          <Users className="size-4" />
          <span className="sr-only">Создание персонажа</span>
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/auth">
          <LogIn className="size-4" />
          <span className="sr-only">Вход/Регистрация</span>
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          size="icon"
          asChild
          style={buttonStyle}
          className="hover:shadow-lg transition-all hover:scale-105"
        >
          <Link to="/dm">
            <Book className="size-4" />
            <span className="sr-only">Панель Мастера</span>
          </Link>
        </Button>
      )}
      
      {isDM && (
        <Button 
          variant="outline" 
          size="icon"
          asChild
          style={buttonStyle}
          className="hover:shadow-lg transition-all hover:scale-105"
        >
          <Link to="/battle">
            <Map className="size-4" />
            <span className="sr-only">Боевая карта</span>
          </Link>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
