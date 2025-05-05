
import React from 'react';
import { Card } from "@/components/ui/card";
import { Character } from '@/types/character.d';

interface CharacterHeaderProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const CharacterHeader = ({ character, onUpdate }: CharacterHeaderProps) => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h1 className="text-2xl font-bold text-center mb-2">{character.name}</h1>
      <div className="flex justify-center items-center gap-2">
        <span className="text-muted-foreground">{character.class}</span>
        <span className="text-muted-foreground">Level {character.level}</span>
      </div>
    </Card>
  );
};

export default CharacterHeader;
