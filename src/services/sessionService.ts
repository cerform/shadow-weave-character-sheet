
import { db } from "@/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getCharacter } from "@/services/characterService";
import { getCurrentUid } from "@/utils/authHelpers";

// Пример метода для получения сессий пользователя
export const getUserSessions = async () => {
  try {
    const uid = getCurrentUid();
    if (!uid) {
      throw new Error("Пользователь не авторизован");
    }
    
    const q = query(collection(db, "sessions"), where("participants", "array-contains", uid));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Ошибка при получении сессий:", error);
    throw error;
  }
};

// Пример метода для получения сессии по ID
export const getSessionById = async (sessionId: string) => {
  try {
    const docRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Ошибка при получении сессии:", error);
    throw error;
  }
};

// Пример метода для получения персонажа для сессии
export const getCharacterForSession = async (characterId: string) => {
  try {
    return await getCharacter(characterId);
  } catch (error) {
    console.error("Ошибка при получении персонажа для сессии:", error);
    throw error;
  }
};
