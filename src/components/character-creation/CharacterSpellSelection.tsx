import React, { useState, useEffect } from "react";
import { SPELLS } from "@/data/spells";
import NavigationButtons from "@/components/character-creation/NavigationButtons";

interface CharacterSpellSelectionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSpellSelection: React.FC<CharacterSpellSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [availableSpells, setAvailableSpells] = useState<string[]>([]);

  useEffect(() => {
    if (character.class && SPELLS[character.class]) {
      setAvailableSpells(SPELLS[character.class]);
    } else {
      setAvailableSpells([]);
    }
  }, [character.class]);

  const toggleSpell = (spell: string) => {
    if (selectedSpells.includes(spell)) {
      setSelectedSpells(selectedSpells.filter((s) => s !== spell));
    } else {
      setSelectedSpells([...selectedSpells, spell]);
    }
  };

  const canContinue = () => {
    if (character.class === "Wizard" || character.class === "Sorcerer") {
      return selectedSpells.length >= 6;
    }
    if (character.class === "Cleric" || character.class === "Druid" || character.class === "Bard") {
      return selectedSpells.length >= 4;
    }
    if (character.class === "Paladin" || character.class === "Ranger" || character.class === "Warlock") {
      return selectedSpells.length >= 2;
    }
    return true; // Немагические классы — шаг пропускается
  };

  const handleNext = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  if (availableSpells.length === 0) {
    // Если нет доступных заклинаний — пропускаем этот шаг
    useEffect(() => {
      nextStep();
    }, []);
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите заклинания</h2>
      <p className="mb-4 text-muted-foreground">
        Выберите необходимые заклинания для вашего класса.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {availableSpells.map((spell) => (
          <button
            key={spell}
            onClick={() => toggleSpell(spell)}
            className={`p-2 border rounded ${
              selectedSpells.includes(spell) ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {spell}
          </button>
        ))}
      </div>

      {/* КНОПКИ НАВИГАЦИИ */}
      <NavigationButtons
        allowNext={canContinue()}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSpellSelection;
