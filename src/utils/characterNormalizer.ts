
import { Character } from '@/types/character';

/**
 * Нормализует данные персонажа, исправляя распространенные проблемы
 * @param character Исходный объект персонажа
 * @returns Нормализованные данные персонажа
 */
export function normalizeCharacterData(character: Character): Character {
  if (!character) return character;
  
  // Создаем копию объекта для модификации
  const normalized: Character = { ...character };
  
  // Убедимся, что обязательные поля существуют
  normalized.name = normalized.name || 'Безымянный персонаж';
  normalized.level = normalized.level ?? 1;
  normalized.experience = normalized.experience ?? 0;
  
  // Разрешаем несоответствия между полями класса
  if (normalized.class && !normalized.className) {
    normalized.className = normalized.class;
  } else if (!normalized.class && normalized.className) {
    normalized.class = normalized.className;
  }
  
  // Нормализация данных о характеристиках
  const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  
  // Проверяем существование объекта stats
  if (!normalized.stats) {
    normalized.stats = {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    };
  }
  
  // Проходим по всем характеристикам
  abilities.forEach(ability => {
    // Если значение установлено напрямую в объекте персонажа, но отсутствует в stats
    if (normalized[ability] !== undefined && normalized.stats[ability] === undefined) {
      normalized.stats[ability] = normalized[ability];
    } 
    // Если значение в stats установлено, но отсутствует в корне объекта
    else if (normalized.stats[ability] !== undefined && normalized[ability] === undefined) {
      normalized[ability] = normalized.stats[ability];
    }
    
    // Если значения различаются, приоритет у поля stats
    if (normalized[ability] !== normalized.stats[ability] && normalized.stats[ability] !== undefined) {
      normalized[ability] = normalized.stats[ability];
    }
  });
  
  // Убедимся, что массивы инициализированы
  if (!Array.isArray(normalized.equipment)) normalized.equipment = [];
  if (!Array.isArray(normalized.features)) normalized.features = [];
  if (!Array.isArray(normalized.spells)) normalized.spells = [];
  
  // Убедимся, что proficiencies существует и инициализирован правильно
  if (!normalized.proficiencies) {
    normalized.proficiencies = { languages: [], tools: [], weapons: [], armor: [], skills: [] };
  }
  
  // Проверяем наличие userId
  if (!normalized.userId) {
    console.warn(`Персонаж '${normalized.name}' не имеет userId`);
  }
  
  return normalized;
}

/**
 * Нормализует массив персонажей
 * @param characters Массив персонажей
 * @returns Нормализованный массив персонажей
 */
export function normalizeCharacters(characters: Character[]): Character[] {
  if (!Array.isArray(characters)) {
    console.error('normalizeCharacters: не массив', characters);
    return [];
  }
  
  return characters
    .filter(char => char !== null && char !== undefined)
    .map(normalizeCharacterData);
}
