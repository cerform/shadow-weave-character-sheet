
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Scroll, Map, Dices, Users } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-foreground border-primary/30 hover:bg-primary/20"
      >
        <Home className="size-4" />
        На главную
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/handbook')}
        className="flex items-center gap-2 text-foreground border-primary/30 hover:bg-primary/20"
      >
        <BookOpen className="size-4" />
        Руководство
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/spellbook')}
        className="flex items-center gap-2 text-foreground border-primary/30 hover:bg-primary/20"
      >
        <Scroll className="size-4" />
        Книга заклинаний
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/dm/battle')}
        className="flex items-center gap-2 text-foreground border-primary/30 hover:bg-primary/20"
      >
        <Map className="size-4" />
        Боевая карта
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => navigate('/character-creation')}
        className="flex items-center gap-2 text-foreground border-primary/30 hover:bg-primary/20"
      >
        <Users className="size-4" />
        Создание персонажа
      </Button>
    </div>
  );
};

export default NavigationButtons;
