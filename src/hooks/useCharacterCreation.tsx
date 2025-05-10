
import { useState, useCallback } from 'react';
import { Character } from '@/types/character';
import { getDefaultAbilities } from '@/utils/characterUtils';

export const useCharacterCreation = () => {
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    race: '',
    subrace: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    experience: 0,
    ...getDefaultAbilities(),
    maxHp: 0,
    currentHp: 0,
    temporaryHp: 0,
    equipment: [],
    spells: [],
    features: [],
    proficiencies: {
      skills: [],
      tools: [],
      weapons: [],
      armor: [],
      languages: []
    }
  });

  // Update character function
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacter(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Function to check if the character's class is a magic user
  const isMagicClass = useCallback((char: Partial<Character>) => {
    const magicClasses = [
      "бард", "волшебник", "жрец", "друид", "чародей", "колдун", 
      "паладин", "следопыт", "изобретатель"
    ];
    
    if (!char.class) return false;
    
    return magicClasses.some(cls => 
      char.class?.toLowerCase().includes(cls.toLowerCase())
    );
  }, []);

  // Convert partial character to full Character
  const convertToCharacter = useCallback((partialCharacter: Partial<Character>): Character => {
    // Provide defaults for all required fields
    return {
      id: partialCharacter.id || '',
      name: partialCharacter.name || 'Безымянный',
      race: partialCharacter.race || '',
      subrace: partialCharacter.subrace || '',
      class: partialCharacter.class || '',
      level: partialCharacter.level || 1,
      background: partialCharacter.background || '',
      alignment: partialCharacter.alignment || 'Нейтральный',
      experience: partialCharacter.experience || 0,
      strength: partialCharacter.strength || 10,
      dexterity: partialCharacter.dexterity || 10,
      constitution: partialCharacter.constitution || 10,
      intelligence: partialCharacter.intelligence || 10,
      wisdom: partialCharacter.wisdom || 10,
      charisma: partialCharacter.charisma || 10,
      maxHp: partialCharacter.maxHp || 0,
      currentHp: partialCharacter.currentHp || 0,
      temporaryHp: partialCharacter.temporaryHp || 0,
      armorClass: partialCharacter.armorClass || 10,
      initiative: partialCharacter.initiative || 0,
      speed: partialCharacter.speed || 30,
      proficiencyBonus: partialCharacter.proficiencyBonus || 2,
      inspiration: partialCharacter.inspiration || false,
      equipment: partialCharacter.equipment || [],
      spells: partialCharacter.spells || [],
      features: partialCharacter.features || [],
      proficiencies: partialCharacter.proficiencies || {
        skills: [],
        tools: [],
        weapons: [],
        armor: [],
        languages: []
      },
      personality: partialCharacter.personality || '',
      ideals: partialCharacter.ideals || '',
      bonds: partialCharacter.bonds || '',
      flaws: partialCharacter.flaws || '',
      backstory: partialCharacter.backstory || '',
      notes: partialCharacter.notes || '',
      createdAt: partialCharacter.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: partialCharacter.userId || '',
      portrait: partialCharacter.portrait || '',
      stats: partialCharacter.stats || {},
      hitDice: partialCharacter.hitDice || { total: 1, current: 1, value: 'd8' }
    };
  }, []);

  return {
    character,
    updateCharacter,
    isMagicClass,
    convertToCharacter
  };
};
