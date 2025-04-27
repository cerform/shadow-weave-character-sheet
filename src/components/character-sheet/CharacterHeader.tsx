
import React from 'react';
import { Card } from "@/components/ui/card";

interface CharacterHeaderProps {
  name: string;
  class: string;
  level: number;
}

export const CharacterHeader = ({ name, class: characterClass, level }: CharacterHeaderProps) => {
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h1 className="text-2xl font-bold text-center mb-2">{name}</h1>
      <div className="flex justify-center items-center gap-2">
        <span className="text-muted-foreground">{characterClass}</span>
        <span className="text-muted-foreground">Level {level}</span>
      </div>
    </Card>
  );
};
