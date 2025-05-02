
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Стили для кнопок на основе текущей темы
  const buttonStyle = {
    color: currentTheme.buttonText || '#FFFFFF',
    borderColor: currentTheme.accent,
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-semibold"
        style={buttonStyle}
      >
        <Home className="size-4" />
        На главную
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/handbook')}
        className="flex items-center gap-2 font-semibold"
        style={buttonStyle}
      >
        <BookOpen className="size-4" />
        Руководство игрока
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/spellbook')}
        className="flex items-center gap-2 font-semibold"
        style={buttonStyle}
      >
        <Scroll className="size-4" />
        Книга заклинаний
      </Button>
      
      {/* Показывать кнопку боевой карты только Мастерам */}
      {isDM && (
        <Button 
          variant="outline" 
          onClick={() => navigate('/dm/battle')}
          className="flex items-center gap-2 font-semibold"
          style={buttonStyle}
        >
          <Map className="size-4" />
          Боевая карта
        </Button>
      )}
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/character-creation')}
        className="flex items-center gap-2 font-semibold"
        style={buttonStyle}
      >
        <Users className="size-4" />
        Создание персонажа
      </Button>
    </div>
  );
};

export default NavigationButtons;
