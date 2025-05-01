
import { useState, useEffect } from "react";
import { Character, AbilityScores, SpellSlots, Spell } from "@/contexts/CharacterContext";

export const useCharacterCreation = () => {
  const [character, setCharacterState] = useState({
    race: "",
    subrace: "",
    class: "",
    subclass: "",
    spells: [] as string[],
    equipment: [] as string[],
    languages: [] as string[],
    proficiencies: [] as string[],
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
    className: "",
    level: 1,
    abilities: {
      STR: 8,
      DEX: 8,
      CON: 8, 
      INT: 8,
      WIS: 8,
      CHA: 8
    } as AbilityScores,
    spellsKnown: [] as Spell[],
    spellSlots: {} as SpellSlots
  });

  // When stats change, update the abilities property to match
  useEffect(() => {
    if (character.stats) {
      setCharacterState(prev => ({
        ...prev,
        abilities: {
          STR: prev.stats.strength,
          DEX: prev.stats.dexterity,
          CON: prev.stats.constitution,
          INT: prev.stats.intelligence,
          WIS: prev.stats.wisdom,
          CHA: prev.stats.charisma
        },
        // Set className based on class and subclass
        className: `${prev.class}${prev.subclass ? ` (${prev.subclass})` : ''}`,
        // Convert raw spell names to Spell objects
        spellsKnown: prev.spells.map((name, index) => ({
          id: String(index),
          name: name,
          level: getSpellLevel(name)
        })),
        // Create spell slots based on class and level
        spellSlots: calculateSpellSlots(prev.class, prev.level)
      }));
    }
  }, [character.stats, character.class, character.subclass, character.spells, character.level]);

  // Calculate spell slots based on class and level
  const calculateSpellSlots = (className: string, level: number) => {
    if (!isMagicClass(className) || level < 1) return {};
    
    const slots: SpellSlots = {};
    // Simple spell slot calculation (simplified D&D 5e rules)
    if (["Волшебник", "Чародей", "Жрец", "Друид", "Бард"].includes(className)) {
      if (level >= 1) slots[1] = { max: Math.min(level + 1, 4), used: 0 };
      if (level >= 3) slots[2] = { max: Math.min(level - 1, 3), used: 0 };
      if (level >= 5) slots[3] = { max: Math.min(level - 3, 3), used: 0 };
      if (level >= 7) slots[4] = { max: Math.min(level - 6, 3), used: 0 };
      if (level >= 9) slots[5] = { max: Math.min(level - 8, 2), used: 0 };
      if (level >= 11) slots[6] = { max: 1, used: 0 };
      if (level >= 13) slots[7] = { max: 1, used: 0 };
      if (level >= 15) slots[8] = { max: 1, used: 0 };
      if (level >= 17) slots[9] = { max: 1, used: 0 };
    }
    // Half-casters get fewer slots
    else if (["Паладин", "Следопыт"].includes(className)) {
      // Half casters use half their level (rounded up) to determine spell slots
      const effectiveLevel = Math.ceil(level / 2);
      if (level >= 2) slots[1] = { max: Math.min(effectiveLevel + 1, 4), used: 0 };
      if (level >= 5) slots[2] = { max: Math.min(effectiveLevel - 1, 3), used: 0 };
      if (level >= 9) slots[3] = { max: Math.min(effectiveLevel - 3, 3), used: 0 };
      if (level >= 13) slots[4] = { max: Math.min(effectiveLevel - 6, 2), used: 0 };
      if (level >= 17) slots[5] = { max: Math.min(effectiveLevel - 8, 1), used: 0 };
    }
    // Warlocks have their own spell slot progression
    else if (className === "Чернокнижник") {
      const slotLevel = Math.min(Math.ceil(level / 2), 5);
      const numSlots = level === 1 ? 1 : Math.min(Math.floor((level + 1) / 2) + 1, 4);
      slots[slotLevel] = { max: numSlots, used: 0 };
    }
    
    return slots;
  };

  // Get spell level (simplified - would need a real database)
  const getSpellLevel = (spellName: string) => {
    // This is just a placeholder - in a real app, you'd look this up in a database
    return 1; // Default to level 1 for now
  };

  const updateCharacter = (updates: any) => {
    setCharacterState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Helper function to determine if a class is a magic user
  const isMagicClass = (className: string) => {
    const magicClasses = ['Волшебник', 'Чародей', 'Чернокнижник', 'Бард', 'Жрец', 'Друид', 'Паладин', 'Следопыт'];
    return magicClasses.includes(className);
  };

  // Get modifier for ability score
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return {
    character,
    updateCharacter,
    isMagicClass,
    getModifier
  };
};
