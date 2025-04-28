import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

const backgrounds = [
  "Аколит",
  "Преступник",
  "Шарлатан",
  "Разведчик",
  "Ремесленник",
  "Дворянин",
  "Отшельник",
  "Беспризорник",
  "Моряк",
  "Учёный",
  "Солдат",
  "Ремесленник гильдии",
];

interface CharacterBackgroundProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string>(character.background || "");

  const handleNext = () => {
    updateCharacter({ background: selectedBackground });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите предысторию</h2>
      <p className="mb-6 text-muted-foreground">
        Предыстория определяет происхождение и жизненный опыт вашего персонажа.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {backgrounds.map((bg) => (
          <button
            key={bg}
            onClick={() => setSelectedBackground(bg)}
            className={`p-2 border rounded ${
              selectedBackground === bg
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {bg}
          </button>
        ))}
      </div>

      {/* КНОПКИ НАВИГАЦИИ */}
      <NavigationButtons
        allowNext={!!selectedBackground}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBackground;
