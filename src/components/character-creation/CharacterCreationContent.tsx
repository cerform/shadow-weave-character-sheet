
import React from 'react';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterRaceSelection from './CharacterRaceSelection';
import CharacterSubraceSelection from './CharacterSubraceSelection';
import CharacterClassSelection from './CharacterClassSelection';
import CharacterLevelSelection from './CharacterLevelSelection';
import CharacterMulticlassing from './CharacterMulticlassing';
import CharacterAbilityScores from './CharacterAbilityScores';
import CharacterBackground from './CharacterBackground';
import CharacterEquipmentSelection from './CharacterEquipmentSelection';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterReview from './CharacterReview';
import CharacterHitPointsCalculator from './CharacterHitPointsCalculator';
import { Character } from '@/types/character';

// Character type is now the primary type
interface CharacterCreationContentProps {
  currentStep: number;
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
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
  setCurrentStep: (step: number) => void;
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
      case 1: // Выбор подрасы (если доступно)
        return (
          <CharacterSubraceSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2: // Выбор класса и подкласса
        return (
          <CharacterClassSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3: // Выбор основного уровня персонажа
        return (
          <CharacterLevelSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            onLevelChange={onLevelChange}
          />
        );
      case 4: // Характеристики
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
      case 5: // Предыстория
        return (
          <CharacterBackground 
            character={character} 
            onUpdate={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6: // Здоровье
        return (
          <CharacterHitPointsCalculator
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7: // Выбор снаряжения
        return (
          <CharacterEquipmentSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Детали персонажа
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9: // Выбор заклинаний
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
      case 10: // Просмотр и завершение
        return (
          <CharacterReview 
            character={character}
            prevStep={prevStep}
            updateCharacter={updateCharacter}
            setCurrentStep={setCurrentStep}
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
