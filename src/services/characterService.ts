
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebase';
import { createDefaultCharacter } from '@/utils/characterUtils';

// Mock storage for characters - will be used instead of Supabase
const charactersStore: Record<string, Character[]> = {};

// Генерируем уникальный ID для персонажа
const generateId = (): string => {
  return uuidv4();
};

/**
 * Получение списка персонажей пользователя
 */
export const getUserCharacters = async (userId?: string): Promise<Character[]> => {
  try {
    // Если ID пользователя не предоставлен, используем текущего авторизованного пользователя
    const currentUserId = userId || auth.currentUser?.uid;
    
    if (!currentUserId) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Возвращаем персонажей из локального хранилища (вместо Supabase)
    return charactersStore[currentUserId] || [];
  } catch (error) {
    console.error('Не удалось получить персонажей:', error);
    return [];
  }
};

/**
 * Alias для getUserCharacters - экспортируем для исправления импортов
 */
export const getAllCharacters = getUserCharacters;

/**
 * Получение персонажей по ID пользователя
 */
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  return getUserCharacters(userId);
};

/**
 * Получение персонажа по ID
 */
export const getCharacter = async (characterId: string): Promise<Character | null> => {
  try {
    // Ищем персонажа во всех хранилищах пользователей
    for (const userId in charactersStore) {
      const character = charactersStore[userId]?.find(char => char.id === characterId);
      if (character) {
        return character;
      }
    }
    return null;
  } catch (error) {
    console.error(`Не удалось получить персонажа с ID ${characterId}:`, error);
    return null;
  }
};

/**
 * Сохранение персонажа (заменяем функцию saveCharacterToFirestore)
 */
export const saveCharacterToFirestore = async (character: Character): Promise<Character> => {
  try {
    // Проверяем наличие обязательных полей
    if (!character.id) {
      character.id = generateId();
    }
    
    if (!character.name) {
      character.name = 'Новый персонаж';
    }
    
    // Добавляем метаданные
    const now = new Date().toISOString();
    character.updatedAt = now;
    
    if (!character.createdAt) {
      character.createdAt = now;
    }
    
    // Получаем текущего пользователя
    const currentUser = auth.currentUser;
    
    if (!character.userId && currentUser) {
      character.userId = currentUser.uid;
    }
    
    // Проверяем, существует ли этот пользователь в нашем хранилище
    const userId = character.userId || 'anonymous';
    if (!charactersStore[userId]) {
      charactersStore[userId] = [];
    }
    
    // Ищем существующего персонажа
    const existingCharIndex = charactersStore[userId].findIndex(char => char.id === character.id);
    
    if (existingCharIndex >= 0) {
      // Обновляем существующего персонажа
      charactersStore[userId][existingCharIndex] = character;
    } else {
      // Создаем нового персонажа
      charactersStore[userId].push(character);
    }
    
    // Также сохраняем в localStorage
    try {
      localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
    } catch (e) {
      console.warn('Не удалось сохранить в localStorage:', e);
    }
    
    return character;
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

/**
 * Удаление персонажа
 */
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Пользователь не авторизован');
    
    const userId = currentUser.uid;
    
    if (charactersStore[userId]) {
      charactersStore[userId] = charactersStore[userId].filter(char => char.id !== characterId);
    }
    
    // Удаляем из localStorage
    try {
      localStorage.removeItem(`character_${characterId}`);
    } catch (e) {
      console.warn('Не удалось удалить из localStorage:', e);
    }
  } catch (error) {
    console.error(`Не удалось удалить персонажа с ID ${characterId}:`, error);
    throw error;
  }
};

/**
 * Преобразование персонажа из Firestore в полный объект персонажа
 */
export const convertFirestoreCharacterToCharacter = (firestoreCharacter: any): Character => {
  // Получаем базовый персонаж с дефолтными значениями
  const baseCharacter = createDefaultCharacter();
  
  // Объединяем с данными из Firestore
  const character = {
    ...baseCharacter,
    ...firestoreCharacter
  };
  
  return character as Character;
};
