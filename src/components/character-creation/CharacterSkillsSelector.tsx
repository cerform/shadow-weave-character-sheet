
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterSkillsSelectorProps {
  character: CharacterSheet;
  onSkillChange: (skills: string[]) => void;
}

export const CharacterSkillsSelector: React.FC<CharacterSkillsSelectorProps> = ({
  character,
  onSkillChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выбор навыков</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента выбора навыков</p>
        {/* Здесь будет реализован выбор навыков */}
      </CardContent>
    </Card>
  );
};
