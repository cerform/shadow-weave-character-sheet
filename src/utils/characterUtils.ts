
import { v4 as uuidv4 } from 'uuid';
import type { Character, AbilityScores } from '@/types/character';

/**
 * Вычисляет модификатор характеристики на основе значения
 * @param score значение характеристики
 * @returns модификатор характеристики
 */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Вычисляет числовой модификатор для характеристики (с учетом плюса/минуса)
 * @param score значение характеристики
 * @returns строка с модификатором (например, "+2" или "-1")
 */
export function getNumericModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Генерирует строковое представление модификатора характеристики с плюсом или минусом
 * @param score значение характеристики
 * @returns строка с модификатором (например, "+2" или "-1")
 */
export function getModifierString(score: number): string {
  const modifier = getNumericModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Вычисляет бонусы для характеристик персонажа на основе его расы, класса и других факторов
 */
export function calculateStatBonuses(character: Partial<Character>): Record<string, number> {
  const bonuses: Record<string, number> = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0, 
    wisdom: 0,
    charisma: 0
  };
  
  // Базовые бонусы от расы
  if (character.race) {
    switch(character.race.toLowerCase()) {
      case 'дварф':
      case 'dwarf':
        bonuses.constitution += 2;
        break;
      case 'эльф':
      case 'elf':
        bonuses.dexterity += 2;
        break;
      case 'полурослик':
      case 'halfling':
        bonuses.dexterity += 2;
        break;
      case 'человек':
      case 'human':
        bonuses.strength += 1;
        bonuses.dexterity += 1;
        bonuses.constitution += 1;
        bonuses.intelligence += 1;
        bonuses.wisdom += 1;
        bonuses.charisma += 1;
        break;
      case 'драконорожденный':
      case 'dragonborn':
        bonuses.strength += 2;
        bonuses.charisma += 1;
        break;
      case 'гном':
      case 'gnome':
        bonuses.intelligence += 2;
        break;
      case 'полуэльф':
      case 'half-elf':
        bonuses.charisma += 2;
        // Полуэльфы могут выбрать еще 2 характеристики для +1, но тут упрощаем
        bonuses.dexterity += 1;
        bonuses.constitution += 1;
        break;
      case 'полуорк':
      case 'half-orc':
        bonuses.strength += 2;
        bonuses.constitution += 1;
        break;
      case 'тифлинг':
      case 'tiefling':
        bonuses.charisma += 2;
        bonuses.intelligence += 1;
        break;
    }
  }
  
  return bonuses;
}

/**
 * Создает персонажа с значениями по умолчанию
 * @returns объект персонажа со значениями по умолчанию
 */
export function createDefaultCharacter(): Character {
  const defaultCharacter: Character = {
    id: uuidv4(),
    name: '',
    race: '',
    class: '',
    subclass: '',
    background: '',
    alignment: 'Нейтральный',
    level: 1,
    xp: 0,
    experience: 0,
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
      charisma: 10,
    },
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
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
      charisma: 0,
    },
    skills: {},
    hp: 10,
    maxHp: 10,
    currentHp: 10,
    temporaryHp: 0,
    tempHp: 0,
    ac: 10,
    armorClass: 10,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
      current: 1,
      value: '1d8',
      remaining: 1
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    spellcasting: {
      ability: 'intelligence',
      dc: 10,
      attack: 0,
      saveDC: 10,
      attackBonus: 0,
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0,
    },
    proficiencies: {
      languages: ['Common'],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    features: [],
    notes: '',
    savingThrowProficiencies: [],
    skillProficiencies: [],
    expertise: [],
    skillBonuses: {},
    userId: ''
  };

  return defaultCharacter;
}

// Другие функции для работы с персонажами
