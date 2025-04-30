
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
  const [selectedSpells, setSelectedSpells] = useState<string[]>(character.spells || []);
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
      // Check if we're at the maximum spells limit
      const maxSpells = getMaxSpells();
      if (selectedSpells.length < maxSpells) {
        setSelectedSpells([...selectedSpells, spell]);
      }
    }
  };

  const getMaxSpells = () => {
    if (character.class === "Wizard" || character.class === "Sorcerer") {
      return 6;
    }
    if (character.class === "Cleric" || character.class === "Druid" || character.class === "Bard") {
      return 4;
    }
    if (character.class === "Paladin" || character.class === "Ranger" || character.class === "Warlock") {
      return 2;
    }
    return 0; // Non-magic classes
  };

  const getSpellsRemaining = () => {
    const maxSpells = getMaxSpells();
    return maxSpells - selectedSpells.length;
  };

  const canContinue = () => {
    // Magic classes must select at least 1 spell to continue
    if (character.class === "Wizard" || character.class === "Sorcerer" || 
        character.class === "Cleric" || character.class === "Druid" || 
        character.class === "Bard" || character.class === "Paladin" || 
        character.class === "Ranger" || character.class === "Warlock") {
      return selectedSpells.length > 0;
    }
    return true; // Non-magical classes can skip
  };

  const handleNext = () => {
    updateCharacter({ spells: selectedSpells });
    nextStep();
  };

  // Skip this step for non-magical classes
  if (availableSpells.length === 0) {
    useEffect(() => {
      nextStep();
    }, []);
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выберите заклинания</h2>
      
      <div className="mb-4">
        <p className="text-muted-foreground">
          Для класса <span className="font-medium text-primary">{character.class}</span> вы можете выбрать до <span className="font-medium text-primary">{getMaxSpells()}</span> заклинаний.
        </p>
        <p className="text-muted-foreground">
          Осталось выбрать: <span className="font-medium text-green-500">{getSpellsRemaining()}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {availableSpells.map((spell) => (
          <button
            key={spell}
            onClick={() => toggleSpell(spell)}
            disabled={!selectedSpells.includes(spell) && getSpellsRemaining() <= 0}
            className={`p-2 border rounded transition-colors ${
              selectedSpells.includes(spell) 
                ? "bg-green-500 text-white" 
                : getSpellsRemaining() <= 0 
                  ? "bg-gray-300 dark:bg-gray-700 opacity-50 cursor-not-allowed" 
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {spell}
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
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
