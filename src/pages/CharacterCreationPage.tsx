import React, { useState } from "react";

import CharacterRaceSelection from "@/components/character-creation/CharacterRaceSelection";
import CharacterClassSelection from "@/components/character-creation/CharacterClassSelection";
import CharacterSpellSelection from "@/components/character-creation/CharacterSpellSelection";
import CharacterBasicInfo from "@/components/character-creation/CharacterBasicInfo";
import CharacterAbilityScores from "@/components/character-creation/CharacterAbilityScores";
import CharacterBackground from "@/components/character-creation/CharacterBackground";
import CharacterReview from "@/components/character-creation/CharacterReview";

const steps = [
  { id: "race", title: "Выбор расы" },
  { id: "class", title: "Выбор класса" },
  { id: "spells", title: "Выбор заклинаний" }, // 🆕 новый шаг
  { id: "info", title: "Основная информация" },
  { id: "stats", title: "Распределение характеристик" },
  { id: "background", title: "Предыстория" },
  { id: "review", title: "Обзор персонажа" },
];

const CharacterCreationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [character, setCharacter] = useState({
    race: "",
    class: "",
    spells: [] as string[],
    name: "",
    gender: "",
    alignment: "",
    stats: {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    },
    background: "",
  });

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const updateCharacter = (updates: any) => {
    setCharacter((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Создание персонажа</h1>

      {/* Прогресс шагов */}
      <div className="flex space-x-4 justify-center mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`p-2 rounded font-semibold ${
              currentStep === index
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {step.title}
          </div>
        ))}
      </div>

      {/* Контент шага */}
      <div className="max-w-4xl mx-auto">
        {currentStep === 0 && (
          <CharacterRaceSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 1 && (
          <CharacterClassSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 2 && (
          <CharacterSpellSelection
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 3 && (
          <CharacterBasicInfo
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 4 && (
          <CharacterAbilityScores
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 5 && (
          <CharacterBackground
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}

        {currentStep === 6 && (
          <CharacterReview
            character={character}
            prevStep={prevStep}
          />
        )}
      </div>
    </div>
  );
};

export default CharacterCreationPage;
