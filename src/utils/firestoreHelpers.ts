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
import { characterService } from "@/services/characterService";

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
 * Сохранение персонажа в Firestore используя новый сервис
 * @param character Данные персонажа
 */
export const saveCharacterToFirestore = async (character: Character) => {
  try {
    const savedCharacter = await characterService.saveCharacter(character);
    return !!savedCharacter;
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    return false;
  }
};

/**
 * Получение всех персонажей пользователя используя новый сервис
 * @returns Массив персонажей
 */
export const getUserCharacters = async () => {
  try {
    return await characterService.getCharacters();
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    return [];
  }
};

/**
 * Получение персонажа по ID используя новый сервис
 * @param characterId ID персонажа
 */
export const getCharacterById = async (characterId: string) => {
  try {
    return await characterService.getCharacterById(characterId);
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    return null;
  }
};

/**
 * Удаление персонажа используя новый сервис
 * @param characterId ID персонажа
 */
export const deleteCharacterFromFirestore = async (characterId: string) => {
  try {
    return await characterService.deleteCharacter(characterId);
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    return false;
  }
};

/**
 * Очистка всех персонажей пользователя используя новый сервис
 * @returns Успешность операции
 */
export const clearAllUserCharacters = async () => {
  try {
    return await characterService.clearAllCharacters();
  } catch (error) {
    console.error('Ошибка при удалении всех персонажей:', error);
    return false;
  }
};
