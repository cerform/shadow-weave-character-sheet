import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types/character';
import { useNavigate } from 'react-router-dom';

interface CharacterCardProps {
  character: Character;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  const navigate = useNavigate();

  const handleViewCharacter = () => {
    navigate(`/character/${character.id}`);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {character.name}
          <Badge variant="secondary">
            Ур. {character.level || 1}
          </Badge>
        </CardTitle>
        <CardDescription>
          {character.race || 'Раса не выбрана'} {character.class || 'Класс не выбран'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Предыстория:</span> {character.background || 'Не выбрана'}
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Очки жизни:</span> {character.hitPoints?.current || 0}/{character.hitPoints?.maximum || 0}
          </div>
          <Button onClick={handleViewCharacter} className="w-full mt-4">
            Открыть персонажа
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;