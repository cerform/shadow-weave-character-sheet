
import { Character } from '@/types/character';

/**
 * Нормализует объект персонажа, обеспечивая правильное форматирование данных и заполнение обязательных полей
 * @param character Исходный объект персонажа
 * @returns Нормализованный объект персонажа
 */
export function normalizeCharacter(character: Partial<Character>): Character {
  // Создаем базовую структуру персонажа
  const normalizedCharacter: Character = {
    id: character.id || generateRandomId(),
    name: character.name || 'Безымянный герой',
    race: character.race || '',
    class: character.class || '',
    className: character.className || character.class || '',
    level: character.level || 1,
    background: character.background || '',
    alignment: character.alignment || '',
    experience: character.experience || 0,
    
    // Характеристики
    abilities: character.abilities || {
      strength: character.strength || 10,
      dexterity: character.dexterity || 10,
      constitution: character.constitution || 10,
      intelligence: character.intelligence || 10,
      wisdom: character.wisdom || 10,
      charisma: character.charisma || 10,
      STR: character.strength || 10,
      DEX: character.dexterity || 10,
      CON: character.constitution || 10,
      INT: character.intelligence || 10,
      WIS: character.wisdom || 10,
      CHA: character.charisma || 10,
    },
    
    // Здоровье
    maxHp: character.maxHp || character.hitPoints?.maximum || 10,
    hp: character.hp || character.currentHp || character.hitPoints?.current || 10,
    currentHp: character.currentHp || character.hp || character.hitPoints?.current || 10,
    temporaryHp: character.temporaryHp || character.hitPoints?.temporary || 0,
    
    hitDice: character.hitDice || {
      total: character.level || 1,
      used: 0,
      type: 'd8'
    },
    
    armorClass: character.armorClass || 10,
    
    // Инициатива и скорость
    initiative: character.initiative || 0,
    speed: character.speed || 30,
    
    // Профессии и навыки
    proficiencyBonus: character.proficiencyBonus || 2,
    proficiencies: character.proficiencies || {
      weapons: [],
      tools: [],
      languages: [],
      skills: []
    },
    
    // Снаряжение
    inventory: character.inventory || [],
    equipment: character.equipment || {
      weapons: [],
      tools: [],
      languages: [],
      items: []
    },
    
    // Особенности
    features: character.features || {
      race: [],
      class: [],
      background: []
    },
    
    // Заклинания
    spells: character.spells || [],
    
    // Прочее
    notes: character.notes || '',
  };
  
  // Обеспечиваем совместимость с разными форматами данных
  if (!normalizedCharacter.hitPoints) {
    normalizedCharacter.hitPoints = {
      maximum: normalizedCharacter.maxHp,
      current: normalizedCharacter.currentHp,
      temporary: normalizedCharacter.temporaryHp
    };
  }
  
  // Копируем stats, если они есть
  if (character.stats) {
    normalizedCharacter.stats = { ...character.stats };
  } else {
    // Если stats нет, создаем их из abilities
    normalizedCharacter.stats = {
      strength: normalizedCharacter.abilities.strength,
      dexterity: normalizedCharacter.abilities.dexterity,
      constitution: normalizedCharacter.abilities.constitution,
      intelligence: normalizedCharacter.abilities.intelligence,
      wisdom: normalizedCharacter.abilities.wisdom,
      charisma: normalizedCharacter.abilities.charisma
    };
  }
  
  // Обеспечиваем прямой доступ к характеристикам
  normalizedCharacter.strength = normalizedCharacter.stats.strength;
  normalizedCharacter.dexterity = normalizedCharacter.stats.dexterity;
  normalizedCharacter.constitution = normalizedCharacter.stats.constitution;
  normalizedCharacter.intelligence = normalizedCharacter.stats.intelligence;
  normalizedCharacter.wisdom = normalizedCharacter.stats.wisdom;
  normalizedCharacter.charisma = normalizedCharacter.stats.charisma;
  
  return normalizedCharacter;
}

/**
 * Генерирует случайный идентификатор для персонажа
 */
function generateRandomId(): string {
  return `char_${Math.random().toString(36).substring(2, 9)}`;
}

