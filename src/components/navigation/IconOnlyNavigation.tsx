
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BookOpen, 
  Scroll, 
  Users, 
  LogIn, 
  Book, 
  Map, 
  Settings 
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSelector from '@/components/ThemeSelector';

interface IconOnlyNavigationProps {
  className?: string;
  includeThemeSelector?: boolean;
}

const IconOnlyNavigation: React.FC<IconOnlyNavigationProps> = ({ 
  className = "",
  includeThemeSelector = true
}) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={{ 
          borderColor: currentTheme.accent,
          color: currentTheme.textColor,
          boxShadow: `0 0 5px ${currentTheme.accent}30`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
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
        style={{ 
          borderColor: currentTheme.accent,
          color: currentTheme.textColor,
          boxShadow: `0 0 5px ${currentTheme.accent}30`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
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
        style={{ 
          borderColor: currentTheme.accent,
          color: currentTheme.textColor,
          boxShadow: `0 0 5px ${currentTheme.accent}30`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
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
        style={{ 
          borderColor: currentTheme.accent,
          color: currentTheme.textColor,
          boxShadow: `0 0 5px ${currentTheme.accent}30`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
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
        style={{ 
          borderColor: currentTheme.accent,
          color: currentTheme.textColor,
          boxShadow: `0 0 5px ${currentTheme.accent}30`,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
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
          style={{ 
            borderColor: currentTheme.accent,
            color: currentTheme.textColor,
            boxShadow: `0 0 5px ${currentTheme.accent}30`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
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
          style={{ 
            borderColor: currentTheme.accent,
            color: currentTheme.textColor,
            boxShadow: `0 0 5px ${currentTheme.accent}30`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
        >
          <Link to="/battle">
            <Map className="size-4" />
            <span className="sr-only">Боевая карта</span>
          </Link>
        </Button>
      )}
      
      {includeThemeSelector && <ThemeSelector />}
    </div>
  );
};

export default IconOnlyNavigation;
