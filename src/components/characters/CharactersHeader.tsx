
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharactersHeaderProps {
  username: string;
}

const CharactersHeader: React.FC<CharactersHeaderProps> = ({ username }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold" style={{ color: currentTheme.textColor }}>
        Персонажи игрока {username}
      </h2>
      <Button
        onClick={() => navigate('/character-creation')}
        className="gap-2"
        style={{
          backgroundColor: currentTheme.accent,
          color: currentTheme.buttonText || '#FFFFFF',
        }}
      >
        <Plus size={16} />
        Создать персонажа
      </Button>
    </div>
  );
};

export default CharactersHeader;
