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
  const docRef = await addDoc(charactersRef, character);
  return { ...character, id: docRef.id };
};

// Обновление существующего персонажа
export const updateCharacter = async (character: Character): Promise<void> => {
  if (!character.id) throw new Error("У персонажа отсутствует ID");

  const docRef = doc(db, "characters", character.id);
  await updateDoc(docRef, character);
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
