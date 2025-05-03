
import React from 'react';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { useCreationStep } from '@/hooks/useCreationStep';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterRaceSelection from './CharacterRaceSelection';
import CharacterClassSelection from './CharacterClassSelection';
import CharacterAbilityScores from './CharacterAbilityScores';
import CharacterSubclassSelection from './CharacterSubclassSelection';
import CharacterBackground from './CharacterBackground';
import CharacterEquipmentSelection from './CharacterEquipmentSelection';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterReview from './CharacterReview';
import CharacterLevelSelection from './CharacterLevelSelection';
import CharacterLanguagesSelection from './CharacterLanguagesSelection';
import CreationStepDisplay from './CreationStepDisplay';
import { CharacterSheet } from '@/types/character';
import { steps } from '@/config/characterCreationSteps';

interface CharacterCreationContentProps {
  currentStep: number;
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll" | "manual";
  setAbilitiesMethod: (method: "pointbuy" | "standard" | "roll" | "manual") => void;
  diceResults: number[];
  getModifier: (abilityScore: number) => number;
  rollAllAbilities: () => void;
  rollSingleAbility: (index: number) => void;
  abilityScorePoints: number;
  isMagicClass: boolean;
  rollsHistory: Record<string, number[]>;
  onLevelChange: (level: number) => void;
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
  onLevelChange
}) => {
  // Функция для рендеринга текущего шага создания персонажа
  const renderCreationStep = () => {
    switch (currentStep) {
      case 1: // Базовая информация
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2: // Выбор расы
        return (
          <CharacterRaceSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3: // Выбор класса
        return (
          <CharacterClassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4: // Выбор уровня
        return (
          <CharacterLevelSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            onLevelChange={onLevelChange}
          />
        );
      case 5: // Характеристики
        return (
          <CharacterAbilityScores 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            abilitiesMethod={abilitiesMethod}
            setAbilitiesMethod={setAbilitiesMethod}
            diceResults={diceResults}
            getModifier={getModifier}
            rollAllAbilities={rollAllAbilities}
            rollSingleAbility={rollSingleAbility}
            abilityScorePoints={abilityScorePoints}
            rollsHistory={rollsHistory}
          />
        );
      case 6: // Выбор подкласса
        return (
          <CharacterSubclassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7: // Предыстория
        return (
          <CharacterBackground 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Выбор языков
        return (
          <CharacterLanguagesSelection 
            character={character as CharacterSheet}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9: // Выбор заклинаний
        return (
          <CharacterSpellSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 10: // Выбор снаряжения
        return (
          <CharacterEquipmentSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 11: // Просмотр и завершение
        return (
          <CharacterReview 
            character={character}
            prevStep={prevStep}
          />
        );
      default:
        return <div>Шаг не найден</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <CreationStepDisplay 
          steps={steps} 
          currentStep={currentStep}
          isMagicClass={isMagicClass}
          characterClass={character.class}
        />
      </div>
      <div>
        {renderCreationStep()}
      </div>
    </div>
  );
};

export default CharacterCreationContent;
