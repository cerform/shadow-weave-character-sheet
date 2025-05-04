
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, getDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { CharacterSheet } from '@/types/character';

/**
 * Сохраняет персонажа в базу данных
 * @param character Данные персонажа
 * @returns Объект с id сохраненного персонажа
 */
export const saveCharacter = async (character: CharacterSheet): Promise<{id: string}> => {
  try {
    // Проверяем наличие id (для обновления существующего персонажа)
    if (character.id) {
      // Обновляем существующего персонажа
      const characterRef = doc(db, 'characters', character.id);
      
      // Добавляем timestamp обновления
      const updatedCharacter = { 
        ...character, 
        updatedAt: new Date().toISOString() 
      };
      
      await updateDoc(characterRef, updatedCharacter);
      
      return { id: character.id };
    } else {
      // Создаем нового персонажа
      const characterData = { 
        ...character,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'characters'), characterData);
      
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
 * Получает всех персонажей пользователя
 * @param userId ID пользователя
 * @returns Массив персонажей
 */
export const getCharactersByUserId = async (userId: string): Promise<CharacterSheet[]> => {
  try {
    const charactersQuery = query(
      collection(db, 'characters'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(charactersQuery);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as CharacterSheet));
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    throw new Error('Не удалось получить персонажей');
  }
};

/**
 * Удаляет персонажа по его ID
 * @param id ID персонажа
 */
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'characters', id));
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    throw new Error('Не удалось удалить персонажа');
  }
};

export default {
  saveCharacter,
  getCharacterById,
  getCharactersByUserId,
  deleteCharacter
};
