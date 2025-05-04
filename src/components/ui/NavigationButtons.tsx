
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/use-mobile';
import HomeButton from '@/components/navigation/HomeButton';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  const navigate = useNavigate();
  
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  // Обработчики навигации
  const handleNavigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <HomeButton />
      
      <Button 
        variant="outline" 
        onClick={handleNavigate('/handbook')}
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
      >
        <BookOpen className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Руководство игрока" : ""}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleNavigate('/spellbook')}
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
      >
        <Scroll className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Книга заклинаний" : ""}
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          onClick={handleNavigate('/dm/battle')}
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
        >
          <Map className={isMobile ? "size-4" : "size-4"} />
          {!isMobile ? "Боевая карта" : ""}
        </Button>
      )}
      
      <Button 
        variant="outline" 
        onClick={handleNavigate('/character-creation')}
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
      >
        <Users className={isMobile ? "size-4" : "size-4"} />
        {!isMobile ? "Создание персонажа" : ""}
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          onClick={handleNavigate('/dm-dashboard')}
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
        >
          <Book className={isMobile ? "size-4" : "size-4"} />
          {!isMobile ? "Панель Мастера" : ""}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
