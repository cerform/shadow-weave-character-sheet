
import { Character } from '@/types/character';

export const createDefaultCharacter = (): Character => {
  return {
    name: '',
    race: '',
    class: '',
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0,
    },
    maxHp: 8,
    currentHp: 8,
    armorClass: 10,
    speed: 30,
    proficiencyBonus: 2,
    equipment: [],
    spells: [],
    money: {
      gp: 0,
      sp: 0,
      cp: 0,
    },
    userId: '', // Добавляем поле userId
  };
};

// Вычисление модификатора характеристики
export const calculateModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Получение модификатора как строки
export const getModifierFromAbilityScore = (abilityScore: number): string => {
  const modifier = calculateModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Получение числового модификатора
export const getNumericModifier = (abilityScore: number): number => {
  return calculateModifier(abilityScore);
};

// Вычисление бонуса мастерства по уровню
export const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

// Вычисление макс HP на основе класса, уровня и модификатора телосложения
export const calculateMaxHP = (characterClass: string, level: number, constitutionModifier: number): number => {
  // Hit dice по классам (согласно D&D 5e)
  const hitDiceByClass: Record<string, number> = {
    'Варвар': 12,
    'Воин': 10,
    'Паладин': 10,
    'Следопыт': 10,
    'Бард': 8,
    'Жрец': 8,
    'Друид': 8,
    'Монах': 8,
    'Плут': 8,
    'Колдун': 8,
    'Волшебник': 6,
    'Чародей': 6,
  };

  const hitDie = hitDiceByClass[characterClass] || 8;

  // На 1 уровне = макс хит дайс + модификатор телосложения
  // На каждом следующем уровне в среднем половина хит дайса + 1 + модификатор телосложения
  const baseHP = hitDie + constitutionModifier;
  const perLevelGain = Math.max(1, Math.floor(hitDie / 2) + 1 + constitutionModifier);
  const additionalHP = (level - 1) * perLevelGain;

  return Math.max(1, baseHP + additionalHP);
};
