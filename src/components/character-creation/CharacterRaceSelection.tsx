import React, { useState } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

const races = [
  { name: "Человек", description: "Универсальная раса, приспособленная к разным условиям." },
  { name: "Эльф", description: "Долгоживущие существа, любящие природу и магию." },
  { name: "Дварф", description: "Выносливые и крепкие существа гор." },
  { name: "Полурослик", description: "Маленькие, ловкие и очень жизнерадостные существа." },
  // Добавь сюда все остальные расы при желании
];

interface CharacterRaceSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterRaceSelection: React.FC<CharacterRaceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedRace, setSelectedRace] = useState<string>(character.race || "");

  const handleNext = () => {
    if (selectedRace) {
      updateCharacter({ race: selectedRace });
      nextStep();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите расу</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {races.map((race) => (
          <button
            key={race.name}
            onClick={() => setSelectedRace(race.name)}
            className={`p-4 border rounded ${
              selectedRace === race.name ? "bg-green-500 text-white" : "bg-background"
            }`}
          >
            <div className="font-semibold">{race.name}</div>
            <div className="text-sm text-muted-foreground">{race.description}</div>
          </button>
        ))}
      </div>

      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterRaceSelection;
