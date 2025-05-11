
import { Character } from '@/types/character';
import { Skill, SKILL_LIST, SKILL_MAP } from '@/types/constants';

// Add missing utility functions for modifiers
export const getModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

export const getModifierString = (value: number): string => {
  const modifier = getModifier(value);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Add alias functions that various components are expecting
export const getNumericModifier = getModifier;
export const getAbilityModifier = getModifier;
export const getModifierFromAbilityScore = getModifier;
export const calculateAbilityModifier = getModifier;

// Create missing calculation functions
export const calculateInitiative = (character: Partial<Character>): number => {
  const dexMod = getModifier(character?.abilities?.DEX || character?.dexterity || 10);
  return dexMod;
};

export const calculateArmorClass = (character: Partial<Character>): number => {
  const dexMod = getModifier(character?.abilities?.DEX || character?.dexterity || 10);
  return 10 + dexMod; // Basic AC calculation
};

export const calculateMaxHP = (character: Partial<Character>): number => {
  if (!character || !character.level || !character.class) return 10;
  
  const conModifier = getModifier(character?.abilities?.CON || character?.constitution || 10);
  const classLower = character.class.toLowerCase();
  
  // Determine hit die based on class
  let hitDie = 8; // default
  if (classLower.includes('варвар') || classLower.includes('barbarian')) {
    hitDie = 12;
  } else if (classLower.includes('воин') || classLower.includes('fighter') || 
             classLower.includes('паладин') || classLower.includes('paladin') ||
             classLower.includes('рейнджер') || classLower.includes('ranger')) {
    hitDie = 10;
  } else if (classLower.includes('чародей') || classLower.includes('sorcerer') || 
             classLower.includes('волшебник') || classLower.includes('wizard')) {
    hitDie = 6;
  }
  
  // First level gets maximum hit points
  let maxHp = hitDie + conModifier;
  
  // Add average hit die + con mod for each level after 1st
  for (let i = 1; i < character.level; i++) {
    maxHp += Math.floor(hitDie / 2) + 1 + conModifier;
  }
  
  return Math.max(1, maxHp); // Minimum 1 HP
};

export const createDefaultCharacter = (): Character => {
  // Create a unique ID for the character
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  return {
    id,
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: '',
    level: 1,
    xp: 0,
    abilities: {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    },
    hitPoints: {
      current: 10,
      max: 10,
      temporary: 0
    },
    armorClass: 10,
    speed: 30,
    initiative: 0,
    proficiencyBonus: 2,
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    ac: 10,
    savingThrows: {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
    },
    skills: {},
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8'
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0
    },
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    spells: [],
    features: [],
    notes: '',
    backstory: '',
    personality: '',
    ideals: '',
    bonds: '',
    flaws: '',
    inspiration: false,
    spellcasting: {
      ability: '',
      dc: 0,
      attack: 0
    },
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    }
  };
};

export const calculateStatBonuses = (character: Partial<Character>): { [key: string]: number } | null => {
  if (!character.race) return null;

  switch (character.race) {
    case 'Человек':
      return { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 };
    case 'Эльф':
      return { DEX: 2 };
    case 'Дварф':
      return { CON: 2 };
    case 'Полуорк':
      return { STR: 2, CON: 1 };
    case 'Тифлинг':
      return { CHA: 2, INT: 1 };
    case 'Полуэльф':
        return { CHA: 2, DEX: 1, CON: 1 };
    case 'Драконорожденный':
        return { STR: 2, CHA: 1 };
    case 'Гном':
        return { INT: 2 };
    case 'Хафлинг':
        return { DEX: 2 };
    default:
      return null;
  }
};

export const convertToCharacter = (partial: Partial<Character>): Character => {
  const character: Character = {
    id: partial.id || 'default-id',
    name: partial.name || 'Безымянный',
    race: partial.race || 'Неизвестно',
    class: partial.class || 'Без класса',
    background: partial.background || '',
    alignment: partial.alignment || '',
    level: partial.level || 1,
    xp: partial.xp || 0,
    abilities: {
      STR: partial.abilities?.STR || 10,
      DEX: partial.abilities?.DEX || 10,
      CON: partial.abilities?.CON || 10,
      INT: partial.abilities?.INT || 10,
      WIS: partial.abilities?.WIS || 10,
      CHA: partial.abilities?.CHA || 10,
      strength: partial.abilities?.strength || 10,
      dexterity: partial.abilities?.dexterity || 10,
      constitution: partial.abilities?.constitution || 10,
      intelligence: partial.abilities?.intelligence || 10,
      wisdom: partial.abilities?.wisdom || 10,
      charisma: partial.abilities?.charisma || 10,
    },
    hitPoints: {
      current: partial.hitPoints?.current || 1,
      max: partial.hitPoints?.max || 1,
      temporary: partial.hitPoints?.temporary || 0
    },
    armorClass: partial.armorClass || 10,
    speed: partial.speed || 30,
    initiative: partial.initiative || 0,
    proficiencyBonus: partial.proficiencyBonus || 2,
    proficiencies: {
      languages: partial.proficiencies?.languages || [],
      tools: partial.proficiencies?.tools || [],
      weapons: partial.proficiencies?.weapons || [],
      armor: partial.proficiencies?.armor || [],
      skills: partial.proficiencies?.skills || []
    },
    spells: partial.spells || [],
    features: partial.features || [],
    notes: partial.notes || '',
    backstory: partial.backstory || '',
    personality: partial.personality || '',
    ideals: partial.ideals || '',
    bonds: partial.bonds || '',
    flaws: partial.flaws || '',
    inspiration: partial.inspiration || false,
    spellcasting: {
      ability: partial.spellcasting?.ability || '',
      dc: partial.spellcasting?.dc || 0,
      attack: partial.spellcasting?.attack || 0
    },
    
    // Добавляем обязательные поля из Character типа
    hp: partial.hp || partial.hitPoints?.current || 10,
    maxHp: partial.maxHp || partial.hitPoints?.max || 10,
    temporaryHp: partial.temporaryHp || partial.hitPoints?.temporary || 0,
    ac: partial.ac || partial.armorClass || 10,
    savingThrows: {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0,
      ...partial.savingThrows
    },
    skills: partial.skills || {},
    hitDice: {
      total: partial.level || 1,
      used: 0,
      dieType: 'd8',
      ...partial.hitDice
    },
    resources: partial.resources || {},
    deathSaves: partial.deathSaves || { successes: 0, failures: 0 },
    equipment: partial.equipment || {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    }
  };
  
  return character;
};
