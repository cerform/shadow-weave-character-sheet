
import { CharacterSheet } from '@/types/character';
import { db, auth } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Получение коллекции персонажей
const getCharactersCollection = () => {
  return collection(db, 'characters');
};

// Сохранение персонажа в Firestore
const saveCharacter = async (character: CharacterSheet) => {
  try {
    // Получаем текущего пользователя
    const user = auth.currentUser;
    if (!user && !character.userId) {
      console.log('Сохранение без авторизации, только в локальном хранилище');
      // Сохраняем только локально
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Генерируем ID, если его нет
      const characterId = character.id || uuidv4();
      character.id = characterId;
      
      // Если персонаж с таким ID уже существует, заменяем его
      const existingIndex = characters.findIndex((c: any) => c.id === characterId);
      
      if (existingIndex >= 0) {
        characters[existingIndex] = { ...character, updatedAt: new Date().toISOString() };
      } else {
        characters.push({ ...character, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      return character;
    }
    
    // Если есть авторизованный пользователь, сохраняем в Firestore
    if (character.id) {
      // Обновляем существующий документ
      const characterRef = doc(db, 'characters', character.id);
      await updateDoc(characterRef, { ...character, updatedAt: new Date().toISOString() });
      return character;
    } else {
      // Создаем новый документ
      const characterData = {
        ...character,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(getCharactersCollection(), characterData);
      return { ...characterData, id: docRef.id };
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    return null;
  }
};

// Получение персонажа по ID
const getCharacterById = async (id: string) => {
  try {
    // Проверяем локальное хранилище
    const savedCharacters = localStorage.getItem('dnd-characters');
    if (savedCharacters) {
      const characters = JSON.parse(savedCharacters);
      const localCharacter = characters.find((c: any) => c.id === id);
      if (localCharacter) {
        return localCharacter as CharacterSheet;
      }
    }
    
    // Если персонажа нет в локальном хранилище, проверяем Firestore
    const characterRef = doc(db, 'characters', id);
    const characterSnap = await getDoc(characterRef);
    
    if (characterSnap.exists()) {
      return { id: characterSnap.id, ...characterSnap.data() } as CharacterSheet;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении персонажа:', error);
    return null;
  }
};

// Получение всех персонажей текущего пользователя
const getCharacters = async () => {
  try {
    const user = auth.currentUser;
    let characters: CharacterSheet[] = [];
    
    // Получаем персонажей из локального хранилища
    const savedCharacters = localStorage.getItem('dnd-characters');
    if (savedCharacters) {
      const localCharacters = JSON.parse(savedCharacters);
      characters = [...localCharacters];
    }
    
    // Если пользователь авторизован, получаем персонажей из Firestore
    if (user) {
      const q = query(getCharactersCollection(), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      // Объединяем с персонажами из Firestore, избегая дубликатов
      querySnapshot.forEach((doc) => {
        const firestoreCharacter = { id: doc.id, ...doc.data() } as CharacterSheet;
        
        // Проверяем, есть ли персонаж с таким ID уже в массиве
        const existingIndex = characters.findIndex(c => c.id === firestoreCharacter.id);
        if (existingIndex >= 0) {
          // Если есть, заменяем его
          characters[existingIndex] = firestoreCharacter;
        } else {
          // Если нет, добавляем новый
          characters.push(firestoreCharacter);
        }
      });
    }
    
    return characters;
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    return [];
  }
};

// Удаление персонажа
const deleteCharacter = async (id: string) => {
  try {
    // Удаляем из локального хранилища
    const savedCharacters = localStorage.getItem('dnd-characters');
    if (savedCharacters) {
      let characters = JSON.parse(savedCharacters);
      characters = characters.filter((c: any) => c.id !== id);
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
    }
    
    // Удаляем из Firestore, если пользователь авторизован
    const user = auth.currentUser;
    if (user) {
      const characterRef = doc(db, 'characters', id);
      await deleteDoc(characterRef);
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    return false;
  }
};

export default {
  getCharacters,
  getCharacterById,
  saveCharacter,
  deleteCharacter
};
