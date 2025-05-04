import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CharacterSheet } from "@/types/character";

interface CharacterBasicInfoProps {
  character: CharacterSheet;
  onNameChange: (name: string) => void;
  onGenderChange: (gender: string) => void;
  onAlignmentChange: (alignment: string) => void;
  onBackstoryChange: (backstory: string) => void;
  onIdealsChange: (ideals: string) => void;
  onBondsChange: (bonds: string) => void;
  onFlawsChange: (flaws: string) => void;
  onImageChange?: (image: string) => void;
}

const CharacterBasicInfo: React.FC<CharacterBasicInfoProps> = ({
  character,
  onNameChange,
  onGenderChange,
  onAlignmentChange,
  onBackstoryChange,
  onIdealsChange,
  onBondsChange,
  onFlawsChange,
  onImageChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Заглушка для компонента с основной информацией</p>
        {/* Здесь будет реализован выбор имени, пола и прочих базовых характеристик */}
      </CardContent>
    </Card>
  );
};

export { CharacterBasicInfo };
