
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, getDocs, collection, query, where, deleteDoc, orderBy, DocumentData } from 'firebase/firestore';
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
    console.log('saveCharacter: Начало сохранения персонажа', character);
    
    // Генерируем ID если отсутствует
    if (!character.id) {
      character = { ...character, id: uuidv4() };
      console.log('saveCharacter: Сгенерирован новый ID:', character.id);
    } else {
      console.log('saveCharacter: Используется существующий ID:', character.id);
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
      console.log('saveCharacter: Добавлен ID пользователя:', userId);
    }
    
    // Очищаем объект от undefined значений
    Object.keys(character).forEach(key => {
      if (character[key as keyof Character] === undefined) {
        delete character[key as keyof Character];
      }
    });
    
    try {
      // Сохраняем в Firestore
      const characterRef = doc(db, 'characters', character.id);
      await setDoc(characterRef, character);
      console.log('saveCharacter: Персонаж успешно сохранен в Firestore:', character.id);
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

// Функция saveCharacterToFirestore для совместимости
export const saveCharacterToFirestore = async (character: Character, userId?: string): Promise<string> => {
  try {
    // Убедимся, что у персонажа есть ID пользователя
    if (userId && !character.userId) {
      character.userId = userId;
    }
    
    // Используем существующую функцию saveCharacter
    const savedCharacter = await saveCharacter(character);
    
    // Возвращаем ID сохраненного персонажа
    return savedCharacter.id;
  } catch (error) {
    console.error('Error saving character to Firestore:', error);
    throw error;
  }
};

// Получение персонажа по ID
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    console.log('getCharacter: Запрос персонажа по ID:', id);
    
    // Пробуем получить из Firestore
    const charRef = doc(db, 'characters', id);
    const charSnapshot = await getDoc(charRef);
    
    if (charSnapshot.exists()) {
      console.log('getCharacter: Персонаж найден в Firestore');
      return charSnapshot.data() as Character;
    }
    
    // Если не найден в Firestore, пробуем в localStorage
    console.log('Character not found in Firestore, checking localStorage');
    const existingChars = localStorage.getItem('dnd-characters');
    if (existingChars) {
      const characters: Character[] = JSON.parse(existingChars);
      const character = characters.find(char => char.id === id);
      if (character) {
        console.log('getCharacter: Персонаж найден в localStorage');
      }
      return character || null;
    }
    
    console.log('getCharacter: Персонаж не найден');
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

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  if (!userId) {
    console.error('getCharactersByUserId: Не указан userId!');
    return [];
  }
  
  try {
    console.log('Getting characters for user:', userId);
    const charactersCollection = collection(db, 'characters');
    
    // Создаем запрос с фильтрацией по userId
    const q = query(
      charactersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    console.log('Query parameters:', { 
      collection: 'characters', 
      filter: `where userId == ${userId}`,
      whereClause: `where("userId", "==", "${userId}")`
    });
    
    const querySnapshot = await getDocs(q);
    
    console.log('Query returned documents count:', querySnapshot.size);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      console.log('Character document:', { id: doc.id, name: data.name });
      characters.push({
        ...data,
        id: doc.id,
        name: data.name || 'Без имени',
        className: data.class || data.className || '—',
        level: data.level || 1,
      } as Character);
    });
    
    console.log('Found characters for userId:', characters.length);
    return characters;
  } catch (error) {
    console.error('Error getting characters by userId:', error);
    
    // Пробуем получить из localStorage как резервный вариант
    try {
      const existingChars = localStorage.getItem('dnd-characters');
      if (existingChars) {
        const allChars: Character[] = JSON.parse(existingChars);
        const userChars = allChars.filter(char => char.userId === userId);
        return userChars;
      }
    } catch (localError) {
      console.error('Error getting characters from localStorage:', localError);
    }
    
    return [];
  }
};

// Добавляем функцию getAllCharacters для совместимости
export const getAllCharacters = async (): Promise<Character[]> => {
  const userId = getCurrentUid();
  if (!userId) {
    console.warn('getAllCharacters: Пользователь не авторизован');
    return [];
  }
  
  // Используем существующую функцию для получения персонажей текущего пользователя
  return await getCharactersByUserId(userId);
};

// Экспортируем функции как дефолтный экспорт для совместимости
const characterService = {
  saveCharacter,
  saveCharacterToFirestore,
  getCharacter,
  deleteCharacter,
  getCharactersByUserId,
  getAllCharacters
};

export default characterService;
