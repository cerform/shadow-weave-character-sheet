
import React from 'react';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterRaceSelection from './CharacterRaceSelection';
import CharacterClassSelection from './CharacterClassSelection';
import CharacterAbilityScores from './CharacterAbilityScores';
import CharacterBackground from './CharacterBackground';
import CharacterEquipmentSelection from './CharacterEquipmentSelection';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterReview from './CharacterReview';
import CharacterHitPointsCalculator from './CharacterHitPointsCalculator';
import { CharacterSheet } from '@/types/character.d';

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
  maxAbilityScore?: number;
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
  maxAbilityScore
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
      case 1: // Выбор класса и подкласса
        return (
          <CharacterClassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2: // Характеристики
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
            maxAbilityScore={maxAbilityScore}
          />
        );
      case 3: // Предыстория
        return (
          <CharacterBackground 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 4: // Здоровье (обновленный индекс с 5 на 4)
        return (
          <CharacterHitPointsCalculator
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5: // Выбор снаряжения (обновленный индекс с 6 на 5)
        return (
          <CharacterEquipmentSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6: // Детали персонажа (обновленный индекс с 7 на 6)
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7: // Выбор заклинаний (обновленный индекс с 8 на 7)
        // Проверяем, является ли класс магическим
        if (!isMagicClass) {
          // Автоматически переходим к следующему шагу с задержкой
          setTimeout(() => nextStep(), 0);
          // Возвращаем пустой фрагмент во время перехода
          return <></>;
        }
        return (
          <CharacterSpellSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Просмотр и завершение (обновленный индекс с 9 на 8)
        return (
          <CharacterReview 
            character={character}
            prevStep={prevStep}
            updateCharacter={updateCharacter}
          />
        );
      default:
        return (
          <div className="p-6 text-center">
            <p>Неизвестный шаг создания персонажа.</p>
          </div>
        );
    }
  };

  return renderCreationStep();
};

export default CharacterCreationContent;
