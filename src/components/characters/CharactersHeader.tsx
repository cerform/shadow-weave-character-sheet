
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CharactersHeaderProps {
  username?: string;
  characterCount?: number;
}

const CharactersHeader: React.FC<CharactersHeaderProps> = ({ 
  username = "Путешественник", 
  characterCount = 0
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  return (
    <Card className="bg-gradient-to-br from-gray-800 to-black backdrop-blur-sm border border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <CardTitle style={{ color: currentTheme.accent }} className="flex items-center gap-2">
            <Users size={20} />
            Персонажи пользователя {username}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {characterCount > 0 
              ? `Всего персонажей: ${characterCount}` 
              : 'У вас пока нет персонажей'}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/character-creation')}
          className="gap-2"
          variant="outline"
        >
          <Plus size={16} />
          Создать
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Здесь вы можете управлять вашими персонажами, создавать новых и просматривать существующих.
        </p>
      </CardContent>
    </Card>
  );
};

export default CharactersHeader;
