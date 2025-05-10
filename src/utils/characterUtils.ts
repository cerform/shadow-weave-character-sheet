
import { Character, AbilityScores } from '@/types/character';

// Создание персонажа по умолчанию
export const createDefaultCharacter = (): Character => {
  const id = `char_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
  return {
    id,
    name: 'Новый персонаж',
    race: 'Человек',
    class: 'Воин',
    background: 'Солдат',
    alignment: 'Нейтральный',
    level: 1,
    xp: 0,
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
    savingThrows: {
      STR: 0,
      DEX: 0,
      CON: 0,
      INT: 0,
      WIS: 0,
      CHA: 0,
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    },
    skills: {},
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    ac: 10,
    proficiencyBonus: 2,
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
      attack: 2,
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
      languages: ['Общий'],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    features: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Расчет модификатора характеристики
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Получение числового модификатора из значения характеристики
export const getNumericModifier = (value: number): number => {
  return Math.floor((value - 10) / 2);
};

// Получение строкового представления модификатора
export const getModifierString = (value: number): string => {
  const mod = getNumericModifier(value);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

// Получение модификатора из характеристик персонажа
export const getAbilityModifier = (character: Character, ability: string): number => {
  if (!character || !character.abilities) return 0;
  
  const abilityLower = ability.toLowerCase();
  let score = 10;
  
  if (abilityLower === 'strength' || abilityLower === 'str') {
    score = character.abilities.STR || character.abilities.strength || 10;
  } 
  else if (abilityLower === 'dexterity' || abilityLower === 'dex') {
    score = character.abilities.DEX || character.abilities.dexterity || 10;
  } 
  else if (abilityLower === 'constitution' || abilityLower === 'con') {
    score = character.abilities.CON || character.abilities.constitution || 10;
  } 
  else if (abilityLower === 'intelligence' || abilityLower === 'int') {
    score = character.abilities.INT || character.abilities.intelligence || 10;
  } 
  else if (abilityLower === 'wisdom' || abilityLower === 'wis') {
    score = character.abilities.WIS || character.abilities.wisdom || 10;
  } 
  else if (abilityLower === 'charisma' || abilityLower === 'cha') {
    score = character.abilities.CHA || character.abilities.charisma || 10;
  }
  
  return calculateAbilityModifier(score);
};
