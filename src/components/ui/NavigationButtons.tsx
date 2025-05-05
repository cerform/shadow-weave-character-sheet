
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';
import MainNavigation from '../navigation/MainNavigation';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  const { activeTheme } = useUserTheme();
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Используем тему из хука для получения стилей
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const buttonStyle = {
    '--theme-accent-rgb': currentTheme.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(',')
  } as React.CSSProperties;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <MainNavigation />
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
        size={isMobile ? "sm" : "default"}
        asChild
        style={buttonStyle}
      >
        <Link to="/character-creation">
          <Users className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && "Создание персонажа"}
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
          size={isMobile ? "sm" : "default"}
          asChild
          style={buttonStyle}
        >
          <Link to="/dm-dashboard">
            <Book className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && "Панель Мастера"}
          </Link>
        </Button>
      )}
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
          size={isMobile ? "sm" : "default"}
          asChild
          style={buttonStyle}
        >
          <Link to="/dm/battle">
            <Map className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && "Боевая карта"}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
