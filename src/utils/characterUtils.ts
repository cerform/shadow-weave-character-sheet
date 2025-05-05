
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
    currentHp: 10,
    maxHp: 10,
    temporaryHp: 0,
    armorClass: 10,
    initiative: '+0',
    speed: '30 фт',
    proficiencyBonus: 2,
    background: '',
    alignment: '',
    experience: 0,
    inspiration: false,
    hitDice: 'd8',
    equipment: [],
    spells: [],
    skills: [],
    savingThrows: [],
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
  if (updatedCharacter.savingThrows) {
    updatedCharacter.savingThrows = updatedCharacter.savingThrows.map(save => {
      const ability = save.ability.toLowerCase();
      let abilityScore = 10;
      
      // Находим значение характеристики
      switch (ability) {
        case 'сила': abilityScore = character.strength || 10; break;
        case 'ловкость': abilityScore = character.dexterity || 10; break;
        case 'телосложение': abilityScore = character.constitution || 10; break;
        case 'интеллект': abilityScore = character.intelligence || 10; break;
        case 'мудрость': abilityScore = character.wisdom || 10; break;
        case 'харизма': abilityScore = character.charisma || 10; break;
      }
      
      const baseModifier = calculateAbilityModifier(abilityScore);
      const proficiencyBonus = save.proficient ? (character.proficiencyBonus || 2) : 0;
      
      return {
        ...save,
        modifier: baseModifier + proficiencyBonus
      };
    });
  }
  
  return updatedCharacter;
};
