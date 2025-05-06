
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Button } from '@/components/ui/button';

interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  minimal?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onClick,
  minimal = false 
}) => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Получаем класс персонажа из разных возможных полей
  const getCharacterClass = (): string => {
    if (character.className && typeof character.className === 'string') 
      return character.className;
    
    if (character.class && typeof character.class === 'string') 
      return character.class;
    
    return '';
  };
  
  // Получаем уровень персонажа
  const getCharacterLevel = (): string => {
    if (character.level) {
      return `${character.level} уровень`;
    }
    return '1 уровень';
  };

  // Формируем заголовок карточки
  const characterTitle = character.name || 'Безымянный персонаж';

  // Формируем подзаголовок карточки
  const characterSubtitle = `${character.race || ''} ${getCharacterClass()}`;

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        minimal 
          ? 'cursor-pointer hover:shadow-md' 
          : 'cursor-pointer hover:shadow-lg'
      }`}
      onClick={onClick}
    >
      <CardContent className={minimal ? 'p-3' : 'p-5'}>
        <CardTitle className="mb-1" style={{ color: currentTheme.accent }}>
          {characterTitle}
        </CardTitle>
        
        <CardDescription className="mb-4">
          {characterSubtitle}
        </CardDescription>
        
        {!minimal && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Уровень:</span>
                <span className="font-medium">{getCharacterLevel()}</span>
              </div>
              
              {character.race && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Раса:</span>
                  <span className="font-medium">{character.race}</span>
                </div>
              )}
              
              {character.alignment && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Мировоззрение:</span>
                  <span className="font-medium">{character.alignment}</span>
                </div>
              )}
              
              {character.background && (
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Предыстория:</span>
                  <span className="font-medium">{character.background}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Открыть
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
