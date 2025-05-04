
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterClassSelectorProps {
  character: CharacterSheet;
  onClassChange: (className: string) => void;
  onLevelChange: (level: number) => void;
  onAdditionalClassChange?: (classes: any[]) => void;
  onSubclassChange?: (subclass: string) => void;
}

export const CharacterClassSelector: React.FC<CharacterClassSelectorProps> = ({
  character,
  onClassChange,
  onLevelChange,
  onAdditionalClassChange,
  onSubclassChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор класса персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора класса</p>
        {/* Здесь будет реализован выбор класса */}
      </CardContent>
    </Card>
  );
};
