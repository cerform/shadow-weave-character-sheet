
import React from 'react';
import { Character } from '@/types/character';
import CharacterRace from './CharacterRace';
import CharacterClass from './CharacterClass';
import CharacterBackground from './CharacterBackground';
import CharacterAbilities from './CharacterAbilities';
import CharacterEquipment from './CharacterEquipment';
import CharacterSpells from './CharacterSpells';
import CharacterReview from './CharacterReview';
import CharacterLevelSelection from './CharacterLevelSelection';
import { backgrounds } from '@/data/backgrounds'; // Import backgrounds data
import { classes } from '@/data/classes'; // Import classes data

interface CharacterCreationContentProps {
  step: number;
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveCharacter: () => void;
}

const CharacterCreationContent: React.FC<CharacterCreationContentProps> = ({
  step,
  character,
  updateCharacter,
  nextStep,
  prevStep,
  saveCharacter
}) => {
  // Handle level change
  const handleLevelChange = (level: number) => {
    updateCharacter({ level });
  };

  // Modified to use correct props
  switch (step) {
    case 1:
      return (
        <CharacterRace
          character={character}
          onUpdate={updateCharacter}
        />
      );
    case 2:
      return (
        <CharacterClass
          character={character}
          onUpdate={updateCharacter}
          classes={classes}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <CharacterLevelSelection
          character={character}
          onUpdate={updateCharacter} // Use onUpdate instead of updateCharacter
          nextStep={nextStep}
          prevStep={prevStep}
          onLevelChange={handleLevelChange}
        />
      );
    case 4:
      return (
        <CharacterAbilities
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 5:
      return (
        <CharacterBackground
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
          backgrounds={backgrounds} // Pass backgrounds data
        />
      );

    default:
      return null;
  }
};

export default CharacterCreationContent;
