
import React from 'react';
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterRaceSelection from './CharacterRaceSelection';
import CharacterClassSelection from './CharacterClassSelection';
import CharacterAbilityScores from './CharacterAbilityScores';
import CharacterBackground from './CharacterBackground';
import CharacterEquipmentSelection from './CharacterEquipmentSelection';
import CharacterSpellSelection from './CharacterSpellSelection';
import CharacterReview from './CharacterReview';
import CharacterSubclassSelection from './CharacterSubclassSelection';
import CharacterHitPointsCalculator from './CharacterHitPointsCalculator';
import { CharacterSheet } from '@/types/character.d';

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
            maxAbilityScore={maxAbilityScore}
          />
        );
      case 4: // Предыстория
        return (
          <CharacterBackground 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5: // Здоровье (новый шаг)
        return (
          <CharacterHitPointsCalculator
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
      case 7: // Детали персонажа
        return (
          <CharacterBasicInfo 
            character={character} 
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8: // Выбор заклинаний
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
      case 9: // Просмотр и завершение (индекс изменился с 8 на 9)
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
