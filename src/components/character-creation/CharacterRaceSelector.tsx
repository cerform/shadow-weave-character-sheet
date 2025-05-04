
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterRaceSelectorProps {
  character: CharacterSheet;
  onRaceChange: (race: string) => void;
}

export const CharacterRaceSelector: React.FC<CharacterRaceSelectorProps> = ({
  character,
  onRaceChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор расы</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора расы</p>
        {/* Здесь будет реализован выбор расы */}
      </CardContent>
    </Card>
  );
};
