import { collection, doc, getDocs, getDoc, query, where, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Character } from '@/types/character';
import { getCurrentUserIdExtended } from '@/utils/authHelpers';

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка персонажей для пользователя:', userId);
    
    if (!userId || userId.trim() === '') {
      console.error('characterService: ID пользователя пустой или невалидный');
      return [];
    }
    
    // Создаем запрос к коллекции characters, фильтруя по userId
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where('userId', '==', userId));
    
    console.log('characterService: Выполняем запрос к Firestore...');
    const snapshot = await getDocs(q);
    
    console.log(`characterService: Получен ответ от Firestore, документов: ${snapshot.size}`);
    
    if (snapshot.empty) {
      console.log('characterService: Персонажи не найдены для пользователя', userId);
      return [];
    }
    
    // Преобразуем документы Firestore в объекты Character
    const characters: Character[] = [];
    
    snapshot.forEach(doc => {
      try {
        const data = doc.data();
        const character = {
          id: doc.id,
          ...data,
        } as Character;
        characters.push(character);
      } catch (e) {
        console.error('characterService: Ошибка при обработке документа персонажа:', e);
      }
    });
    
    console.log(`characterService: Получено ${characters.length} персонажей`);
    characters.forEach((char, index) => {
      console.log(`- ${index + 1}. ${char.name || 'Безымянный'} (ID: ${char.id})`);
    });
    
    return characters;
  } catch (error) {
    console.error('characterService: Ошибка при получении персонажей:', error);
    throw error;
  }
};

// Получение всех персонажей пользователя
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка всех персонажей');
    const userId = getCurrentUserIdExtended();
    
    if (!userId) {
      console.error('characterService: ID пользователя не найден');
      return [];
    }
    
    return await getCharactersByUserId(userId);
  } catch (error) {
    console.error('characterService: Ошибка при получении всех персонажей:', error);
    return []; // Изменено: возвращаем пустой массив вместо выброса исключения
  }
};

// Получение персонажа по ID
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    if (!id || id.trim() === '') {
      console.error('characterService: Получен пустой ID персонажа');
      return null;
    }
    
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
    console.error('characterService: Ошибка при получении персонажа:', error);
    throw error;
  }
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    if (!id || id.trim() === '') {
      throw new Error('ID персонажа не может быть пустым');
    }
    
    await deleteDoc(doc(db, 'characters', id));
    console.log(`characterService: Персонаж ${id} удален`);
  } catch (error) {
    console.error('characterService: Ошибка при удалении персонажа:', error);
    throw error;
  }
};

// Функция очистки объекта от неклонируемых значений
const cleanObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  // Если это массив, очищаем каждый элемент
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }
  
  // Создаем новый объект для очищенных данных
  const cleaned: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    try {
      // Пропускаем функции, символы и т.д.
      if (typeof obj[key] === 'function' || 
          typeof obj[key] === 'symbol' || 
          obj[key] instanceof Request ||
          obj[key] instanceof Response ||
          key === '__ob__' || // Vue.js observer
          key.startsWith('_')) { // Internal properties
        return;
      }
      
      // Если свойство имеет значение undefined, пропускаем его
      if (obj[key] === undefined) {
        return;
      }
      
      // Рекурсивно очищаем вложенные объекты
      if (obj[key] !== null && typeof obj[key] === 'object') {
        cleaned[key] = cleanObject(obj[key]);
      } else {
        // Простые типы данных
        cleaned[key] = obj[key];
      }
    } catch (e) {
      console.error(`characterService: Ошибка при очистке свойства ${key}:`, e);
    }
  });
  
  return cleaned;
};

// Сохранение персонажа
export const saveCharacter = async (character: Character): Promise<string> => {
  try {
    if (!character) {
      throw new Error('Персонаж не может быть пустым');
    }
    
    // Получаем текущее время
    const now = new Date().toISOString();
    
    // Создаем копию персонажа и добавляем дату обновления
    let characterToSave = { ...character, updatedAt: now };
    
    // Убедимся, что у персонажа есть ID пользователя
    if (!characterToSave.userId) {
      const userId = getCurrentUserIdExtended();
      if (!userId) {
        throw new Error('ID пользователя не найден');
      }
      characterToSave.userId = userId;
    }
    
    // Очищаем объект от неклонируемых значений
    const cleanedCharacter = cleanObject(characterToSave);
    
    console.log(`characterService: Сохранение персонажа ${cleanedCharacter.name || 'Безымянный'}`);
    
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
      // Для ново��о персонажа добавляем дату создания
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
    console.error('characterService: Ошибка при сохранении персонажа:', error);
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
    
    // Очищаем объект от полей, которые могут вызвать ошибку сериализации
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
    console.error('saveCharacterToFirestore: Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

// Функция для создания тестового персонажа (для отладки)
export const createTestCharacter = async (): Promise<string> => {
  try {
    const userId = getCurrentUserIdExtended();
    if (!userId) {
      throw new Error('ID пользователя не найден');
    }
    
    const testCharacter: Character = {
      id: '',
      userId: userId,
      name: 'Тестовый персонаж',
      race: 'Человек',
      class: 'Воин',
      level: 1,
      experience: 0,
      strength: 14,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 10,
      maxHp: 12,
      currentHp: 12,
      background: 'Солдат',
      alignment: 'Законно-нейтральный',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return await saveCharacter(testCharacter);
  } catch (error) {
    console.error('characterService: Ошибка при создании тестового персонажа:', error);
    throw error;
  }
};
