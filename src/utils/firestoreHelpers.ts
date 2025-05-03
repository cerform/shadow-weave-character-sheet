
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
 * Получение документа пользователя по UID
 * @param uid ID пользователя
 * @returns Данные пользователя или null
 */
export const getUserData = async (uid: string): Promise<FirestoreUserData | null> => {
  try {
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
    const uid = getCurrentUid();
    if (!uid) {
      console.error('Пользователь не авторизован');
      return false;
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
    return false;
  }
};

/**
 * Получение персонажа по ID
 * @param characterId ID персонажа
 */
export const getCharacterById = async (characterId: string) => {
  try {
    const characterRef = doc(db, 'characters', characterId);
    const characterSnap = await getDoc(characterRef);
    
    if (characterSnap.exists()) {
      return { id: characterSnap.id, ...characterSnap.data() } as Character;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    return null;
  }
};

/**
 * Получение всех персонажей пользователя
 * @returns Массив персонажей
 */
export const getUserCharacters = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.error('Пользователь не авторизован');
      return [];
    }
    
    console.log("Загрузка персонажей пользователя:", uid);
    
    // Получаем персонажей, где userId соответствует текущему пользователю
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where('userId', '==', uid));
    const querySnapshot = await getDocs(q);
    
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      console.log("Загружен персонаж:", doc.id);
      characters.push({ id: doc.id, ...doc.data() } as Character);
    });
    
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    return [];
  }
};

/**
 * Удаление персонажа
 * @param characterId ID персонажа
 */
export const deleteCharacterFromFirestore = async (characterId: string) => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.error('Пользователь не авторизован');
      return false;
    }
    
    // Получаем персонажа для проверки владельца
    const characterRef = doc(db, 'characters', characterId);
    const characterSnap = await getDoc(characterRef);
    
    if (!characterSnap.exists()) {
      return false;
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
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    return false;
  }
};

/**
 * Очистка всех персонажей пользователя
 * @returns Успешность операции
 */
export const clearAllUserCharacters = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      console.error('Пользователь не авторизован');
      return false;
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
    return false;
  }
};
