
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Users } from 'lucide-react';
import { Character } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterCardProps {
  character: Character;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onJoinSession: (id: string) => void;
}

const CharacterCard = ({ character, onEdit, onDelete, onJoinSession }: CharacterCardProps) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Безопасное получение данных персонажа
  const name = character.name || 'Безымянный персонаж';
  const characterClass = character.class || character.className || 'Неизвестный класс';
  const race = character.race || 'Неизвестная раса';
  const level = character.level || 1;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg" style={{ color: currentTheme.accent }}>
            {name}
          </span>
          <Badge variant="outline" className="text-xs">
            Уровень {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <div className="mb-1">
            <span className="font-medium">{race}</span> {characterClass}
          </div>
          
          {character.background && (
            <div className="text-xs opacity-80">
              Предыстория: {character.background}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(character.id)}>
          <Edit size={16} className="mr-1" />
          Редакт.
        </Button>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onJoinSession(character.id)}>
            <Users size={16} className="mr-1" />
            К сессии
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(character.id)}
            className="text-destructive hover:text-destructive/80"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CharacterCard;
