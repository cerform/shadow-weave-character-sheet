import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterReviewProps {
  character: CharacterSheet;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({ character }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Обзор персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента просмотра персонажа</p>
        {/* Здесь будет реализовано отображение созданного персонажа */}
      </CardContent>
    </Card>
  );
};

export default CharacterReview;
