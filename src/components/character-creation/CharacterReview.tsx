
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterReviewProps {
  character: CharacterSheet;
}

export const CharacterReview: React.FC<CharacterReviewProps> = ({ character }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Обзор персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента с обзором персонажа</p>
        {/* Здесь будет реализован обзор всех характеристик персонажа */}
      </CardContent>
    </Card>
  );
};

export default CharacterReview;
