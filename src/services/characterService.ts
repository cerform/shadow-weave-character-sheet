
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase/firestore';
import { doc, setDoc, getDoc, getDocs, collection, query, where, deleteDoc } from 'firebase/firestore';
import { getCurrentUid } from '@/utils/authHelpers';

// Локальное сохранение персонажа (резервное)
const saveCharacterToLocalStorage = (character: Character): Character => {
  try {
    // Generate ID if not present
    if (!character.id) {
      character = { ...character, id: uuidv4() };
    }
    
    // Get existing characters from localStorage
    const existingChars = localStorage.getItem('dnd-characters');
    let characters: Character[] = [];
    
    if (existingChars) {
      try {
        characters = JSON.parse(existingChars);
      } catch (e) {
        console.error('Error parsing stored characters, starting fresh', e);
      }
    }
    
    // Check if character already exists to update, otherwise add
    const index = characters.findIndex(char => char.id === character.id);
    
    if (index >= 0) {
      characters[index] = { ...characters[index], ...character };
    } else {
      characters.push(character);
    }
    
    // Save back to localStorage
    localStorage.setItem('dnd-characters', JSON.stringify(characters));
    
    return character;
  } catch (error) {
    console.error('Error saving character to localStorage:', error);
    throw error;
  }
};

// Сохранение персонажа в Firestore
export const saveCharacter = async (character: Character): Promise<Character> => {
  try {
    // Генерируем ID если отсутствует
    if (!character.id) {
      character = { ...character, id: uuidv4() };
    }
    
    // Добавляем метаданные
    const now = new Date().toISOString();
    if (!character.createdAt) {
      character.createdAt = now;
    }
    character.updatedAt = now;
    
    // Получаем ID пользователя
    const userId = getCurrentUid();
    if (userId && !character.userId) {
      character.userId = userId;
    }
    
    // Очищаем объект от undefined значений
    Object.keys(character).forEach(key => {
      if (character[key] === undefined) {
        delete character[key];
      }
    });
    
    try {
      // Сначала пробуем сохранить в Firestore
      const characterRef = doc(db, 'characters', character.id);
      await setDoc(characterRef, character);
      console.log('Character saved to Firestore', character.id);
    } catch (firestoreError) {
      console.error('Firestore save failed, using localStorage as fallback', firestoreError);
      // Сохраняем локально как резервный вариант
      saveCharacterToLocalStorage(character);
    }
    
    return character;
  } catch (error) {
    console.error('Error saving character:', error);
    throw error;
  }
};

// Получение персонажа по ID
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    // Пробуем получить из Firestore
    const charRef = doc(db, 'characters', id);
    const charSnapshot = await getDoc(charRef);
    
    if (charSnapshot.exists()) {
      return charSnapshot.data() as Character;
    }
    
    // Если не найден в Firestore, пробуем в localStorage
    console.log('Character not found in Firestore, checking localStorage');
    const existingChars = localStorage.getItem('dnd-characters');
    if (existingChars) {
      const characters: Character[] = JSON.parse(existingChars);
      const character = characters.find(char => char.id === id);
      return character || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting character:', error);
    
    // Проверяем локальное хранилище как резервный вариант
    try {
      const existingChars = localStorage.getItem('dnd-characters');
      if (existingChars) {
        const characters: Character[] = JSON.parse(existingChars);
        const character = characters.find(char => char.id === id);
        return character || null;
      }
    } catch (localError) {
      console.error('Error getting character from localStorage:', localError);
    }
    
    return null;
  }
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    // Удаляем из Firestore
    const charRef = doc(db, 'characters', id);
    await deleteDoc(charRef);
    console.log('Character deleted from Firestore');
    
    // Удаляем из localStorage для синхронизации
    const existingChars = localStorage.getItem('dnd-characters');
    if (existingChars) {
      let characters: Character[] = JSON.parse(existingChars);
      characters = characters.filter(char => char.id !== id);
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
    }
  } catch (error) {
    console.error('Error deleting character from Firestore:', error);
    
    // Удаляем из localStorage как резервный вариант
    try {
      const existingChars = localStorage.getItem('dnd-characters');
      if (existingChars) {
        let characters: Character[] = JSON.parse(existingChars);
        characters = characters.filter(char => char.id !== id);
        localStorage.setItem('dnd-characters', JSON.stringify(characters));
      }
    } catch (localError) {
      console.error('Error deleting character from localStorage:', localError);
      throw localError;
    }
  }
};

// Получение всех персонажей для текущего пользователя
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    const userId = getCurrentUid();
    if (!userId) {
      console.warn('No user ID available, returning characters from localStorage');
      // Если нет ID пользователя, возвращаем из localStorage
      const existingChars = localStorage.getItem('dnd-characters');
      return existingChars ? JSON.parse(existingChars) : [];
    }
    
    // Получаем персонажей из Firestore
    const charactersCollection = collection(db, 'characters');
    const q = query(charactersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push(doc.data() as Character);
    });
    
    // Если в Firestore нет персонажей, проверяем localStorage
    if (characters.length === 0) {
      console.log('No characters found in Firestore, checking localStorage');
      const existingChars = localStorage.getItem('dnd-characters');
      if (existingChars) {
        return JSON.parse(existingChars);
      }
    }
    
    return characters;
  } catch (error) {
    console.error('Error getting all characters from Firestore:', error);
    
    // Возвращаем из localStorage как резервный вариант
    try {
      const existingChars = localStorage.getItem('dnd-characters');
      return existingChars ? JSON.parse(existingChars) : [];
    } catch (localError) {
      console.error('Error getting characters from localStorage:', localError);
      return [];
    }
  }
};

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  if (!userId) return [];
  
  try {
    const charactersCollection = collection(db, 'characters');
    const q = query(charactersCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      characters.push(doc.data() as Character);
    });
    
    return characters;
  } catch (error) {
    console.error('Error getting characters by userId:', error);
    return [];
  }
};

// Экспортируем функции как дефолтный экспорт для совместимости
const characterService = {
  saveCharacter,
  getCharacter,
  deleteCharacter,
  getAllCharacters,
  getCharactersByUserId
};

export default characterService;
