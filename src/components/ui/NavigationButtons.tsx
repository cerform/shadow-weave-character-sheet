
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Scroll, Map, Users, Book } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/use-mobile';
import HomeButton from '@/components/navigation/HomeButton';
import { Link } from 'react-router-dom';

interface NavigationButtonsProps {
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className }) => {
  const { currentUser } = useAuth();
  const isDM = currentUser?.isDM;
  
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <HomeButton />
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
        asChild
      >
        <Link to="/handbook">
          <BookOpen className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && "Руководство игрока"}
        </Link>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
        asChild
      >
        <Link to="/spellbook">
          <Scroll className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && "Книга заклинаний"}
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
          asChild
        >
          <Link to="/dm/battle">
            <Map className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && "Боевая карта"}
          </Link>
        </Button>
      )}
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        size={isMobile ? "sm" : "default"}
        asChild
      >
        <Link to="/character-creation">
          <Users className={isMobile ? "size-4" : "size-4"} />
          {!isMobile && "Создание персонажа"}
        </Link>
      </Button>
      
      {isDM && (
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size={isMobile ? "sm" : "default"}
          asChild
        >
          <Link to="/dm-dashboard">
            <Book className={isMobile ? "size-4" : "size-4"} />
            {!isMobile && "Панель Мастера"}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
