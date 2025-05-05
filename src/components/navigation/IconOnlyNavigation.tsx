
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Scroll, 
  Shield, 
  BookOpen, 
  Wand2, 
  LogIn, 
  BookMarked, 
  Map,
  User
} from "lucide-react";
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
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
  
  // Cache button style to prevent flickering
  const buttonStyle = React.useMemo(() => ({ 
    borderColor: currentTheme.accent,
    color: currentTheme.textColor,
    boxShadow: `0 0 5px ${currentTheme.accent}30`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  }), [currentTheme.accent, currentTheme.textColor]);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="icon"
        asChild
        style={buttonStyle}
        className="hover:shadow-lg transition-all hover:scale-105"
      >
        <Link to="/">
          <Shield className="size-4" />
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
          <BookMarked className="size-4" />
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
          <Wand2 className="size-4" />
          <span className="sr-only">Создание персонажа</span>
        </Link>
      </Button>
      
      {!currentUser ? (
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
      ) : (
        <Button 
          variant="outline" 
          size="icon"
          asChild
          style={buttonStyle}
          className="hover:shadow-lg transition-all hover:scale-105"
        >
          <Link to="/profile">
            <User className="size-4" />
            <span className="sr-only">Профиль</span>
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
          <Link to="/dm">
            <BookOpen className="size-4" />
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
      
      {includeThemeSelector && <ThemeSelector />}
    </div>
  );
};

export default IconOnlyNavigation;
