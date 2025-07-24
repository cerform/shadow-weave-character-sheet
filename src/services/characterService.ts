import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase"; // берем firestore db
import { Character } from "@/types/character";

// 🔥 СОХРАНИТЬ персонажа
export const saveCharacter = async (character: Character) => {
  const docRef = await addDoc(collection(db, "characters"), character);
  return { ...character, id: docRef.id };
};

// 📥 ПОЛУЧИТЬ персонажа по ID
export const getCharacterById = async (id: string) => {
  const docRef = doc(db, "characters", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }

  return null;
};

// 📋 ВСЕ персонажи пользователя
export const getCharactersByUserId = async (userId: string) => {
  const q = query(
    collection(db, "characters"),
    where("userId", "==", userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✏️ ОБНОВИТЬ персонажа
export const updateCharacter = async (id: string, updates: Partial<Character>) => {
  const docRef = doc(db, "characters", id);
  await updateDoc(docRef, updates);
};
