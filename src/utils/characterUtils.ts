
import { Character, AbilityScores } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

// Get default ability scores
export const getDefaultAbilities = (): AbilityScores => {
  return {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };
};

// Create a default character
export const createDefaultCharacter = (): Character => {
  const defaultAbilities = getDefaultAbilities();
  
  return {
    id: uuidv4(),
    name: 'Новый персонаж',
    race: '',
    class: '',
    level: 1,
    background: '',
    alignment: '',
    abilities: defaultAbilities,
    proficiencyBonus: 2,
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    ac: 10,
    speed: 30,
    initiative: 0,
    inspiration: false,
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
    spellcasting: {
      ability: 'intelligence',
      dc: 10,
      attack: 0
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    },
    proficiencies: {
      languages: [],
      tools: []
    },
    features: [],
    savingThrows: defaultAbilities,
    skills: {},
    notes: '',
    xp: 0
  };
};

// Calculate proficiency bonus based on level
export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor(2 + (level - 1) / 4);
};

// Get default hit dice for a class
export const getHitDiceForClass = (className: string): string => {
  const classLower = className.toLowerCase();
  
  if (['варвар', 'barbarian'].includes(classLower)) {
    return 'd12';
  } else if (['воин', 'паладин', 'следопыт', 'fighter', 'paladin', 'ranger'].includes(classLower)) {
    return 'd10';
  } else if (['бард', 'клерик', 'друид', 'монах', 'плут', 'жрец', 'bard', 'cleric', 'druid', 'monk', 'rogue'].includes(classLower)) {
    return 'd8';
  } else if (['волшебник', 'чародей', 'колдун', 'wizard', 'sorcerer', 'warlock'].includes(classLower)) {
    return 'd6';
  }
  
  return 'd8'; // Default
};

// Calculate starting hit points for a character
export const calculateStartingHP = (className: string, constitutionMod: number): number => {
  const hitDie = getHitDiceForClass(className);
  const baseHP = hitDie === 'd12' ? 12 : 
                hitDie === 'd10' ? 10 : 
                hitDie === 'd8' ? 8 : 6;
                
  return baseHP + constitutionMod;
};
