
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { CharacterSheet } from '@/types/character';
import { auth } from './firebase';

/**
 * Сохраняет персонажа в базу данных
 * @param character Данные персонажа
 * @returns Объект с id сохраненного персонажа
 */
export const saveCharacter = async (character: CharacterSheet): Promise<{id: string}> => {
  try {
    // Проверяем авторизацию
    const currentUser = auth.currentUser;
    if (!currentUser && !character.userId) {
      throw new Error('Пользователь не авторизован');
    }

    // Если userId не установлен, берем из текущего пользователя
    const userId = character.userId || currentUser?.uid;
    
    // Проверяем наличие id (для обновления существующего персонажа)
    if (character.id) {
      // Обновляем существующего персонажа
      const characterRef = doc(db, 'characters', character.id);
      
      // Добавляем timestamp обновления и userId
      const updatedCharacter = { 
        ...character, 
        updatedAt: new Date().toISOString(),
        userId
      };
      
      await updateDoc(characterRef, updatedCharacter);
      console.log("Персонаж успешно обновлен:", character.id);
      
      return { id: character.id };
    } else {
      // Создаем нового персонажа
      const characterData = { 
        ...character,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'characters'), characterData);
      console.log("Персонаж успешно создан с ID:", docRef.id);
      
      return { id: docRef.id };
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

/**
 * Получает персонажа по его ID
 * @param id ID персонажа
 * @returns Данные персонажа или null
 */
export const getCharacterById = async (id: string): Promise<CharacterSheet | null> => {
  try {
    const characterRef = doc(db, 'characters', id);
    const characterDoc = await getDoc(characterRef);
    
    if (characterDoc.exists()) {
      const characterData = characterDoc.data() as CharacterSheet;
      return { ...characterData, id: characterDoc.id };
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    throw new Error('Не удалось получить персонажа');
  }
};

/**
 * Получает всех персонажей текущего пользователя
 * @returns Массив персонажей
 */
export const getCharactersByUserId = async (): Promise<CharacterSheet[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('Пользователь не авторизован, возвращаем пустой список персонажей');
      return [];
    }

    const userId = currentUser.uid;
    console.log('Получение персонажей для пользователя:', userId);
    
    const charactersQuery = query(
      collection(db, 'characters'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(charactersQuery);
    const characters = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as CharacterSheet));

    console.log('Получены персонажи:', characters.length);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    throw new Error('Не удалось получить персонажей');
  }
};

/**
 * Получает всех персонажей (алиас для getCharactersByUserId)
 * @returns Массив персонажей
 */
export const getCharacters = async (): Promise<CharacterSheet[]> => {
  return getCharactersByUserId();
};

/**
 * Удаляет персонажа по его ID
 * @param id ID персонажа
 */
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'characters', id));
    console.log('Персонаж успешно удален:', id);
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    throw new Error('Не удалось удалить персонажа');
  }
};

// Для совместимости с предыдущим API
export default {
  saveCharacter,
  getCharacterById,
  getCharactersByUserId,
  getCharacters,
  deleteCharacter
};
