
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { CharacterSheet } from '@/utils/characterImports';

// Function to add or update a character in Firestore with защитой от undefined
export const setCharacter = async (character: CharacterSheet) => {
  try {
    // Копируем объект для обработки
    const processedCharacter = { ...character };
    
    // Рекурсивно удаляем все undefined значения
    const cleanObject = (obj: any): any => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === undefined) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanObject(obj[key]);
        }
      });
      return obj;
    };
    
    // Очищаем character от undefined значений
    const cleanedCharacter = cleanObject(processedCharacter);
    
    const charRef = doc(db, "characters", cleanedCharacter.id || "");
    await setDoc(charRef, cleanedCharacter, { merge: true });
    console.log("Character saved/updated successfully!");
  } catch (error) {
    console.error("Error saving/updating character:", error);
    throw error;
  }
};

// Function to retrieve a character from Firestore by ID
export const getCharacter = async (characterId: string): Promise<CharacterSheet | null> => {
  try {
    const charRef = doc(db, "characters", characterId);
    const docSnap = await getDoc(charRef);

    if (docSnap.exists()) {
      return docSnap.data() as CharacterSheet;
    } else {
      console.log("No such character!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching character:", error);
    throw error;
  }
};

// Function to retrieve all characters for a given user ID
export const getAllCharacters = async (userId: string): Promise<CharacterSheet[]> => {
  try {
    const charactersCollection = collection(db, "characters");
    const q = query(charactersCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const characters: CharacterSheet[] = [];

    querySnapshot.forEach((doc) => {
      characters.push(doc.data() as CharacterSheet);
    });

    return characters;
  } catch (error) {
    console.error("Error fetching all characters:", error);
    throw error;
  }
};

// Function to update a character's data in Firestore
export const updateCharacter = async (characterId: string, updates: Partial<CharacterSheet>) => {
  try {
    const charRef = doc(db, "characters", characterId);
    await updateDoc(charRef, updates);
    console.log("Character updated successfully!");
  } catch (error) {
    console.error("Error updating character:", error);
    throw error;
  }
};

// Function to delete a character from Firestore
export const deleteCharacter = async (characterId: string) => {
  try {
    const charRef = doc(db, "characters", characterId);
    await deleteDoc(charRef);
    console.log("Character deleted successfully!");
  } catch (error) {
    console.error("Error deleting character:", error);
    throw error;
  }
};
