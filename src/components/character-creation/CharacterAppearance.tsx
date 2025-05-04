
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterAppearanceProps {
  character: CharacterSheet;
  onAppearanceChange: (appearance: string) => void;
}

export const CharacterAppearance: React.FC<CharacterAppearanceProps> = ({
  character,
  onAppearanceChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Внешность персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента редактирования внешности</p>
        {/* Здесь будет реализован выбор внешнего вида */}
      </CardContent>
    </Card>
  );
};
