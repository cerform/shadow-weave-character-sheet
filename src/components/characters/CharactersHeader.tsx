
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharactersHeaderProps {
  username?: string;
}

const CharactersHeader: React.FC<CharactersHeaderProps> = ({ username = "Путешественник" }) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  return (
    <Card className="bg-black/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle style={{ color: currentTheme.accent }}>
          Персонажи пользователя {username}
        </CardTitle>
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
