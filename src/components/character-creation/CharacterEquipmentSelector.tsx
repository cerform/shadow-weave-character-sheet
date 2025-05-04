
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterEquipmentSelectorProps {
  character: CharacterSheet;
  onEquipmentChange: (equipment: string[]) => void;
}

export const CharacterEquipmentSelector: React.FC<CharacterEquipmentSelectorProps> = ({
  character,
  onEquipmentChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор снаряжения</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора снаряжения</p>
        {/* Здесь будет реализован выбор снаряжения */}
      </CardContent>
    </Card>
  );
};
