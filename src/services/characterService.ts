
import { collection, doc, getDocs, getDoc, addDoc, setDoc, deleteDoc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Character } from "@/contexts/CharacterContext";
import { getCurrentUid } from "@/utils/authHelpers";
import { toast } from "sonner";

// Коллекция персонажей в Firestore
const charactersCollection = collection(db, "characters");

/**
 * Сервис для работы с персонажами в Firestore
 */
export const characterService = {
  /**
   * Получение всех персонажей текущего пользователя
   * @returns Список персонажей
   */
  async getCharacters(): Promise<Character[]> {
    try {
      const uid = getCurrentUid();
      
      if (!uid) {
        console.info("Пользователь не авторизован, загружаем локальных персонажей");
        // Возвращаем персонажей из локального хранилища
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          return JSON.parse(savedCharacters);
        }
        return [];
      }
      
      // Запрашиваем персонажей у которых userId = текущему пользователю
      const q = query(charactersCollection, where("userId", "==", uid));
      const snapshot = await getDocs(q);
      
      const characters = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Character));
      
      console.log(`Загружено ${characters.length} персонажей из Firestore`);
      
      // Если персонажей из Firestore нет, пробуем локальное хранилище
      if (characters.length === 0) {
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          return JSON.parse(savedCharacters);
        }
      }
      
      return characters;
    } catch (error) {
      console.error("Ошибка при получении персонажей:", error);
      
      // Пробуем взять из localStorage при ошибке
      try {
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          console.log("Используем локальных персонажей из-за ошибки Firestore");
          return JSON.parse(savedCharacters);
        }
      } catch (_) {}
      
      toast.error("Не удалось загрузить персонажей");
      return [];
    }
  },

  /**
   * Сохранение персонажа в Firestore
   * @param char Данные персонажа
   * @returns true при успешном сохранении, иначе false
   */
  async saveCharacter(char: Character): Promise<boolean> {
    try {
      const uid = getCurrentUid();
      
      // Устанавливаем или обновляем userId персонажа
      const characterData = {
        ...char,
        userId: uid || char.userId,
        updatedAt: new Date().toISOString()
      };
      
      // Если не авторизован, сохраняем только локально
      if (!uid) {
        console.warn("Пользователь не авторизован, сохраняем персонажа только локально");
        
        // Сохраняем в localStorage
        const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
        const characters = JSON.parse(savedCharacters);
        
        if (characterData.id) {
          // Обновляем существующего персонажа
          const index = characters.findIndex((c: Character) => c.id === characterData.id);
          if (index !== -1) {
            characters[index] = characterData;
          } else {
            characters.push(characterData);
          }
        } else {
          // Создаем нового персонажа с уникальным ID
          characterData.id = crypto.randomUUID();
          characterData.createdAt = new Date().toISOString();
          characters.push(characterData);
        }
        
        localStorage.setItem('dnd-characters', JSON.stringify(characters));
        return true;
      }
      
      // Если у персонажа уже есть ID, обновляем его
      if (characterData.id) {
        const docRef = doc(db, "characters", characterData.id);
        await setDoc(docRef, characterData, { merge: true });
        console.log(`Персонаж ${characterData.name} обновлен в Firestore`);
        
        // Также обновляем в локальном хранилище
        this.updateLocalCharacter(characterData);
        
        return true;
      } 
      // Иначе создаем нового персонажа
      else {
        // Добавляем дату создания
        characterData.createdAt = new Date().toISOString();
        
        const docRef = await addDoc(charactersCollection, characterData);
        const newCharacter = { 
          ...characterData, 
          id: docRef.id 
        };
        
        console.log(`Персонаж ${newCharacter.name} создан в Firestore`);
        
        // Также добавляем в локальное хранилище
        this.updateLocalCharacter(newCharacter);
        
        return true;
      }
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      
      // Пытаемся сохранить локально при ошибке
      try {
        this.updateLocalCharacter(char);
        console.log("Персонаж сохранен только локально из-за ошибки Firestore");
        return true;
      } catch (localError) {
        console.error("Не удалось сохранить персонажа даже локально:", localError);
      }
      
      toast.error("Не удалось сохранить персонажа");
      return false;
    }
  },

  /**
   * Получение персонажа по ID
   * @param id ID персонажа
   * @returns Персонаж или null, если не найден
   */
  async getCharacterById(id: string): Promise<Character | null> {
    try {
      // Проверяем в Firestore
      const docRef = doc(db, "characters", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Character;
      }
      
      // Если не найден в Firestore, проверяем localStorage
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (savedCharacters) {
        const characters = JSON.parse(savedCharacters);
        const localChar = characters.find((c: Character) => c.id === id);
        if (localChar) {
          return localChar;
        }
      }
      
      console.log(`Персонаж с ID ${id} не найден`);
      return null;
    } catch (error) {
      console.error("Ошибка при получении персонажа:", error);
      
      // Пытаемся найти в localStorage при ошибке
      try {
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          const characters = JSON.parse(savedCharacters);
          const localChar = characters.find((c: Character) => c.id === id);
          if (localChar) {
            return localChar;
          }
        }
      } catch (_) {}
      
      toast.error("Не удалось загрузить персонажа");
      return null;
    }
  },

  /**
   * Удаление персонажа
   * @param id ID персонажа
   * @returns true при успешном удалении, иначе false
   */
  async deleteCharacter(id: string): Promise<boolean> {
    try {
      // Удаляем из localStorage
      this.removeLocalCharacter(id);
      
      const uid = getCurrentUid();
      if (!uid) {
        console.warn("Пользователь не авторизован, персонаж удален только локально");
        return true;
      }
      
      // Удаляем из Firestore
      await deleteDoc(doc(db, "characters", id));
      console.log(`Персонаж с ID ${id} удален из Firestore`);
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      
      // Удаляем только из localStorage при ошибке
      try {
        this.removeLocalCharacter(id);
        console.log(`Персонаж с ID ${id} удален только локально из-за ошибки Firestore`);
        return true;
      } catch (localError) {
        console.error("Не удалось удалить персонажа даже локально:", localError);
      }
      
      toast.error("Не удалось удалить персонажа");
      return false;
    }
  },
  
  /**
   * Обновление персонажа в локальном хранилище
   */
  updateLocalCharacter(character: Character): void {
    if (!character.id) return;
    
    try {
      const savedCharacters = localStorage.getItem('dnd-characters') || '[]';
      const characters = JSON.parse(savedCharacters);
      
      const index = characters.findIndex((c: Character) => c.id === character.id);
      if (index !== -1) {
        characters[index] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
    } catch (error) {
      console.error("Ошибка при обновлении локального персонажа:", error);
    }
  },
  
  /**
   * Удаление персонажа из локального хранилища
   */
  removeLocalCharacter(id: string): void {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (savedCharacters) {
        const characters = JSON.parse(savedCharacters);
        const filtered = characters.filter((c: Character) => c.id !== id);
        localStorage.setItem('dnd-characters', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error("Ошибка при удалении локального персонажа:", error);
    }
  },
  
  /**
   * Очистка всех персонажей пользователя
   */
  async clearAllCharacters(): Promise<boolean> {
    try {
      // Очистка localStorage
      localStorage.setItem('dnd-characters', '[]');
      
      const uid = getCurrentUid();
      if (!uid) {
        console.warn("Пользователь не авторизован, персонажи очищены только локально");
        return true;
      }
      
      // Получаем всех персонажей пользователя из Firestore
      const q = query(charactersCollection, where("userId", "==", uid));
      const snapshot = await getDocs(q);
      
      // Удаляем каждого персонажа
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      console.log(`Удалено ${snapshot.docs.length} персонажей из Firestore`);
      
      return true;
    } catch (error) {
      console.error("Ошибка при удалении всех персонажей:", error);
      toast.error("Не удалось удалить всех персонажей");
      return false;
    }
  }
};

/**
 * Метод для экспорта сервиса
 */
export default characterService;
