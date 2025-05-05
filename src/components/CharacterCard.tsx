
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Character } from '@/types/session';

interface CharacterCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onSelect,
  onView
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-shadow hover:shadow-lg ${isSelected ? 'border-primary border-2' : ''}`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{character.name}</h3>
            <p className="text-sm text-muted-foreground">
              {character.race} {character.class || character.className}, {character.level} уровень
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Предотвращаем запуск onClick у родительской Card
              onView();
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Просмотр
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;
