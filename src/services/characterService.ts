
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/firebase';
import { 
  doc, setDoc, getDoc, getDocs, collection, 
  query, where, deleteDoc, orderBy, DocumentData, 
  QuerySnapshot, FirestoreError
} from 'firebase/firestore';
import { getCurrentUid, getCurrentUserIdExtended } from '@/utils/authHelpers';
import { auth } from '@/services/firebase/auth';

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
    console.log('deleteCharacter: Удаление персонажа с ID:', id);
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
    
    // Пробрасываем ошибку дальше, чтобы UI мог обработать её
    throw error;
  }
};

// Получение персонажей по ID пользователя
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  if (!userId) {
    console.error('getCharactersByUserId: Не указан userId!');
    return [];
  }
  
  try {
    console.log('getCharactersByUserId: Запрашиваем персонажей для userId:', userId);
    
    // Создаем запрос к коллекции characters
    const charactersCollection = collection(db, 'characters');
    
    // ВАЖНО: Создаем запрос с фильтрацией по userId, точно как в тестовой функции
    const q = query(
      charactersCollection,
      where('userId', '==', userId)
    );
    
    console.log('getCharactersByUserId: Параметры запроса:', { 
      collection: 'characters', 
      filter: `where userId == ${userId}`,
      whereClause: `where("userId", "==", "${userId}")`
    });
    
    // Выполняем запрос
    let querySnapshot: QuerySnapshot<DocumentData>;
    try {
      querySnapshot = await getDocs(q);
      console.log('getCharactersByUserId: Получено документов:', querySnapshot.size);
    } catch (firestoreError) {
      if (firestoreError instanceof FirestoreError) {
        console.error(`getCharactersByUserId: Ошибка Firestore [${firestoreError.code}]:`, firestoreError.message);
      } else {
        console.error('getCharactersByUserId: Неизвестная ошибка Firestore:', firestoreError);
      }
      throw firestoreError;
    }
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      console.log('getCharactersByUserId: Документ персонажа:', { 
        id: doc.id, 
        name: data.name || 'Без имени', 
        userId: data.userId || 'Не указан'
      });
      
      // Проверяем, что userId совпадает с переданным
      if (data.userId !== userId) {
        console.warn(`getCharactersByUserId: Персонаж ${doc.id} имеет userId ${data.userId}, что не совпадает с запрошенным ${userId}`);
      }
      
      // Убедимся, что у персонажа есть все необходимые поля
      characters.push({
        ...data,
        id: doc.id,
        userId: data.userId || userId,
        name: data.name || 'Без имени',
        className: data.className || data.class || '—',
        race: data.race || '—',
        level: data.level || 1
      } as Character);
    });
    
    // Для отладки выводим количество найденных персонажей
    console.log('getCharactersByUserId: Всего персонажей:', characters.length);
    if (characters.length > 0) {
      console.log('getCharactersByUserId: Первый персонаж:', characters[0]);
    } else {
      console.log('getCharactersByUserId: Персонажи не найдены для userId', userId);
      
      // Если персонажей нет, можно проверить доступ к коллекции
      try {
        // Тестовая попытка получить любой документ из коллекции tests
        const testCollection = collection(db, 'tests');
        const testQuery = query(testCollection);
        const testSnapshot = await getDocs(testQuery);
        console.log('getCharactersByUserId: Тестовый запрос к коллекции tests:', 
          testSnapshot.empty ? 'Коллекция пуста' : `Найдено ${testSnapshot.size} документов`);
      } catch (testError) {
        console.error('getCharactersByUserId: Ошибка при тестовом запросе к коллекции tests:', testError);
      }
    }
    
    return characters;
  } catch (error) {
    console.error('getCharactersByUserId: Ошибка при получении персонажей:', error);
    
    // Пробрасываем ошибку дальше
    throw error;
  }
};

// Добавляем функцию получения всех персонажей
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    const userId = getCurrentUid();
    if (!userId) {
      console.warn('getAllCharacters: Пользователь не авторизован');
      return [];
    }
    
    console.log('getAllCharacters: Получение персонажей для userId:', userId);
    
    // Используем существующую функцию для получения персонажей текущего пользователя
    return await getCharactersByUserId(userId);
  } catch (error) {
    console.error('getAllCharacters: Ошибка при получении персонажей:', error);
    return [];
  }
};

// Отдельная функция для резервной загрузки персонажей (в случае проблем с Firestore)
export const getCharactersFromLocalStorage = (): Character[] => {
  try {
    console.log('getCharactersFromLocalStorage: Попытка загрузить персонажей из localStorage');
    
    // Пытаемся получить из localStorage как резервный вариант
    const existingChars = localStorage.getItem('dnd-characters');
    if (!existingChars) {
      console.log('getCharactersFromLocalStorage: В localStorage нет персонажей');
      return [];
    }
    
    const allCharacters = JSON.parse(existingChars) as Character[];
    if (!Array.isArray(allCharacters)) {
      console.warn('getCharactersFromLocalStorage: Данные из localStorage не являются массивом');
      return [];
    }
    
    const userId = getCurrentUid();
    if (!userId) {
      console.warn('getCharactersFromLocalStorage: Пользователь не авторизован, возвращаем все персонажи из localStorage');
      return allCharacters;
    }
    
    // Фильтруем персонажей текущего пользователя
    const userCharacters = allCharacters.filter(char => char.userId === userId);
    console.log('getCharactersFromLocalStorage: Найдено персонажей в localStorage:', userCharacters.length);
    
    return userCharacters;
  } catch (localError) {
    console.error('getCharactersFromLocalStorage: Ошибка при загрузке из localStorage:', localError);
    return [];
  }
};

// Экспортируем функции как дефолтный экспорт для совместимости
const characterService = {
  saveCharacter,
  saveCharacterToFirestore,
  getCharacter,
  deleteCharacter,
  getCharactersByUserId,
  getAllCharacters,
  getCharactersFromLocalStorage
};

export default characterService;
