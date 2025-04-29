
import React, { useState, useEffect } from "react";
import NavigationButtons from "@/components/character-creation/NavigationButtons";
import { races } from "@/data/races";
import { Character } from "@/contexts/CharacterContext";

interface CharacterRaceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
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
  const [selectedSubrace, setSelectedSubrace] = useState<string>(character.subrace || "");
  const [subraces, setSubraces] = useState<{ name: string; description: string }[]>([]);
  const [raceTraits, setRaceTraits] = useState<{ name: string; description: string }[]>([]);

  // Находим детали выбранной расы
  useEffect(() => {
    if (selectedRace) {
      const race = races.find(r => r.name === selectedRace);
      if (race) {
        setSubraces(race.subraces?.map(s => ({ name: s.name, description: s.description })) || []);
        setRaceTraits(race.traits.map(t => ({ name: t.name, description: t.description })));
        
        // Если была выбрана подраса, а затем пользователь выбрал новую расу, сбрасываем подрасу
        if (selectedSubrace && !race.subraces?.some(s => s.name === selectedSubrace)) {
          setSelectedSubrace("");
        }
      }
    }
  }, [selectedRace, selectedSubrace]);

  const handleNext = () => {
    if (selectedRace) {
      // Используем updateCharacter вместо прямого обновления объекта
      updateCharacter({ 
        race: selectedRace, 
        subrace: selectedSubrace 
      });
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
            className={`p-4 border rounded text-left ${
              selectedRace === race.name ? "bg-primary text-primary-foreground" : "bg-background"
            }`}
          >
            <div className="font-semibold">{race.name}</div>
            <div className="text-sm">{race.description}</div>
          </button>
        ))}
      </div>

      {/* Отображаем подрасы, если они доступны и раса выбрана */}
      {selectedRace && subraces.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Выберите подрасу для {selectedRace}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subraces.map((subrace) => (
              <button
                key={subrace.name}
                onClick={() => setSelectedSubrace(subrace.name)}
                className={`p-3 border rounded text-left ${
                  selectedSubrace === subrace.name ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                <div className="font-medium">{subrace.name}</div>
                <div className="text-sm">{subrace.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Отображаем характеристики выбранной расы */}
      {selectedRace && (
        <div className="mb-8 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Особенности расы: {selectedRace}</h3>
          
          <div className="space-y-3">
            {raceTraits.map((trait, idx) => (
              <div key={idx}>
                <span className="font-medium">{trait.name}:</span> {trait.description}
              </div>
            ))}
          </div>
        </div>
      )}

      <NavigationButtons
        allowNext={!!selectedRace && (subraces.length === 0 || !!selectedSubrace)}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
