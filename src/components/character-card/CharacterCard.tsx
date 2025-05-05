
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil, Trash2 } from "lucide-react";
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  onSelect,
  onEdit,
  onDelete
}) => {
  return (
    <Card className="h-full flex flex-col bg-card/50 hover:bg-card/70 transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-primary" />
          <span className="truncate">{character.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground">
          <p>{character.race} {character.class}</p>
          <p>Уровень: {character.level}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        {onDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(character.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        {onEdit && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(character);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        
        {onSelect && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onSelect(character)}
          >
            Выбрать
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CharacterCard;
