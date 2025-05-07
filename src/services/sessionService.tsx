
import { db } from "@/firebase";
import { 
  collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, 
  serverTimestamp, Timestamp, arrayUnion, arrayRemove, deleteDoc 
} from "firebase/firestore";
import { getCharacter } from "@/services/characterService";
import { getCurrentUid } from "@/utils/authHelpers";
import { GameSession, SessionPlayer, TokenData, Initiative } from "@/types/session.types";
import { v4 as uuidv4 } from "uuid";
import { Character } from "@/types/character";

// Генерация уникального кода для сессии
export const generateSessionCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Создание новой сессии
export const createGameSession = async (
  name: string, 
  description?: string
): Promise<GameSession> => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      throw new Error("Пользователь не авторизован");
    }
    
    const sessionData = {
      name,
      description,
      dmId: uid,
      players: [],
      code: generateSessionCode(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      battleActive: false
    };
    
    const docRef = await addDoc(collection(db, "sessions"), sessionData);
    
    return {
      id: docRef.id,
      ...sessionData,
      players: []
    } as GameSession;
  } catch (error) {
    console.error("Ошибка при создании сессии:", error);
    throw error;
  }
};

// Получение всех сессий, где пользователь является DM
export const getDMSessions = async (): Promise<GameSession[]> => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      throw new Error("Пользователь не авторизован");
    }
    
    const q = query(collection(db, "sessions"), where("dmId", "==", uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GameSession[];
  } catch (error) {
    console.error("Ошибка при получении сессий DM:", error);
    throw error;
  }
};

// Получение всех сессий, где пользователь является игроком
export const getPlayerSessions = async (): Promise<GameSession[]> => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      throw new Error("Пользователь не авторизован");
    }
    
    const q = query(collection(db, "sessions"), where("players", "array-contains", { userId: uid }));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GameSession[];
  } catch (error) {
    console.error("Ошибка при получении сессий игрока:", error);
    throw error;
  }
};

// Получение сессии по ID
export const getSessionById = async (sessionId: string): Promise<GameSession | null> => {
  try {
    const docRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as GameSession;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Ошибка при получении сессии:", error);
    throw error;
  }
};

// Получение сессии по коду присоединения
export const getSessionByCode = async (code: string): Promise<GameSession | null> => {
  try {
    const q = query(collection(db, "sessions"), where("code", "==", code), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as GameSession;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Ошибка при получении сессии по коду:", error);
    throw error;
  }
};

// Присоединение к сессии как игрок
export const joinSession = async (
  sessionId: string, 
  characterId: string, 
  playerName?: string
): Promise<boolean> => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      throw new Error("Пользователь не авторизован");
    }
    
    // Получаем персонажа
    const character = await getCharacter(characterId);
    if (!character) {
      throw new Error("Персонаж не найден");
    }
    
    // Создаем данные игрока
    const playerData: SessionPlayer = {
      id: uuidv4(),
      userId: uid,
      characterId,
      name: playerName || character.name,
      isConnected: true,
      lastActivity: new Date().toISOString()
    };
    
    // Обновляем сессию
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      players: arrayUnion(playerData),
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Ошибка при присоединении к сессии:", error);
    throw error;
  }
};

// Добавление токена на карту
export const addToken = async (sessionId: string, token: TokenData): Promise<TokenData> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionData = await getDoc(sessionRef);
    
    if (!sessionData.exists()) {
      throw new Error("Сессия не найдена");
    }
    
    const tokenId = Date.now();
    const newToken = { ...token, id: tokenId };
    
    await updateDoc(sessionRef, {
      tokens: arrayUnion(newToken),
      updatedAt: Timestamp.now()
    });
    
    return newToken;
  } catch (error) {
    console.error("Ошибка при добавлении токена:", error);
    throw error;
  }
};

// Обновление токена
export const updateToken = async (sessionId: string, token: TokenData): Promise<boolean> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error("Сессия не найдена");
    }
    
    const sessionData = sessionSnap.data();
    let tokens = sessionData.tokens || [];
    
    // Находим и обновляем токен
    tokens = tokens.map((t: TokenData) => t.id === token.id ? token : t);
    
    // Обновляем список токенов
    await updateDoc(sessionRef, {
      tokens,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error);
    throw error;
  }
};

// Удаление токена
export const removeToken = async (sessionId: string, tokenId: string | number): Promise<boolean> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error("Сессия не найдена");
    }
    
    const sessionData = sessionSnap.data();
    let tokens = sessionData.tokens || [];
    
    // Фильтруем токены
    tokens = tokens.filter((t: TokenData) => t.id !== tokenId);
    
    // Обновляем список токенов
    await updateDoc(sessionRef, {
      tokens,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Ошибка при удалении токена:", error);
    throw error;
  }
};

// Обновление инициативы
export const updateInitiative = async (sessionId: string, initiative: Initiative[]): Promise<boolean> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    
    await updateDoc(sessionRef, {
      initiative,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Ошибка при обновлении инициативы:", error);
    throw error;
  }
};

// Завершение сессии
export const endSession = async (sessionId: string): Promise<boolean> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    
    await updateDoc(sessionRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Ошибка при завершении сессии:", error);
    throw error;
  }
};

// Получение токенов сессии
export const getSessionTokens = async (sessionId: string): Promise<TokenData[]> => {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error("Сессия не найдена");
    }
    
    const sessionData = sessionSnap.data();
    return sessionData.tokens || [];
  } catch (error) {
    console.error("Ошибка при получении токенов:", error);
    throw error;
  }
};

// Обновление характеристик персонажа в сессии
export const updateSessionCharacter = async (
  sessionId: string, 
  characterId: string, 
  updates: Partial<Character>
): Promise<boolean> => {
  try {
    // Сначала обновляем персонажа в базе данных
    const characterRef = doc(db, "characters", characterId);
    await updateDoc(characterRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    // Затем обновляем токен персонажа в сессии, если есть
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      let tokens = sessionData.tokens || [];
      
      // Проверяем, есть ли токен для этого персонажа
      const tokenIndex = tokens.findIndex((t: TokenData) => t.characterId === characterId);
      
      if (tokenIndex !== -1) {
        const token = tokens[tokenIndex];
        
        // Обновляем токен с новыми данными персонажа
        tokens[tokenIndex] = {
          ...token,
          name: updates.name || token.name,
          hp: updates.currentHp || token.hp,
          maxHp: updates.maxHp || token.maxHp
        };
        
        // Обновляем сессию
        await updateDoc(sessionRef, {
          tokens,
          updatedAt: Timestamp.now()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error("Ошибка при обновлении персонажа в сессии:", error);
    throw error;
  }
};
