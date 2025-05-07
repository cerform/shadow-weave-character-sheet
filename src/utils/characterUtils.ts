
// Базовые значения характеристик
export const initialAbilityScores = {
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

// Расчет модификатора на основе значения характеристики
export const calculateModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Расчет бонуса навыка
export const calculateSkillCheckBonus = (
  abilityModifier: number,
  proficiencyBonus: number,
  isProficient: boolean
): number => {
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
};

// Расчет класса брони
export const calculateArmorClass = (
  baseAC: number,
  dexModifier: number,
  armor?: any,
  shield?: boolean
): number => {
  // По умолчанию КБ = 10 + мод ловкости (без доспехов)
  let ac = baseAC + dexModifier;

  // Если есть доспех, применяем его бонусы
  if (armor) {
    // Логика расчета в зависимости от типа доспеха
    switch (armor.type) {
      case 'light':
        ac = armor.baseAC + dexModifier;
        break;
      case 'medium':
        ac = armor.baseAC + Math.min(dexModifier, 2);
        break;
      case 'heavy':
        ac = armor.baseAC; // Модификатор ловкости не применяется
        break;
      default:
        ac = 10 + dexModifier;
    }
  }

  // Добавляем бонус щита
  if (shield) {
    ac += 2;
  }

  return ac;
};

// Расчет максимальных очков здоровья
export const calculateMaxHP = (
  hitDice: string,
  constitutionModifier: number,
  level: number
): number => {
  // На первом уровне HP = максимум хитдайса + модификатор телосложения
  let maxHP = parseInt(hitDice.substring(1)) + constitutionModifier;
  
  // Для последующих уровней: среднее значение хитдайса + модификатор телосложения
  if (level > 1) {
    const diceValue = parseInt(hitDice.substring(1));
    const avgRoll = Math.ceil((diceValue + 1) / 2); // Среднее значение кубика
    maxHP += (avgRoll + constitutionModifier) * (level - 1);
  }
  
  return Math.max(1, maxHP); // Минимум 1 HP
};

// Расчет бонуса мастерства
export const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil(1 + (level / 4));
};

// Проверка, соответствует ли значение одному из типов
export function isType<T>(value: any, ...types: any[]): value is T {
  return types.some(type => typeof value === type);
}

// Экспортируем функцию getAbilityModifier, которая используется в нескольких компонентах
export const getAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Добавляем getNumericModifier как синоним для getAbilityModifier для совместимости
export const getNumericModifier = getAbilityModifier;

// Функция для создания персонажа по умолчанию
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

export const createDefaultCharacter = (): Character => {
  return {
    id: uuidv4(),
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: '',
    level: 1,
    experience: 0,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0
    },
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
      value: '1d8',
      remaining: 1
    },
    deathSaves: {
      successes: 0,
      failures: 0
    },
    proficiencyBonus: 2,
    abilities: initialAbilityScores,
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false, 
      charisma: false
    },
    skills: {},
    equipment: [],
    proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: []
    },
    features: [],
    spells: [],
    spellSlots: {},
    resources: {},
    notes: '',
    creationDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};
