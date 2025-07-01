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
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';

// Коллекция персонажей в Firestore
const CHARACTERS_COLLECTION = 'characters';

// Получение всех персонажей пользователя
export const getUserCharacters = async (userId: string): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка персонажей для пользователя:', userId);
    
    const charactersRef = collection(db, CHARACTERS_COLLECTION);
    const q = query(
      charactersRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const characters: Character[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Character;
      characters.push({
        ...data,
        id: doc.id
      });
    });
    
    console.log('characterService: Загружено персонажей:', characters.length);
    return characters;
  } catch (error) {
    console.error('characterService: Ошибка получения персонажей:', error);
    throw new Error('Не удалось загрузить персонажей');
  }
};

// Алиас для обратной совместимости
export const getCharactersByUserId = getUserCharacters;

// Получение персонажа по ID
export const getCharacterById = async (characterId: string): Promise<Character | null> => {
  try {
    console.log('characterService: Загрузка персонажа по ID:', characterId);
    
    const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
    const characterSnapshot = await getDoc(characterRef);
    
    if (characterSnapshot.exists()) {
      const data = characterSnapshot.data() as Character;
      const character = {
        ...data,
        id: characterSnapshot.id
      };
      console.log('characterService: Персонаж загружен:', character.name);
      return character;
    } else {
      console.log('characterService: Персонаж не найден');
      return null;
    }
  } catch (error) {
    console.error('characterService: Ошибка получения персонажа:', error);
    throw new Error('Не удалось загрузить персонажа');
  }
};

// Сохранение персонажа (локально с ID)
export const saveCharacter = (character: Character): Character => {
  try {
    // Генерируем ID если его нет
    if (!character.id) {
      character.id = `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Добавляем userId если его нет
    if (!character.userId) {
      character.userId = getCurrentUid();
    }
    
    // Обновляем временные метки
    const now = new Date().toISOString();
    if (!character.createdAt) {
      character.createdAt = now;
    }
    character.updatedAt = now;
    
    // Сохраняем в localStorage как резервную копию
    localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
    
    return character;
  } catch (error) {
    console.error('characterService: Ошибка сохранения персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

// Сохранение персонажа в Firestore
export const saveCharacterToFirestore = async (character: Character): Promise<Character> => {
  try {
    console.log('characterService: Сохранение персонажа в Firestore:', character.name);
    
    // Подготавливаем данные для сохранения
    const characterData = {
      ...character,
      userId: character.userId || getCurrentUid(),
      updatedAt: new Date().toISOString(),
      createdAt: character.createdAt || new Date().toISOString()
    };
    
    let docRef;
    if (character.id) {
      // Обновляем существующего персонажа
      docRef = doc(db, CHARACTERS_COLLECTION, character.id);
      await setDoc(docRef, characterData, { merge: true });
    } else {
      // Создаем нового персонажа
      docRef = doc(collection(db, CHARACTERS_COLLECTION));
      await setDoc(docRef, characterData);
    }
    
    const savedCharacter = {
      ...characterData,
      id: docRef.id
    };
    
    console.log('characterService: Персонаж сохранен в Firestore:', savedCharacter.id);
    return savedCharacter;
  } catch (error) {
    console.error('characterService: Ошибка сохранения в Firestore:', error);
    throw new Error('Не удалось сохранить персонажа в базу данных');
  }
};

// Удаление персонажа
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    console.log('characterService: Удаление персонажа:', characterId);
    
    const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
    await deleteDoc(characterRef);
    
    // Удаляем из localStorage
    localStorage.removeItem(`character_${characterId}`);
    
    console.log('characterService: Персонаж удален');
  } catch (error) {
    console.error('characterService: Ошибка удаления персонажа:', error);
    throw new Error('Не удалось удалить персонажа');
  }
};

// Получение резервных копий из localStorage
export const getAllBackups = (): Array<{ id: string; character: Character; timestamp: string }> => {
  const backups: Array<{ id: string; character: Character; timestamp: string }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('character_backup_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '');
        if (data.character) {
          backups.push({
            id: key.replace('character_backup_', ''),
            character: data.character,
            timestamp: data.timestamp
          });
        }
      } catch (error) {
        console.warn('Ошибка чтения резервной копии:', key, error);
      }
    }
  }
  
  return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Восстановление из резервной копии
export const restoreFromBackup = (backupId: string): Character | null => {
  try {
    const key = `character_backup_${backupId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const backup = JSON.parse(data);
      return backup.character;
    }
    return null;
  } catch (error) {
    console.error('Ошибка восстановления из резервной копии:', error);
    return null;
  }
};
