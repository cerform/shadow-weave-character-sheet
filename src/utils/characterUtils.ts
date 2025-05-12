
import { Character } from '@/types/character';

/**
 * Creates a default character object
 */
export function createDefaultCharacter(): Character {
  return {
    id: crypto.randomUUID(),
    name: 'Новый персонаж',
    class: '',
    level: 1,
    race: '',
    background: '',
    alignment: 'Нейтральный',
    abilities: {
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
    },
    stats: {
      strength: 10,
      dexterity: 10, 
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    strength: 10,
    dexterity: 10, 
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    equipment: [],
    gold: 0,
    hp: {
      current: 8,
      max: 8,
      temp: 0
    },
    spellcasting: null,
    spells: [],
    features: [],
    proficiencyBonus: 2,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitDice: { total: 1, value: 8 },
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: {},
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    updatedAt: new Date().toISOString()
  };
}

/**
 * Updates character's proficiency bonus based on level
 */
export function updateCharacterProficiencyBonus(character: Character, level: number): Character {
  // Calculate proficiency bonus: 2 + floor((level - 1) / 4)
  const proficiencyBonus = 2 + Math.floor((level - 1) / 4);
  
  return {
    ...character,
    proficiencyBonus
  };
}

/**
 * Calculate initiative from dexterity
 */
export function calculateInitiative(character: Character): number {
  const dex = character.dexterity || character.abilities?.DEX || 10;
  return Math.floor((dex - 10) / 2);
}
