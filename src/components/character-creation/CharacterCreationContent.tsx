
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
import { backgrounds } from '@/data/backgrounds';
import { classes } from '@/data/classes';
import { races } from '@/data/races';

interface CharacterCreationContentProps {
  currentStep: number;
  character: Partial<Character>;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll" | "manual";
  setAbilitiesMethod: React.Dispatch<React.SetStateAction<"pointbuy" | "standard" | "roll" | "manual">>;
  diceResults: number[][];
  getModifier: (abilityScore: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility: (index: number) => { rolls: number[]; total: number };
  abilityScorePoints: number;
  isMagicClass: boolean;
  rollsHistory: { ability: string; rolls: number[]; total: number }[];
  onLevelChange: (level: number) => void;
  maxAbilityScore: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const CharacterCreationContent: React.FC<CharacterCreationContentProps> = ({
  currentStep,
  character,
  updateCharacter,
  nextStep,
  prevStep,
  abilitiesMethod,
  setAbilitiesMethod,
  diceResults,
  getModifier,
  rollAllAbilities,
  rollSingleAbility,
  abilityScorePoints,
  isMagicClass,
  rollsHistory,
  onLevelChange,
  maxAbilityScore,
  setCurrentStep
}) => {
  // Handle level change
  const handleLevelChange = (level: number) => {
    onLevelChange(level);
  };

  // Modified to use correct props
  switch (currentStep) {
    case 0:
      return (
        <CharacterRace
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 2:
      return (
        <CharacterClass
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <CharacterLevelSelection
          character={character}
          onUpdate={updateCharacter}
          onLevelChange={handleLevelChange}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 4:
      return (
        <CharacterAbilities
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
          method={abilitiesMethod}
          setMethod={setAbilitiesMethod}
          diceResults={diceResults}
          getModifier={getModifier}
          rollAllAbilities={rollAllAbilities}
          rollSingleAbility={rollSingleAbility}
          pointsRemaining={abilityScorePoints}
          rollsHistory={rollsHistory}
          maxScore={maxAbilityScore}
        />
      );
    case 5:
      return (
        <CharacterBackground
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 9:
      return (
        <CharacterSpells
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 10:
      return (
        <CharacterReview
          character={character}
          onUpdate={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    // Add more cases for other steps
    default:
      // For now, show a placeholder for other steps
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Шаг {currentStep + 1}</h2>
          <p className="text-muted-foreground">
            Этот раздел находится в разработке.
          </p>
          <div className="flex justify-between mt-8">
            <button 
              className="px-4 py-2 bg-gray-700 rounded"
              onClick={prevStep}
            >
              Назад
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 rounded"
              onClick={nextStep}
            >
              Далее
            </button>
          </div>
        </div>
      );
  }
};

export default CharacterCreationContent;
