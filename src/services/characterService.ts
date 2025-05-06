
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
      const characterData = {
        id: doc.id,
        ...data,
      } as Character;
      console.log(`Загружен персонаж: ${characterData.name || 'Безымянный'} с ID: ${characterData.id}`);
      return characterData;
    });
    
    console.log(`Получено ${characters.length} персонажей`);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    throw error;
  }
};

// Получение всех персонажей пользователя
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('Загрузка всех персонажей');
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
    console.log('Получение персонажа с ID:', id);
    const docRef = doc(db, 'characters', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const characterData = { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Character;
      console.log('Персонаж найден:', characterData.name);
      return characterData;
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
    
    // Если у персонажа уже есть ID
    if (characterToSave.id) {
      console.log(`Обновление существующего персонажа с ID ${characterToSave.id}`);
      const characterRef = doc(db, 'characters', characterToSave.id);
      await setDoc(characterRef, characterToSave, { merge: true });
      return characterToSave.id;
    } 
    // Создание нового персонажа
    else {
      console.log('Создание нового персонажа');
      // Для нового персонажа добавляем дату создания
      characterToSave.createdAt = now;
      
      // Убедимся, что у персонажа есть имя
      if (!characterToSave.name) {
        characterToSave.name = "Безымянный герой";
      }
      
      const docRef = await addDoc(collection(db, 'characters'), characterToSave);
      console.log(`Новый персонаж создан с ID: ${docRef.id}`);
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
    
    // Если у персонажа уже есть ID
    if (characterToSave.id) {
      console.log(`saveCharacterToFirestore: Обновление персонажа с ID ${characterToSave.id}`);
      const characterRef = doc(db, 'characters', characterToSave.id);
      await setDoc(characterRef, characterToSave, { merge: true });
      return characterToSave.id;
    } 
    // Создание нового персонажа
    else {
      console.log('saveCharacterToFirestore: Создание нового персонажа');
      const docRef = await addDoc(collection(db, 'characters'), characterToSave);
      console.log(`saveCharacterToFirestore: Новый персонаж создан с ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа в Firestore:', error);
    throw error;
  }
};
