
import { Character } from '@/types/character';

// Функция для создания объекта персонажа по умолчанию
export const createDefaultCharacter = (): Character => {
  return {
    id: `char_${Date.now()}`,
    userId: '',
    name: 'Новый персонаж',
    race: '',
    class: '',
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    currentHp: 10, // Corrected from string to number
    maxHp: 10, // Corrected from string to number
    temporaryHp: 0,
    armorClass: 10,
    initiative: '+0',
    speed: '30 фт',
    proficiencyBonus: 2,
    background: '',
    alignment: '',
    experience: 0,
    inspiration: false,
    hitDice: { // Corrected from string to object
      total: 1,
      used: 0,
      dieType: 'd8',
      value: 'd8'
    },
    equipment: [],
    spells: [],
    skills: {}, // Corrected from array to object
    savingThrows: {}, // Corrected from array to object
    languages: [],
    proficiencies: [],
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    features: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Другие полезные функции для работы с персонажами
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Alias for getModifierFromAbilityScore
export const getModifierFromAbilityScore = (abilityScore: number): number => {
  return calculateAbilityModifier(abilityScore);
};

// Alias for getNumericModifier
export const getNumericModifier = (abilityScore: number): number => {
  return calculateAbilityModifier(abilityScore);
};

export const calculateProficiencyBonus = (level: number): number => {
  return Math.floor((level - 1) / 4) + 2;
};

// Функция для проверки, является ли класс магическим
export const isMagicClass = (className: string): boolean => {
  const magicClasses = [
    'бард', 'волшебник', 'колдун', 'жрец', 'друид', 'паладин', 
    'следопыт', 'чародей', 'изобретатель'
  ];
  
  return magicClasses.some(cls => 
    className.toLowerCase().includes(cls.toLowerCase())
  );
};

// Функция для обновления характеристик персонажа
export const updateCharacterStats = (character: Character): Character => {
  const updatedCharacter = { ...character };
  
  // Обновляем бонус мастерства
  updatedCharacter.proficiencyBonus = calculateProficiencyBonus(character.level || 1);
  
  // Обновляем модификаторы спасбросков и навыков если они существуют
  if (updatedCharacter.savingThrows && typeof updatedCharacter.savingThrows === 'object') {
    Object.keys(updatedCharacter.savingThrows).forEach(ability => {
      let abilityScore = 10;
      
      // Находим значение характеристики
      switch (ability.toLowerCase()) {
        case 'сила': abilityScore = character.strength || 10; break;
        case 'ловкость': abilityScore = character.dexterity || 10; break;
        case 'телосложение': abilityScore = character.constitution || 10; break;
        case 'интеллект': abilityScore = character.intelligence || 10; break;
        case 'мудрость': abilityScore = character.wisdom || 10; break;
        case 'харизма': abilityScore = character.charisma || 10; break;
      }
      
      const baseModifier = calculateAbilityModifier(abilityScore);
      const isProficient = updatedCharacter.savingThrows[ability] === true;
      const proficiencyBonus = isProficient ? (character.proficiencyBonus || 2) : 0;
      
      // Обновляем модификатор
      if (typeof updatedCharacter.savingThrows[ability] === 'object') {
        updatedCharacter.savingThrows[ability] = {
          ...updatedCharacter.savingThrows[ability],
          modifier: baseModifier + proficiencyBonus
        };
      }
    });
  }
  
  return updatedCharacter;
};
