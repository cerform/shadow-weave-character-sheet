
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterPersonalityProps {
  character: CharacterSheet;
  onPersonalityChange: (personality: any) => void;
}

export const CharacterPersonality: React.FC<CharacterPersonalityProps> = ({
  character,
  onPersonalityChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Личность персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента редактирования личности</p>
        {/* Здесь будет реализован выбор личностных характеристик */}
      </CardContent>
    </Card>
  );
};
