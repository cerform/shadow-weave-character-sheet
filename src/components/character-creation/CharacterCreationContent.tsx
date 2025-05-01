
import React, { useState, useEffect } from "react";
import CharacterRaceSelection from "./CharacterRaceSelection";
import CharacterClassSelection from "./CharacterClassSelection";
import CharacterLevelSelection from "./CharacterLevelSelection";
import CharacterSpellSelection from "./CharacterSpellSelection";
import CharacterBasicInfo from "./CharacterBasicInfo";
import CharacterAbilityScores from "./CharacterAbilityScores";
import CharacterBackground from "./CharacterBackground";
import CharacterReview from "./CharacterReview";
import CharacterEquipmentSelection from "./CharacterEquipmentSelection";
import CharacterLanguagesSelection from "./CharacterLanguagesSelection";

interface CharacterCreationContentProps {
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
  rollSingleAbility?: (abilityIndex: number) => { rolls: number[]; total: number };
  abilityScorePoints?: number;
  isMagicClass: (className: string) => boolean;
  rollsHistory?: { ability: string, rolls: number[], total: number }[];
  onLevelChange?: (level: number) => void;
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
  rollsHistory = [],
  onLevelChange = () => {}
}) => {
  
  // useEffect to skip spell selection step for non-magic classes
  useEffect(() => {
    if (currentStep === 4 && character.class && !isMagicClass(character.class)) {
      nextStep();
    }
  }, [currentStep, character.class, isMagicClass, nextStep]);

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
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Выберите способ распределения характеристик</h3>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={() => setAbilitiesMethod("standard")}
                className={`px-4 py-2 rounded ${abilitiesMethod === "standard" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Стандартный набор
              </button>
              <button
                onClick={() => setAbilitiesMethod("pointbuy")}
                className={`px-4 py-2 rounded ${abilitiesMethod === "pointbuy" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Покупка очков
              </button>
              <button
                onClick={() => {
                  setAbilitiesMethod("roll");
                  rollAllAbilities();
                }}
                className={`px-4 py-2 rounded ${abilitiesMethod === "roll" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Бросок кубиков
              </button>
            </div>
          </div>
          
          <CharacterAbilityScores
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            abilitiesMethod={abilitiesMethod}
            diceResults={diceResults}
            getModifier={getModifier}
            rollAllAbilities={rollAllAbilities}
            rollSingleAbility={rollSingleAbility}
            abilityScorePoints={abilityScorePoints}
            rollsHistory={rollsHistory}
          />
        </div>
      );
    case 4:
      // Return spell selection for magic classes, or a loading placeholder for non-magic classes
      // that will be redirected by the useEffect
      return isMagicClass(character.class) ? (
        <CharacterSpellSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      ) : (
        <div className="text-center py-4">Переход...</div>
      );
    case 5:
      return (
        <CharacterEquipmentSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 6:
      return (
        <CharacterLanguagesSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 7:
      return (
        <CharacterBasicInfo
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 8:
      return (
        <CharacterBackground
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 9:
      return (
        <CharacterReview
          character={character}
          prevStep={prevStep}
        />
      );
    default:
      // Return a placeholder for any unsupported steps
      return (
        <div className="text-center py-4">
          Неизвестный шаг создания персонажа
        </div>
      );
  }
};

export default CharacterCreationContent;
