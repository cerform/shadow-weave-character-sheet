
import { Character } from '@/types/character';

/**
 * Функция для преобразования данных персонажа в стандартный формат
 * и устранения ошибок совместимости
 */
export const convertToCharacter = (data: any): Character => {
  // Если данных нет, возвращаем пустой объект
  if (!data) {
    console.error('convertToCharacter: Получен пустой объект');
    return {
      id: '',
      name: 'Ошибка загрузки',
      race: '',
      class: '',
      level: 1,
      experience: 0,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      maxHp: 10,
      currentHp: 10
    };
  }
  
  // Копируем данные для безопасного изменения
  const character = { ...data };
  
  // Гарантируем, что ID существует
  character.id = character.id || '';
  
  // Проверяем и исправляем основные характеристики
  character.name = character.name || 'Безымянный герой';
  character.race = character.race || '';
  character.class = character.class || character.className || '';
  character.level = character.level || 1;
  character.experience = character.experience || 0;
  
  // Исправляем базовые характеристики
  character.strength = character.strength || character.stats?.strength || 10;
  character.dexterity = character.dexterity || character.stats?.dexterity || 10;
  character.constitution = character.constitution || character.stats?.constitution || 10;
  character.intelligence = character.intelligence || character.stats?.intelligence || 10;
  character.wisdom = character.wisdom || character.stats?.wisdom || 10;
  character.charisma = character.charisma || character.stats?.charisma || 10;
  
  // Исправляем HP
  character.maxHp = character.maxHp || 10;
  character.currentHp = character.currentHp !== undefined ? character.currentHp : character.maxHp;
  
  // Восстанавливаем дополнительные поля, если они отсутствуют
  character.backstory = character.backstory || '';
  character.userId = character.userId || '';
  character.createdAt = character.createdAt || new Date().toISOString();
  character.updatedAt = character.updatedAt || new Date().toISOString();
  
  return character as Character;
};

/**
 * Создаёт новый пустой персонаж
 */
export const createEmptyCharacter = (): Character => {
  return {
    id: '',
    name: 'Новый персонаж',
    race: '',
    class: '',
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
    backstory: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};
