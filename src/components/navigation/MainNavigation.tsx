
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Scroll, LogIn } from 'lucide-react';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import { useDeviceType } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

const MainNavigation = () => {
  const { activeTheme } = useUserTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  const { isAuthenticated } = useAuth();
  
  // Используем тему из хука для получения стилей
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const buttonStyle = {
    '--theme-accent-rgb': currentTheme.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(',')
  } as React.CSSProperties;
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
        style={buttonStyle}
        asChild
      >
        <Link to="/">
          <Home className="size-4" />
          {!isMobile && <span>Домой</span>}
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
        style={buttonStyle}
        asChild
      >
        <Link to="/handbook">
          <BookOpen className="size-4" />
          {!isMobile && <span>Руководство игрока</span>}
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
        style={buttonStyle}
        asChild
      >
        <Link to="/spellbook">
          <Scroll className="size-4" />
          {!isMobile && <span>Книга заклинаний</span>}
        </Link>
      </Button>
      
      {!isAuthenticated && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
          style={buttonStyle}
          asChild
        >
          <Link to="/auth">
            <LogIn className="size-4" />
            {!isMobile && <span>Вход</span>}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default MainNavigation;
