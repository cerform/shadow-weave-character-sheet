import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Character } from "@/types/character";

// Создание нового персонажа
export const saveCharacter = async (character: Character): Promise<Character> => {
  const charactersRef = collection(db, "characters");
  
  // Глубокая очистка от undefined значений
  const cleanedCharacter = cleanUndefinedValues(character);
  
  console.log('🔍 Очищенные данные персонажа перед сохранением:', cleanedCharacter);
  
  const docRef = await addDoc(charactersRef, cleanedCharacter);
  return { ...character, id: docRef.id };
};

// Обновление существующего персонажа
export const updateCharacter = async (character: Character): Promise<void> => {
  if (!character.id) throw new Error("У персонажа отсутствует ID");

  const docRef = doc(db, "characters", character.id);
  
  // Глубокая очистка от undefined значений и удаляем id из данных для обновления
  const { id, ...characterData } = character;
  const updateData = cleanUndefinedValues(characterData);
  
  await updateDoc(docRef, updateData);
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<void> => {
  const docRef = doc(db, "characters", id);
  await deleteDoc(docRef);
};

// Получение всех персонажей пользователя
export const getUserCharacters = async (userId: string): Promise<Character[]> => {
  const q = query(collection(db, "characters"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Character[];
};

// Получение персонажа по ID
export const getCharacterById = async (id: string): Promise<Character | null> => {
  const docRef = doc(db, "characters", id);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Character;
  }

  return null;
};

/**
 * Глубокая очистка объекта от undefined значений
 */
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item)).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        const cleanedValue = cleanUndefinedValues(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }

  return obj;
}
