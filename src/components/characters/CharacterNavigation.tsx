
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const CharacterNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Определяем текущий маршрут для выделения активной вкладки
  const currentPath = location.pathname;
  
  const isActivePath = (path: string): boolean => {
    return currentPath === path;
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button 
        variant={isActivePath('/recent-characters') ? "default" : "outline"} 
        size="sm"
        onClick={() => navigate('/recent-characters')}
        className="rounded-full"
      >
        Недавние
      </Button>
      
      <Button 
        variant={isActivePath('/characters') ? "default" : "outline"} 
        size="sm"
        onClick={() => navigate('/characters')}
        className="rounded-full"
      >
        Все персонажи
      </Button>
      
      <Button 
        variant={isActivePath('/character-creation') ? "default" : "outline"} 
        size="sm"
        onClick={() => navigate('/character-creation')}
        className="rounded-full"
      >
        Создать персонажа
      </Button>
    </div>
  );
};

export default CharacterNavigation;
