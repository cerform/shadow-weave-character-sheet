import { Character } from '@/types/character';
import { Skill, SKILL_LIST, SKILL_MAP } from '@/types/constants';

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
      // Duplicate for backwards compatibility
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
    conditions: [],
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    inventory: [],
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
      saveDC: 0,
      attackBonus: 0
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
    conditions: partial.conditions || [],
    proficiencies: {
      languages: partial.proficiencies?.languages || [],
      tools: partial.proficiencies?.tools || [],
      weapons: partial.proficiencies?.weapons || [],
      armor: partial.proficiencies?.armor || [],
      skills: partial.proficiencies?.skills || []
    },
    inventory: partial.inventory || [],
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
      saveDC: partial.spellcasting?.saveDC || 0,
      attackBonus: partial.spellcasting?.attackBonus || 0
    }
  };
  
  return character;
};

export const getModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

export const getModifierString = (value: number): string => {
  const modifier = getModifier(value);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};
