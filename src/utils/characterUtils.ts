
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types/character';

// Добавляем вспомогательную функцию для расчета модификатора
export const getModifierFromAbilityScore = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Добавляем функцию для получения числового модификатора
export const getNumericModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const createDefaultCharacter = (): Character => {
  return {
    id: uuidv4(),
    name: 'Новый персонаж',
    race: 'Человек',
    class: 'Воин',
    level: 1,
    experience: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    maxHp: 10,
    currentHp: 10,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    proficiencyBonus: 2,
    skills: {},
    savingThrows: {},
    equipment: [],
    features: [],
    spells: [],
    hitDice: { total: 1, used: 0, dieType: 'd8', value: '1d8' },
    resources: {},
    proficiencies: [],
    languages: ['Общий'],
    gold: 0,
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
    // Добавляем новые поля для устранения ошибок типизации
    notes: '',
    sorceryPoints: {
      max: 0,
      current: 0
    },
    appearance: ''
  };
};

export function calculateModifier(ability: number): string {
  const mod = Math.floor((ability - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const isMagicClass = (className: string): boolean => {
  const magicClasses = [
    'wizard', 'волшебник',
    'sorcerer', 'чародей',
    'warlock', 'колдун',
    'bard', 'бард',
    'cleric', 'жрец',
    'druid', 'друид',
    'ranger', 'следопыт',
    'paladin', 'паладин'
  ];
  
  return magicClasses.includes(className.toLowerCase());
};

// Вспомогательная функция для работы с заклинаниями
export const isCharacterSpellObject = (spell: any): spell is any => {
  return typeof spell === 'object' && spell !== null;
};

// Вспомогательная функция для получения уровня заклинания
export const getSpellLevel = (spell: any): number => {
  if (typeof spell === 'string') {
    return 0; // По умолчанию заговоры
  }
  return spell.level || 0;
};

// Вспомогательная функция для проверки, подготовлено ли заклинание
export const isSpellPrepared = (spell: any): boolean => {
  if (typeof spell === 'string') {
    return false;
  }
  return !!spell.prepared;
};
