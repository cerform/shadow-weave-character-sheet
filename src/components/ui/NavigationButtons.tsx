
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/use-mobile';
import HomeButton from '@/components/navigation/HomeButton';
import { Link } from 'react-router-dom';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Эффект свечения для кнопок
  const buttonStyle = {
    borderColor: currentTheme.accent,
    boxShadow: `0 0 10px ${currentTheme.accent}40`,
    transition: 'all 0.3s ease'
  };
  
  const hoverStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.boxShadow = `0 0 15px ${currentTheme.accent}70`;
    target.style.transform = 'translateY(-2px)';
    target.style.borderColor = currentTheme.accent;
  };
  
  const leaveStyle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    target.style.boxShadow = buttonStyle.boxShadow;
    target.style.transform = 'translateY(0)';
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <HomeButton />
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 relative overflow-hidden group"
        size={isMobile ? "sm" : "default"}
        asChild
        style={buttonStyle}
        onMouseEnter={hoverStyle}
        onMouseLeave={leaveStyle}
      >
        <Link to="/handbook" className="relative z-10">
          <BookOpen className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && (
            <span className="relative">
              Руководство игрока
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
          )}
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 relative overflow-hidden group"
        size={isMobile ? "sm" : "default"}
        asChild
        style={buttonStyle}
        onMouseEnter={hoverStyle}
        onMouseLeave={leaveStyle}
      >
        <Link to="/spellbook" className="relative z-10">
          <Scroll className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && (
            <span className="relative">
              Книга заклинаний
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
          )}
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 relative overflow-hidden group"
          size={isMobile ? "sm" : "default"}
          asChild
          style={buttonStyle}
          onMouseEnter={hoverStyle}
          onMouseLeave={leaveStyle}
        >
          <Link to="/dm/battle" className="relative z-10">
            <Map className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && (
              <span className="relative">
                Боевая карта
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
            )}
          </Link>
        </Button>
      )}
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 relative overflow-hidden group"
        size={isMobile ? "sm" : "default"}
        asChild
        style={buttonStyle}
        onMouseEnter={hoverStyle}
        onMouseLeave={leaveStyle}
      >
        <Link to="/character-creation" className="relative z-10">
          <Users className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && (
            <span className="relative">
              Создание персонажа
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </span>
          )}
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 relative overflow-hidden group"
          size={isMobile ? "sm" : "default"}
          asChild
          style={buttonStyle}
          onMouseEnter={hoverStyle}
          onMouseLeave={leaveStyle}
        >
          <Link to="/dm-dashboard" className="relative z-10">
            <Book className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && (
              <span className="relative">
                Панель Мастера
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </span>
            )}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
