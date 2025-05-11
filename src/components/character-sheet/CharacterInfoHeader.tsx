
import React from 'react';
import { Character } from '@/types/character';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAbilityModifier } from '@/utils/characterUtils';
import { Button } from '@/components/ui/button';
import { Crown, User } from "lucide-react";

interface CharacterInfoHeaderProps {
  character: Character;
  onLevelUp?: () => void;
}

const CharacterInfoHeader: React.FC<CharacterInfoHeaderProps> = ({ 
  character,
  onLevelUp 
}) => {
  // Convert level to number to ensure proper comparison
  const characterLevel = typeof character.level === 'string' ? 
    parseInt(character.level, 10) : character.level || 0;
  
  // Check if character can level up (up to level 20)
  const canLevelUp = characterLevel < 20;

  return (
    <div className="flex items-center p-4 bg-card rounded-t-lg">
      <Avatar className="h-16 w-16 border-2 border-primary">
        {character.avatar ? (
          <AvatarImage src={character.avatar} alt={character.name} />
        ) : (
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="ml-4 flex-1">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">{character.name}</h2>
          {/* Removed isHeroic check since it doesn't exist in the Character type */}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            {character.race} {character.subrace ? `(${character.subrace})` : ''} 
            {character.class && ` • ${character.class}`} 
            {character.level && ` • Уровень ${character.level}`}
          </span>
        </div>
        
        <div className="text-sm">
          {character.background && (
            <span className="mr-4">Предыстория: {character.background}</span>
          )}
        </div>
      </div>
      
      {onLevelUp && canLevelUp && (
        <Button 
          size="sm" 
          className="bg-gradient-to-r from-amber-400 to-amber-600 text-white"
          onClick={onLevelUp}
        >
          Повысить уровень
        </Button>
      )}
    </div>
  );
};

export default CharacterInfoHeader;
