
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterBackgroundSelectorProps {
  character: CharacterSheet;
  onBackgroundChange: (background: string) => void;
  onProficiencyChange?: (proficiencies: string[]) => void;
}

export const CharacterBackgroundSelector: React.FC<CharacterBackgroundSelectorProps> = ({
  character,
  onBackgroundChange,
  onProficiencyChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор предыстории</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора предыстории</p>
        {/* Здесь будет реализован выбор предыстории */}
      </CardContent>
    </Card>
  );
};
