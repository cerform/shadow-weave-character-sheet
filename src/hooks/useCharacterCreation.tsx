
import { useState, useEffect } from "react";
import { Character, AbilityScores, SpellSlots, Spell } from "@/contexts/CharacterContext";

export const useCharacterCreation = () => {
  const [character, setCharacter] = useState({
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
      setCharacter(prev => ({
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
          level: 0
        })),
        // Create basic spell slots based on class
        spellSlots: isMagicClass(prev.class) ? { 1: { max: 2, used: 0 } } : {}
      }));
    }
  }, [character.stats, character.class, character.subclass, character.spells]);

  const updateCharacter = (updates: any) => {
    setCharacter((prev) => ({
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
