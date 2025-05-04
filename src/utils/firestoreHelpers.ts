
import { db, auth } from "@/services/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { getCurrentUid } from "./authHelpers";
import { Character } from "@/contexts/CharacterContext";

// Определение типа данных пользователя из Firestore
export interface FirestoreUserData {
  id: string;
  displayName?: string;
  email?: string;
  isDM?: boolean;
  characters?: string[];
  campaigns?: string[];
  createdAt?: string | Timestamp;
  lastLogin?: string | Timestamp;
  [key: string]: any; // Для других возможных полей
}

/**
 * Проверяет, доступно ли Firebase подключение
 * @returns true, если Firebase доступен
 */
export const isFirebaseAvailable = (): boolean => {
  try {
    return !!db;
  } catch (error) {
    console.warn("Firebase недоступен:", error);
    return false;
  }
};

/**
 * Получение документа пользователя по UID
 * @param uid ID пользователя
 * @returns Данные пользователя или null
 */
export const getUserData = async (uid: string): Promise<FirestoreUserData | null> => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, невозможно получить данные пользователя");
      return null;
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as FirestoreUserData;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};

/**
 * Создание или обновление документа пользователя
 * @param uid ID пользователя
 * @param userData Данные пользователя
 */
export const updateUserData = async (uid: string, userData: any) => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, невозможно обновить данные пользователя");
      return false;
    }
    
    const userRef = doc(db, 'users', uid);
    
    // Проверяем существует ли документ
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Обновление существующего документа
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp()
      });
    } else {
      // Создание нового документа
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        characters: userData.characters || [],
        campaigns: userData.campaigns || []
      });
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error);
    return false;
  }
};

/**
 * Добавление персонажа в список персонажей пользователя
 * @param uid ID пользователя
 * @param characterId ID персонажа
 */
export const addCharacterToUser = async (uid: string, characterId: string) => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, персонаж будет добавлен только локально");
      return false;
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const characters = userData.characters || [];
      
      // Проверяем, нет ли уже такого персонажа в списке
      if (!characters.includes(characterId)) {
        await updateDoc(userRef, {
          characters: [...characters, characterId]
        });
      }
      
      return true;
    } else {
      // Если пользователь не существует, создаем его
      await setDoc(userRef, {
        characters: [characterId],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      return true;
    }
    
  } catch (error) {
    console.error('Ошибка при добавлении персонажа пользователю:', error);
    return false;
  }
};

/**
 * Удаление персонажа из списка персонажей пользователя
 * @param uid ID пользователя
 * @param characterId ID персонажа
 */
export const removeCharacterFromUser = async (uid: string, characterId: string) => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, персонаж будет удален только локально");
      return false;
    }
    
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const characters = userData.characters || [];
      
      await updateDoc(userRef, {
        characters: characters.filter((id: string) => id !== characterId)
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Ошибка при удалении персонажа у пользователя:', error);
    return false;
  }
};

/**
 * Сохранение персонажа в Firestore
 * @param character Данные персонажа
 */
export const saveCharacterToFirestore = async (character: Character) => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, персонаж будет сохранен только локально");
      
      // Сохраняем персонажа локально
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      // Обновляем или добавляем персонажа
      const existingCharacterIndex = characters.findIndex((c: any) => c.id === character.id);
      if (existingCharacterIndex >= 0) {
        characters[existingCharacterIndex] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      console.info("Персонаж сохранен локально");
      
      return true;
    }
    
    const uid = getCurrentUid();
    if (!uid) {
      console.info('Пользователь не авторизован, сохраняем персонажа локально');
      
      // Сохраняем персонажа локально
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      // Обновляем или добавляем персонажа
      const existingCharacterIndex = characters.findIndex((c: any) => c.id === character.id);
      if (existingCharacterIndex >= 0) {
        characters[existingCharacterIndex] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      
      return true;
    }
    
    // Убедимся, что у персонажа есть userId
    if (!character.userId) {
      character.userId = uid;
    }
    
    console.log("Сохранение персонажа в Firestore:", character.id, character.name);
    
    // Сохраняем персонажа в коллекцию 'characters' с ID персонажа (а не пользователя)
    const characterRef = doc(db, 'characters', character.id);
    
    await setDoc(characterRef, {
      ...character,
      userId: uid,
      updatedAt: new Date().toISOString()
    });
    
    // Добавляем персонажа в список пользователя
    await addCharacterToUser(uid, character.id);
    
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    
    // Попытка сохранения локально в случае ошибки
    try {
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      // Обновляем или добавляем персонажа
      const existingCharacterIndex = characters.findIndex((c: any) => c.id === character.id);
      if (existingCharacterIndex >= 0) {
        characters[existingCharacterIndex] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      console.info("Персонаж сохранен локально после ошибки Firebase");
      
      return true;
    } catch (localError) {
      console.error('Ошибка при локальном сохранении персонажа:', localError);
      return false;
    }
  }
};

/**
 * Получение персонажа по ID
 * @param characterId ID персонажа
 */
export const getCharacterById = async (characterId: string) => {
  try {
    if (!isFirebaseAvailable()) {
      console.info("Firebase недоступен, ищем персонажа локально");
      
      // Ищем персонажа локально
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const character = characters.find((c: any) => c.id === characterId);
      
      return character || null;
    }
    
    const characterRef = doc(db, 'characters', characterId);
    const characterSnap = await getDoc(characterRef);
    
    if (characterSnap.exists()) {
      return { id: characterSnap.id, ...characterSnap.data() } as Character;
    }
    
    // Если персонаж не найден в Firestore, пытаемся найти его локально
    const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
    const characters = JSON.parse(savedCharacters);
    const character = characters.find((c: any) => c.id === characterId);
    
    return character || null;
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    
    // Пытаемся найти персонажа локально
    try {
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const character = characters.find((c: any) => c.id === characterId);
      
      return character || null;
    } catch (localError) {
      console.error('Ошибка при получении персонажа из локального хранилища:', localError);
      return null;
    }
  }
};

/**
 * Получение всех персонажей пользователя
 * @returns Массив персонажей
 */
export const getUserCharacters = async () => {
  try {
    console.info("Загрузка персонажей из Firebase...");
    
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, загружаем персонажей только из локального хранилища");
      
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      console.info("Найдены локальные персонажи:", characters.length);
      return characters;
    }
    
    const uid = getCurrentUid();
    if (!uid) {
      console.info('Пользователь не авторизован');
      
      // Загружаем персонажей из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      console.info("Найдены локальные персонажи:", characters.length);
      return characters;
    }
    
    console.info("Запрашиваем персонажей из Firestore...");
    
    // Получаем персонажей, где userId соответствует текущему пользователю
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      console.info("Загружен персонаж:", doc.id);
      characters.push({ id: doc.id, ...doc.data() } as Character);
    });
    
    console.info("Загружено", characters.length, "персонажей из Firestore");
    
    // Если нет персонажей в Firebase, проверяем локальное хранилище
    if (characters.length === 0) {
      console.info("Персонажи не найдены в Firebase, проверяем localStorage...");
      
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const localCharacters = JSON.parse(savedCharacters);
      
      console.info("Найдены локальные персонажи:", localCharacters.length);
      return localCharacters;
    }
    
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    
    // В случае ошибки, загружаем из localStorage
    try {
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      console.info("Найдены локальные персонажи после ошибки Firebase:", characters.length);
      return characters;
    } catch (localError) {
      console.error('Ошибка при загрузке персонажей из локального хранилища:', localError);
      return [];
    }
  }
};

/**
 * Удаление персонажа
 * @param characterId ID персонажа
 */
export const deleteCharacterFromFirestore = async (characterId: string) => {
  try {
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, персонаж будет удален только локально");
      
      // Удаляем персонажа из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const updatedCharacters = characters.filter((c: any) => c.id !== characterId);
      localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
      
      return true;
    }
    
    const uid = getCurrentUid();
    if (!uid) {
      console.warn('Пользователь не авторизован, удаляем персонажа только локально');
      
      // Удаляем персонажа из localStorage
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const updatedCharacters = characters.filter((c: any) => c.id !== characterId);
      localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
      
      return true;
    }
    
    // Получаем персонажа для проверки владельца
    const characterRef = doc(db, 'characters', characterId);
    const characterSnap = await getDoc(characterRef);
    
    if (!characterSnap.exists()) {
      // Если персонаж не найден в Firebase, проверяем локальное хранилище
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const updatedCharacters = characters.filter((c: any) => c.id !== characterId);
      localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
      
      return true;
    }
    
    const characterData = characterSnap.data();
    
    // Проверяем, является ли текущий пользователь владельцем
    if (characterData.userId !== uid) {
      console.error('У вас нет прав на удаление этого персонажа');
      return false;
    }
    
    // Удаляем персонажа
    await deleteDoc(characterRef);
    
    // Удаляем персонажа из списка пользователя
    await removeCharacterFromUser(uid, characterId);
    
    // Также удаляем из локального хранилища
    const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
    const characters = JSON.parse(savedCharacters);
    const updatedCharacters = characters.filter((c: any) => c.id !== characterId);
    localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    
    // В случае ошибки Firebase, пытаемся удалить только локально
    try {
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      const updatedCharacters = characters.filter((c: any) => c.id !== characterId);
      localStorage.setItem('dnd-characters', JSON.stringify(updatedCharacters));
      
      console.info("Персонаж удален локально после ошибки Firebase");
      return true;
    } catch (localError) {
      console.error('Ошибка при удалении персонажа из локального хранилища:', localError);
      return false;
    }
  }
};

/**
 * Очистка всех персонажей пользователя
 * @returns Успешность операции
 */
export const clearAllUserCharacters = async () => {
  try {
    // Очищаем персонажей из localStorage
    localStorage.setItem('dnd-characters', '[]');
    
    if (!isFirebaseAvailable()) {
      console.warn("Firebase недоступен, персонажи удалены только из локального хранилища");
      return true;
    }
    
    const uid = getCurrentUid();
    if (!uid) {
      console.warn('Пользователь не авторизован, персонажи удалены только из локального хранилища');
      return true;
    }
    
    // Получаем все персонажи текущего пользователя
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    // Удаляем все найденные персонажи
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Очищаем список персонажей в документе пользователя
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      characters: []
    });
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении всех персонажей:', error);
    return localStorage.getItem('dnd-characters') === '[]'; // Возвращаем true, если localStorage очищен
  }
};
