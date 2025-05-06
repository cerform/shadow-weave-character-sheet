
import { collection, doc, getDocs, getDoc, query, where, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Character } from '@/types/character';
import { getCurrentUserIdExtended } from '@/utils/authHelpers';

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка персонажей для пользователя:', userId);
    
    // Создаем запрос к коллекции characters, фильтруя по userId
    const q = query(collection(db, 'characters'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('characterService: Персонажи не найдены для пользователя', userId);
      return [];
    }
    
    // Преобразуем документы Firestore в объекты Character
    const characters = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Character;
    });
    
    console.log(`characterService: Получено ${characters.length} персонажей`);
    characters.forEach(char => {
      console.log(`- ${char.name || 'Безымянный'} (ID: ${char.id})`);
    });
    
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    throw error;
  }
};

// Получение всех персонажей пользователя
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка всех персонажей');
    const userId = getCurrentUserIdExtended();
    
    if (!userId) {
      console.error('ID пользователя не найден');
      return [];
    }
    
    return await getCharactersByUserId(userId);
  } catch (error) {
    console.error('Ошибка при получении всех персонажей:', error);
    throw error;
  }
};

// Получение персонажа по ID
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    console.log('characterService: Получение персонажа с ID:', id);
    const docRef = doc(db, 'characters', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const characterData = { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Character;
      console.log('characterService: Персонаж найден:', characterData.name);
      return characterData;
    } else {
      console.log('characterService: Персонаж не найден');
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
    console.log(`characterService: Персонаж ${id} удален`);
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    throw error;
  }
};

// Сохранение персонажа
export const saveCharacter = async (character: Character): Promise<string> => {
  try {
    // Проверяем существование персонажа
    const now = new Date().toISOString();
    let characterToSave = { ...character, updatedAt: now };
    
    // Убедимся, что у персонажа есть ID пользователя
    if (!characterToSave.userId) {
      const userId = getCurrentUserIdExtended();
      if (!userId) {
        throw new Error('ID пользователя не найден');
      }
      characterToSave.userId = userId;
    }
    
    // Исключаем специальные объекты, которые могут вызвать ошибку сериализации
    // Очищаем объект от полей, которые могут содержать неклонируемые значения
    const cleanObject = (obj: any): any => {
      const cleaned = { ...obj };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] instanceof Request ||
            cleaned[key] instanceof Response ||
            key === '__ob__' || // Vue.js observer
            key.startsWith('_') || // Internal properties
            cleaned[key] === undefined) {
          delete cleaned[key];
        } else if (cleaned[key] !== null && typeof cleaned[key] === 'object') {
          cleaned[key] = cleanObject(cleaned[key]);
        }
      });
      return cleaned;
    };
    
    const cleanedCharacter = cleanObject(characterToSave);
    
    // Если у персонажа уже есть ID
    if (cleanedCharacter.id) {
      console.log(`characterService: Обновление существующего персонажа с ID ${cleanedCharacter.id}`);
      const characterRef = doc(db, 'characters', cleanedCharacter.id);
      await setDoc(characterRef, cleanedCharacter, { merge: true });
      return cleanedCharacter.id;
    } 
    // Создание нового персонажа
    else {
      console.log('characterService: Создание нового персонажа');
      // Для нового персонажа добавляем дату создания
      cleanedCharacter.createdAt = now;
      
      // Убедимся, что у персонажа есть имя
      if (!cleanedCharacter.name) {
        cleanedCharacter.name = "Безымянный герой";
      }
      
      const docRef = await addDoc(collection(db, 'characters'), cleanedCharacter);
      console.log(`characterService: Новый персонаж создан с ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

// Функция saveCharacterToFirestore для использования в других файлах
export const saveCharacterToFirestore = async (character: Character, userId: string): Promise<string> => {
  try {
    // Подготавливаем данные персонажа
    let characterToSave = { ...character, userId };
    
    // Добавляем дату обновления
    characterToSave.updatedAt = new Date().toISOString();
    
    // Если персонаж новый, добавляем дату создания
    if (!characterToSave.createdAt) {
      characterToSave.createdAt = characterToSave.updatedAt;
    }
    
    // Убедимся, что у персонажа есть имя
    if (!characterToSave.name) {
      characterToSave.name = "Безымянный герой";
    }
    
    // Очищаем объект от полей, которые могут содержать неклонируемые значения
    const cleanObject = (obj: any): any => {
      const cleaned = { ...obj };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] instanceof Request ||
            cleaned[key] instanceof Response ||
            cleaned[key] === undefined) {
          delete cleaned[key];
        } else if (cleaned[key] !== null && typeof cleaned[key] === 'object') {
          cleaned[key] = cleanObject(cleaned[key]);
        }
      });
      return cleaned;
    };
    
    const cleanedCharacter = cleanObject(characterToSave);
    
    // Если у персонажа уже есть ID
    if (cleanedCharacter.id) {
      console.log(`saveCharacterToFirestore: Обновление персонажа с ID ${cleanedCharacter.id}`);
      const characterRef = doc(db, 'characters', cleanedCharacter.id);
      await setDoc(characterRef, cleanedCharacter, { merge: true });
      return cleanedCharacter.id;
    } 
    // Создание нового персонажа
    else {
      console.log('saveCharacterToFirestore: Создание нового персонажа');
      const docRef = await addDoc(collection(db, 'characters'), cleanedCharacter);
      console.log(`saveCharacterToFirestore: Новый персонаж создан с ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа в Firestore:', error);
    throw error;
  }
};
