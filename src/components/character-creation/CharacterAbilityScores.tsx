
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet, AbilityScoreMethod } from "@/types/character";

interface CharacterAbilityScoresProps {
  character: CharacterSheet;
  availablePoints: number;
  abilityScoreMethod: AbilityScoreMethod;
  onAbilityScoreMethodChange: (method: AbilityScoreMethod) => void;
  onAbilityScoreChange: (ability: string, value: number) => void;
  onAbilityPointsUsedChange?: (points: number) => void;
}

export const CharacterAbilityScores: React.FC<CharacterAbilityScoresProps> = ({
  character,
  availablePoints,
  abilityScoreMethod,
  onAbilityScoreMethodChange,
  onAbilityScoreChange,
  onAbilityPointsUsedChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Характеристики персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента редактирования характеристик</p>
        {/* Здесь будет реализовано редактирование характеристик */}
      </CardContent>
    </Card>
  );
};

export default CharacterAbilityScores;
