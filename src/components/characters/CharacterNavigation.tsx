
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const CharacterNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  // Проверяем текущий маршрут
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div 
      className="flex flex-wrap gap-2 p-3 mb-4 rounded-lg border"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderColor: `${currentTheme.accent}30` 
      }}
    >
      <Button
        variant={isActive('/characters') ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => navigate('/characters')}
      >
        <FileText size={16} />
        Все персонажи
      </Button>
      
      <Button
        variant={isActive('/recent-characters') ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => navigate('/recent-characters')}
      >
        <Clock size={16} />
        Недавние
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="gap-2 ml-auto"
        onClick={() => navigate('/character-creation')}
        style={{
          backgroundColor: `${currentTheme.accent}20`,
          borderColor: `${currentTheme.accent}50`,
          color: currentTheme.accent
        }}
      >
        <Calendar size={16} />
        Создать персонажа
      </Button>
    </div>
  );
};

export default CharacterNavigation;
