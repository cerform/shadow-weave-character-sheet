
import React from "react";
import CharacterRaceSelection from "./CharacterRaceSelection";
import CharacterClassSelection from "./CharacterClassSelection";
import CharacterLevelSelection from "./CharacterLevelSelection";
import CharacterAbilityScores from "./CharacterAbilityScores";
import CharacterSpellSelection from "./CharacterSpellSelection";
import CharacterEquipmentSelection from "./CharacterEquipmentSelection";
import CharacterLanguagesSelection from "./CharacterLanguagesSelection";
import CharacterBasicInfo from "./CharacterBasicInfo";
import CharacterBackground from "./CharacterBackground";
import CharacterReview from "./CharacterReview";
import CharacterSubclassSelection from "./CharacterSubclassSelection"; // Импортируем новый компонент

interface Props {
  currentStep: number;
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  abilitiesMethod: "pointbuy" | "standard" | "roll";
  setAbilitiesMethod: (method: "pointbuy" | "standard" | "roll") => void;
  diceResults: number[][];
  getModifier: (score: number) => string;
  rollAllAbilities: () => void;
  rollSingleAbility: (abilityIndex: number) => { rolls: number[]; total: number; };
  abilityScorePoints: number;
  isMagicClass: boolean;
  rollsHistory: { ability: string; rolls: number[]; total: number; }[];
  onLevelChange: (level: number) => void;
}

const CharacterCreationContent: React.FC<Props> = ({
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
}) => {
  // Добавляем проверку на подкласс перед заклинаниями
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CharacterRaceSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 1:
        return (
          <CharacterClassSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 2:
        return (
          <CharacterLevelSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            onLevelChange={onLevelChange}
          />
        );
      case 3:
        return (
          <CharacterAbilityScores
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            method={abilitiesMethod}
            setMethod={setAbilitiesMethod}
            diceResults={diceResults}
            getModifier={getModifier}
            rollAllAbilities={rollAllAbilities}
            rollSingleAbility={rollSingleAbility}
            abilityScorePoints={abilityScorePoints}
            rollsHistory={rollsHistory}
          />
        );
      case 4:
        return (
          <CharacterSubclassSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 5:
        // Если класс может использовать магию, показываем выбор заклинаний
        if (isMagicClass) {
          return (
            <CharacterSpellSelection
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          );
        }
        // Иначе сразу переходим к выбору снаряжения
        return (
          <CharacterEquipmentSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 6:
        // Если ранее показали заклинания, то здесь будет снаряжение
        if (isMagicClass) {
          return (
            <CharacterEquipmentSelection
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          );
        }
        // Иначе переходим к выбору языков
        return (
          <CharacterLanguagesSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 7:
        // Если ранее показали заклинания, то здесь будут языки
        if (isMagicClass) {
          return (
            <CharacterLanguagesSelection
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          );
        }
        // Иначе переходим к основной информации
        return (
          <CharacterBasicInfo
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 8:
        // Если ранее показали заклинания, то здесь будет основная информация
        if (isMagicClass) {
          return (
            <CharacterBasicInfo
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          );
        }
        // Иначе переходим к предыстории
        return (
          <CharacterBackground
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 9:
        // Если ранее показали заклинания, то здесь будет предыстория
        if (isMagicClass) {
          return (
            <CharacterBackground
              character={character}
              updateCharacter={updateCharacter}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          );
        }
        // Иначе переходим к обзору
        return <CharacterReview character={character} prevStep={prevStep} />;
      case 10:
        // Если ранее показали заклинания, то сюда добавляем обзор
        return <CharacterReview character={character} prevStep={prevStep} />;
      default:
        return null;
    }
  };

  return renderStepContent();
};

export default CharacterCreationContent;
