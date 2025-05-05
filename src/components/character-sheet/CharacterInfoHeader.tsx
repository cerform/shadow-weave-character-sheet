
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface CharacterInfoHeaderProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const CharacterInfoHeader: React.FC<CharacterInfoHeaderProps> = ({ 
  character, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  // Получаем строку класса из character.class или из className
  const classText = character.className || character.class || 'Не указан';

  return (
    <Card 
      className="w-full"
      style={{ borderColor: `${currentTheme.accent}40` }}
    >
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Имя персонажа */}
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Имя</span>
            {isEditing ? (
              <Input
                value={character.name || ''}
                onChange={handleNameChange}
                onBlur={() => setIsEditing(false)}
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-bold cursor-pointer" 
                onClick={() => setIsEditing(true)}
                style={{ color: currentTheme.textColor }}
              >
                {character.name || 'Безымянный'}
              </h2>
            )}
          </div>
          
          {/* Класс и уровень */}
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Класс и уровень</span>
            <div className="font-medium" style={{ color: currentTheme.textColor }}>
              {classText} {character.level ? `(${character.level})` : ''}
            </div>
          </div>
          
          {/* Раса */}
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Раса</span>
            <div className="font-medium" style={{ color: currentTheme.textColor }}>
              {character.race || 'Не указана'} {character.subrace ? `(${character.subrace})` : ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterInfoHeader;
