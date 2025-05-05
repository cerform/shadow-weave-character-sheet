
import React from 'react';
import { Card } from "@/components/ui/card";

interface CharacterHeaderProps {
  character: any;
  onUpdate?: (updates: any) => void;
}

export const CharacterHeader = ({ character, onUpdate }: CharacterHeaderProps) => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h1 className="text-2xl font-bold text-center mb-2">{character.name || 'Безымянный герой'}</h1>
      <div className="flex justify-center items-center gap-2">
        <span className="text-muted-foreground">{character.class}</span>
        <span className="text-muted-foreground">Level {character.level}</span>
      </div>
    </Card>
  );
};
