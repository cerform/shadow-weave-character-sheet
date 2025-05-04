
import React, { useEffect } from 'react';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterRaceSelection from './CharacterRaceSelection';
import CharacterClassSelection from './CharacterClassSelection';
import CharacterAbilityScores from './CharacterAbilityScores';
import CharacterMulticlassing from './CharacterMulticlassing';
import CharacterBackground from './CharacterBackground';
import CharacterEquipmentSelection from './CharacterEquipmentSelection';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterReview from './CharacterReview';
import CharacterLevelSelection from './CharacterLevelSelection';
import CharacterLanguagesSelection from './CharacterLanguagesSelection';
import CharacterSubclassSelection from './CharacterSubclassSelection';
import { CharacterSheet } from '@/types/character.d';
import { steps } from '@/config/characterCreationSteps';

// Импорт даннных о подклассах для проверки их наличия
import { subclassData } from '@/data/subclasses';

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
  // Проверка, есть ли подклассы для выбранного класса
  const hasSubclasses = () => {
    if (!character.class) return false;
    const classSubclasses = subclassData[character.class];
    return classSubclasses && Object.keys(classSubclasses).length > 0;
  };

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
      case 2: // Выбор архетипа (подкласса)
        return (
          <CharacterSubclassSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3: // Выбор уровня
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
      case 5: // Мультиклассирование
        return (
          <CharacterMulticlassing 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            getModifier={getModifier}
          />
        );
      case 6: // Выбор заклинаний
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
      case 7: // Выбор снаряжения
        return (
          <CharacterEquipmentSelection 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Выбор языков
        return (
          <CharacterLanguagesSelection 
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9: // Выбор личностных черт
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 10: // Предыстория
        return (
          <CharacterBackground 
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
