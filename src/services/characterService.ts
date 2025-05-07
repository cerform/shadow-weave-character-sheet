
import { collection, doc, getDocs, query, where, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Используем центральный экземпляр db
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { auth } from '@/lib/firebase'; // Импортируем auth из центрального места

/**
 * Получение всех персонажей
 * @returns Массив персонажей
 */
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('characterService: запрос всех персонажей');
    const charactersRef = collection(db, 'characters');
    const snapshot = await getDocs(charactersRef);
    
    const characters = snapshot.docs.map(doc => {
      const data = doc.data();
      return { ...data, id: doc.id } as Character;
    });
    
    console.log(`characterService: получено ${characters.length} персонажей`);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении всех персонажей:', error);
    throw error;
  }
};

/**
 * Получение персонажей конкретного пользователя
 * @param userId ID пользователя
 * @returns Массив персонажей
 */
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('getCharactersByUserId: Некорректный userId:', userId);
      throw new Error('Некорректный ID пользователя');
    }
    
    console.log('getCharactersByUserId: Запрос персонажей для пользователя:', userId);
    
    // Проверяем, что пользователь авторизован
    if (!auth.currentUser) {
      console.error('getCharactersByUserId: Пользователь не авторизован!');
      throw new Error('Пользователь не авторизован');
    }
    
    // Явно преобразуем в строку и используем trim для удаления пробелов
    const userIdString = String(userId).trim();
    
    // Проверяем доступность базы данных
    if (!db) {
      console.error('getCharactersByUserId: База данных недоступна');
      throw new Error('База данных недоступна');
    }
    
    console.log('getCharactersByUserId: Проверка базы данных успешна');
    
    // Создаем запрос с ЯВНЫМ фильтром по userId
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where("userId", "==", userIdString));
    
    console.log('getCharactersByUserId: Выполняем запрос с userId =', userIdString);
    
    try {
      const snapshot = await getDocs(q);
      console.log(`getCharactersByUserId: Найдено ${snapshot.docs.length} документов`);
      
      // Логируем все полученные документы для отладки
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`getCharactersByUserId: Документ ${index + 1}:`, { 
          id: doc.id,
          userId: data.userId,
          name: data.name || 'без имени'
        });
      });
      
      // Маппинг результатов с дополнительной проверкой
      const characters = snapshot.docs.map(doc => {
        const data = doc.data();
        // Добавляем проверку наличия userId и соответствия запрошенному
        if (!data.userId) {
          console.warn(`getCharactersByUserId: У персонажа ${doc.id} отсутствует userId, ожидалось ${userIdString}`);
          data.userId = userIdString; // Исправляем на лету
        }
        
        return { ...data, id: doc.id } as Character;
      });
      
      console.log(`getCharactersByUserId: Обработано ${characters.length} персонажей:`, 
        characters.map(c => ({ id: c.id, name: c.name, userId: c.userId })));
      
      return characters;
    } catch (error) {
      console.error('getCharactersByUserId: Ошибка при выполнении запроса:', error);
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    throw error;
  }
};

/**
 * Получение персонажа по ID
 * @param id ID персонажа
 * @returns Персонаж или null
 */
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    const docRef = doc(db, 'characters', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { ...data, id: docSnap.id } as Character;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при получении персонажа с ID ${id}:`, error);
    throw error;
  }
};

/**
 * Сохранение персонажа
 * @param character Данные персонажа
 * @returns ID персонажа
 */
export const saveCharacter = async (character: Character): Promise<string> => {
  try {
    // Проверяем наличие userId
    const userId = getCurrentUid();
    
    // Если у персонажа нет userId и мы можем его получить, добавляем
    if (!character.userId && userId) {
      character.userId = userId;
      console.log('saveCharacter: Добавлен userId:', userId);
    }
    
    // Если у персонажа по-прежнему нет userId, это ошибка
    if (!character.userId) {
      throw new Error('Ошибка: У персонажа отсутствует userId');
    }
    
    // Проверяем соединение с базой
    if (!db) {
      console.error('saveCharacter: Нет соединения с Firebase');
      throw new Error('Нет соединения с базой данных');
    }
    
    console.log('saveCharacter: Сохраняем персонажа', { 
      id: character.id, 
      name: character.name, 
      userId: character.userId 
    });
    
    if (character.id) {
      // Обновление существующего персонажа
      const docRef = doc(db, 'characters', character.id);
      // Делаем копию объекта без id для обновления
      const { id, ...updateData } = character;
      await updateDoc(docRef, updateData);
      console.log('saveCharacter: Персонаж обновлен с ID:', character.id);
      return character.id;
    } else {
      // Создание нового персонажа
      const docRef = await addDoc(collection(db, 'characters'), { ...character });
      console.log('saveCharacter: Создан новый персонаж с ID:', docRef.id);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

/**
 * Сохранение персонажа в Firestore
 * @param character Данные персонажа
 * @param userId ID пользователя
 * @returns ID персонажа
 */
export const saveCharacterToFirestore = async (character: Character, userId?: string): Promise<string> => {
  try {
    // Проверяем наличие userId
    const uid = userId || getCurrentUid();
    if (!uid) {
      throw new Error('Ошибка: Пользователь не авторизован');
    }

    // Создаем копию персонажа для сохранения
    const characterToSave = { 
      ...character,
      userId: uid,
      updatedAt: new Date().toISOString()
    };

    // Если это новый персонаж, добавляем дату создания
    if (!characterToSave.createdAt) {
      characterToSave.createdAt = new Date().toISOString();
    }

    let charId: string;
    
    if (character.id) {
      // Обновление существующего персонажа
      const docRef = doc(db, 'characters', character.id);
      await updateDoc(docRef, { ...characterToSave });
      charId = character.id;
    } else {
      // Создание нового персонажа
      const docRef = await addDoc(collection(db, 'characters'), { ...characterToSave });
      charId = docRef.id;
    }

    return charId;
  } catch (error) {
    console.error('Ошибка при сохранении персонажа в Firestore:', error);
    throw error;
  }
};

/**
 * Удаление персонажа
 * @param id ID персонажа
 */
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'characters', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Ошибка при удалении персонажа с ID ${id}:`, error);
    throw error;
  }
};

/**
 * Создание тестового персонажа
 * @returns ID созданного персонажа
 */
export const createTestCharacter = async (): Promise<string> => {
  try {
    // Получаем ID текущего пользователя
    const userId = getCurrentUid();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Создаем тестового персонажа с явно указанным userId
    const testChar: Character = {
      id: "", // Пустая строка для нового персонажа
      name: `Тест ${new Date().toLocaleTimeString()}`,
      class: 'Воин', // Используем class вместо className, чтобы соответствовать интерфейсу
      className: 'Воин', // Оставляем для обратной совместимости
      race: 'Человек',
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
      userId: userId, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      }
    };
    
    const charId = await saveCharacter(testChar);
    return charId;
  } catch (error) {
    console.error('Ошибка при создании тестового персонажа:', error);
    throw error;
  }
};
