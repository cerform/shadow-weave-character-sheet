
import React, { useState } from "react";
import CharacterRaceSelection from "./CharacterRaceSelection";
import CharacterClassSelection from "./CharacterClassSelection";
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
  isMagicClass: (className: string) => boolean;
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
  isMagicClass
}) => {
  
  // Determine the actual step index based on character class (magic vs non-magic)
  const getAdjustedStepIndex = (baseIndex: number) => {
    if (!isMagicClass(character.class) && baseIndex > 3) {
      return baseIndex - 1;
    }
    return baseIndex;
  };

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
            
            {abilitiesMethod === "roll" && (
              <div className="bg-muted/30 p-4 rounded-md mb-4">
                <h4 className="font-semibold mb-2">Результаты бросков (4d6, отбрасывая наименьшее):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {diceResults.map((roll, idx) => {
                    // Sort and drop lowest
                    const sorted = [...roll].sort((a, b) => b - a);
                    const total = sorted.slice(0, 3).reduce((a, b) => a + b, 0);
                    
                    return (
                      <div key={idx} className="p-2 bg-background rounded-md text-center">
                        <div className="font-semibold">{total}</div>
                        <div className="text-sm text-muted-foreground">
                          {roll.join(', ')} → {sorted.slice(0, 3).join(' + ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button 
                  onClick={rollAllAbilities}
                  className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded"
                >
                  Перебросить все
                </button>
              </div>
            )}
          </div>
          
          <CharacterAbilityScores
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            abilitiesMethod={abilitiesMethod}
            diceResults={diceResults}
            getModifier={getModifier}
          />
        </div>
      );
    case 3:
      return isMagicClass(character.class) ? (
        <CharacterSpellSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      ) : nextStep(); // Skip this step for non-magic classes
    case 4:
    case 3 /* Non-magic class */: 
      return (
        <CharacterEquipmentSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 5:
    case 4 /* Non-magic class */: 
      return (
        <CharacterLanguagesSelection
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 6:
    case 5 /* Non-magic class */: 
      return (
        <CharacterBasicInfo
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 7:
    case 6 /* Non-magic class */: 
      return (
        <CharacterBackground
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    case 8:
    case 7 /* Non-magic class */: 
      return (
        <CharacterReview
          character={character}
          prevStep={prevStep}
        />
      );
    default:
      return null;
  }
};

export default CharacterCreationContent;
