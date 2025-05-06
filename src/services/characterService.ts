
import { collection, doc, getDocs, getDoc, query, where, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Character } from '@/types/character';
import { getCurrentUserIdExtended } from '@/utils/authHelpers';

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    console.log('Загрузка персонажей для пользователя:', userId);
    const q = query(collection(db, 'characters'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('Персонажи не найдены');
      return [];
    }
    
    const characters = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Character;
    });
    
    console.log(`Получено ${characters.length} персонажей`);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    throw error;
  }
};

// Получение всех персонажей (запасной метод)
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('Загрузка всех персонажей');
    const userId = getCurrentUserIdExtended();
    
    if (!userId) {
      console.error('ID пользователя не найден');
      return [];
    }
    
    const charactersCollection = collection(db, 'characters');
    const snapshot = await getDocs(charactersCollection);
    
    const characters = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as Character;
      })
      .filter(char => char.userId === userId);
    
    console.log(`Получено ${characters.length} персонажей (общий метод)`);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении всех персонажей:', error);
    throw error;
  }
};

// Получение персонажа по ID
export const getCharacterById = async (id: string): Promise<Character | null> => {
  try {
    const docRef = doc(db, 'characters', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Character;
    } else {
      console.log('Персонаж не найден');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    throw error;
  }
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'characters', id));
    console.log(`Персонаж ${id} удален`);
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    throw error;
  }
};

// Сохранение персонажа
export const saveCharacter = async (character: Character): Promise<string> => {
  try {
    // Убедимся, что у персонажа есть имя
    if (!character.name) {
      character.name = "Безымянный герой";
    }
    
    // Добавление дат создания/обновления
    const now = new Date().toISOString();
    
    // Обновление существующего персонажа
    if (character.id) {
      const characterRef = doc(db, 'characters', character.id);
      await setDoc(characterRef, { 
        ...character, 
        updatedAt: now
      }, { merge: true });
      console.log(`Персонаж ${character.id} обновлен`);
      return character.id;
    } 
    // Создание нового персонажа
    else {
      // Получаем userID
      const userId = getCurrentUserIdExtended();
      if (!userId) {
        throw new Error('ID пользователя не найден');
      }
      
      const characterData = {
        ...character,
        userId,
        createdAt: now,
        updatedAt: now
      };
      
      const docRef = await addDoc(collection(db, 'characters'), characterData);
      console.log(`Новый персонаж создан с ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};
