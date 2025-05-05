
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Character } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';

interface CharacterInfoHeaderProps {
  character: Character;
}

const CharacterInfoHeader: React.FC<CharacterInfoHeaderProps> = ({ character }) => {
  const { theme } = useTheme();
  
  const getBgColor = () => {
    switch (theme) {
      case 'fantasy':
        return 'bg-amber-900/30';
      case 'cyberpunk':
        return 'bg-purple-900/30';
      case 'default':
      default:
        return 'bg-gray-800/50';
    }
  };
  
  return (
    <Card className={`mb-4 ${getBgColor()} border-0 shadow-lg`}>
      <CardContent className="pt-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h2 className="text-2xl font-bold">{character.name || 'Безымянный герой'}</h2>
            <div className="text-sm text-muted-foreground">
              {character.race} {character.subrace && `(${character.subrace})`} &bull; {character.class || ''} &bull; Уровень {character.level || 1}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {character.background && (
              <Badge variant="secondary">{character.background}</Badge>
            )}
            {character.alignment && (
              <Badge variant="outline">{character.alignment}</Badge>
            )}
            <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-700">
              Опыт: {character.experience || 0}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterInfoHeader;
