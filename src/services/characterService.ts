
import { CharacterSheet } from '../types/character';
import { auth } from './firebase';
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { firestore } from './firebase';

class CharacterService {
  async getCharactersByUserId(): Promise<CharacterSheet[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Пользователь не авторизован");

      const charactersRef = collection(firestore, "characters");
      const q = query(charactersRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const characters: CharacterSheet[] = [];
      querySnapshot.forEach((doc) => {
        characters.push({ id: doc.id, ...doc.data() } as CharacterSheet);
      });
      
      return characters;
    } catch (error) {
      console.error("Ошибка при получении персонажей:", error);
      return [];
    }
  }

  async getCharacterById(characterId: string): Promise<CharacterSheet | null> {
    try {
      const characterDoc = await getDoc(doc(firestore, "characters", characterId));
      if (characterDoc.exists()) {
        return { id: characterDoc.id, ...characterDoc.data() } as CharacterSheet;
      }
      return null;
    } catch (error) {
      console.error("Ошибка при получении персонажа:", error);
      return null;
    }
  }

  async saveCharacter(character: CharacterSheet): Promise<CharacterSheet | null> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Пользователь не авторизован");

      const characterId = character.id || uuidv4();
      const characterData = {
        ...character,
        userId: user.uid,
        id: characterId,
        updatedAt: new Date().toISOString(),
        createdAt: character.createdAt || new Date().toISOString()
      };

      await setDoc(doc(firestore, "characters", characterId), characterData);
      
      return characterData;
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      return null;
    }
  }

  async deleteCharacter(characterId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Пользователь не авторизован");

      // Проверка, принадлежит ли персонаж пользователю
      const characterDoc = await getDoc(doc(firestore, "characters", characterId));
      if (characterDoc.exists() && characterDoc.data().userId === user.uid) {
        await deleteDoc(doc(firestore, "characters", characterId));
      } else {
        throw new Error("У вас нет прав на удаление этого персонажа");
      }
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      throw error;
    }
  }
}

export default new CharacterService();
