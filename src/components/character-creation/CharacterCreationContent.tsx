
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
import { CharacterSheet } from '@/types/character';
import { steps } from '@/config/characterCreationSteps';

interface CharacterCreationContentProps {
  currentStep: number;
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll" | "manual";
  setAbilitiesMethod: (method: "pointbuy" | "standard" | "roll" | "manual") => void;
  diceResults: number[][];
  getModifier: (abilityScore: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility: (index: number) => { rolls: number[]; total: number };
  abilityScorePoints: number;
  isMagicClass: boolean;
  rollsHistory: { ability: string; rolls: number[]; total: number }[];
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
      case 0: // Выбор расы
        return (
          <CharacterRaceSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 1: // Выбор класса
        return (
          <CharacterClassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2: // Выбор уровня
        return (
          <CharacterLevelSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            onLevelChange={onLevelChange}
          />
        );
      case 3: // Характеристики
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
      case 4: // Выбор подкласса
        return (
          <CharacterSubclassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5: // Выбор заклинаний
        if (!isMagicClass) {
          nextStep(); // Пропускаем этот шаг для немагических классов
          return null;
        }
        return (
          <CharacterSpellSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6: // Выбор снаряжения
        return (
          <CharacterEquipmentSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7: // Выбор языков
        return (
          <CharacterLanguagesSelection 
            character={character as CharacterSheet}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Выбор личностных черт
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9: // Предыстория
        return (
          <CharacterBackground 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 10: // Просмотр и завершение
        return (
          <CharacterReview 
            character={character}
            prevStep={prevStep}
          />
        );
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Шаг не найден</h3>
            <p>Выбранный шаг создания персонажа недоступен. Пожалуйста, вернитесь к началу создания.</p>
            <button 
              onClick={() => prevStep()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
            >
              Вернуться
            </button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        {renderCreationStep()}
      </div>
    </div>
  );
};

export default CharacterCreationContent;
