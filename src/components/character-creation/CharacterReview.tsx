
import React from 'react';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';

interface CharacterReviewProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterReview: React.FC<CharacterReviewProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  // Временный компонент, заглушка
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Обзор персонажа</h2>
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-bold text-lg">{character.name}</h3>
          <p>{character.race} {character.class}, {character.level} уровень</p>
          <p>{character.background}, {character.alignment}</p>
        </div>
      </div>
      
      <NavigationButtons
        onPrev={prevStep}
        onNext={nextStep}
        nextLabel="Завершить создание"
      />
    </div>
  );
};

export default CharacterReview;
