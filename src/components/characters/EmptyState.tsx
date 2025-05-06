
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const EmptyState: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div 
      className="border rounded-xl p-10 text-center"
      style={{ borderColor: `${currentTheme.accent}30` }}
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
        <User 
          size={32} 
          style={{ color: currentTheme.accent }} 
        />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: currentTheme.textColor }}>
        У вас пока нет персонажей
      </h3>
      <p className="text-muted-foreground mb-6">
        Создайте своего первого персонажа, чтобы начать приключение
      </p>
      <Button
        onClick={() => navigate('/character-creation')}
        style={{
          backgroundColor: currentTheme.accent,
          color: currentTheme.buttonText || '#FFFFFF',
        }}
      >
        Создать персонажа
      </Button>
    </div>
  );
};

export default EmptyState;
