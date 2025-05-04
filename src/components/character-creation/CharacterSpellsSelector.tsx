
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterSpellsSelectorProps {
  character: CharacterSheet;
  onSpellChange: (spells: string[]) => void;
}

export const CharacterSpellsSelector: React.FC<CharacterSpellsSelectorProps> = ({
  character,
  onSpellChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор заклинаний</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора заклинаний</p>
        {/* Здесь будет реализован выбор заклинаний */}
      </CardContent>
    </Card>
  );
};
