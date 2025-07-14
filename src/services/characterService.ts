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
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';
import { LocalCharacterStore } from './characterStorage';

// Коллекция персонажей в Firestore
const CHARACTERS_COLLECTION = 'characters';

// Получение всех персонажей пользователя
export const getUserCharacters = async (userId?: string): Promise<Character[]> => {
  try {
    const uid = userId || getCurrentUid();
    console.log('characterService: Загрузка персонажей для пользователя:', uid);
    
    // Если нет userId, работаем только с localStorage
    if (!uid) {
      console.log('characterService: Пользователь не авторизован, используем localStorage');
      const localCharacters = LocalCharacterStore.getAll();
      console.log('characterService: Загружено из localStorage:', localCharacters.length, 'персонажей');
      return localCharacters;
    }
    
    console.log('characterService: Пытаемся загрузить из Firestore для пользователя:', uid);
    
    try {
      // Сначала пытаемся загрузить из Firestore
      const charactersRef = collection(db, CHARACTERS_COLLECTION);
      const q = query(
        charactersRef,
        where('userId', '==', uid)
      );
      
      const querySnapshot = await getDocs(q);
      const characters: Character[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Character;
        const normalizedCharacter = normalizeCharacterAbilities({
          ...data,
          id: doc.id
        });
        characters.push(normalizedCharacter);
      });
      
      console.log('characterService: Загружено персонажей из Firestore:', characters.length);
      
      // Синхронизируем с localStorage (сохраняем как резервные копии)
      characters.forEach(character => {
        try {
          localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
        } catch (e) {
          console.warn('characterService: Не удалось сохранить резервную копию:', character.id);
        }
      });
      
      return characters;
    } catch (firestoreError) {
      console.warn('characterService: Ошибка загрузки из Firestore, используем localStorage:', firestoreError);
      
      // Fallback на localStorage
      return LocalCharacterStore.getAll(uid);
    }
  } catch (error) {
    console.error('characterService: Ошибка получения персонажей:', error);
    // В крайнем случае возвращаем данные из localStorage без фильтрации по userId
    return LocalCharacterStore.getAll();
  }
};

// Алиас для обратной совместимости
export const getCharactersByUserId = getUserCharacters;

// Получение персонажа по ID
export const getCharacterById = async (characterId: string): Promise<Character | null> => {
  try {
    console.log('characterService: Загрузка персонажа по ID:', characterId);
    
    try {
      // Сначала пытаемся загрузить из Firestore
      const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
      const characterSnapshot = await getDoc(characterRef);
      
      if (characterSnapshot.exists()) {
        const data = characterSnapshot.data() as Character;
        const character = normalizeCharacterAbilities({
          ...data,
          id: characterSnapshot.id
        });
        
        // Сохраняем в localStorage как резервную копию
        localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
        
        console.log('characterService: Персонаж загружен из Firestore:', character.name);
        return character;
      }
    } catch (firestoreError) {
      console.warn('characterService: Ошибка загрузки из Firestore, проверяем localStorage:', firestoreError);
    }
    
    // Fallback на localStorage
    const character = LocalCharacterStore.getById(characterId);
    if (character) {
      console.log('characterService: Персонаж загружен из localStorage:', character.name);
      return character;
    }
    
    console.log('characterService: Персонаж не найден ни в Firestore, ни в localStorage');
    return null;
  } catch (error) {
    console.error('characterService: Ошибка получения персонажа:', error);
    // Пытаемся загрузить из localStorage в качестве последней попытки
    return LocalCharacterStore.getById(characterId);
  }
};

// Сохранение персонажа (локально с автоматическим определением пользователя)
export const saveCharacter = (character: Character): Character => {
  try {
    // Добавляем userId если его нет
    if (!character.userId) {
      character.userId = getCurrentUid();
    }
    
    // Сохраняем в localStorage с помощью централизованного хранилища
    const savedCharacter = LocalCharacterStore.save(character);
    
    console.log('characterService: Персонаж сохранен локально:', savedCharacter.name);
    return savedCharacter;
  } catch (error) {
    console.error('characterService: Ошибка сохранения персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

// Сохранение персонажа в Firestore с fallback на localStorage
export const saveCharacterToFirestore = async (character: Character, retryCount = 3): Promise<Character> => {
  const uid = getCurrentUid();
  
  // Если пользователь не авторизован, сохраняем только локально
  if (!uid) {
    console.warn('characterService: Пользователь не авторизован, сохраняем только в localStorage');
    return saveCharacter(character);
  }

  const attempt = async (attemptNumber: number): Promise<Character> => {
    try {
      console.log(`characterService: Сохранение персонажа в Firestore (попытка ${attemptNumber}):`, character.name);
      
      // Нормализуем характеристики перед сохранением
      const normalizedCharacter = normalizeCharacterAbilities(character);
      
      // Подготавливаем данные для сохранения
      const characterData = {
        ...normalizedCharacter,
        userId: uid,
        updatedAt: new Date().toISOString(),
        createdAt: normalizedCharacter.createdAt || new Date().toISOString()
      };
      
      let docRef;
      if (character.id && character.id.startsWith('character_')) {
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
      
      // Сохраняем в localStorage как резервную копию
      LocalCharacterStore.save(savedCharacter);
      
      console.log('characterService: Персонаж сохранен в Firestore:', savedCharacter.id);
      return savedCharacter;
    } catch (error) {
      console.error(`characterService: Ошибка сохранения в Firestore (попытка ${attemptNumber}):`, error);
      
      if (attemptNumber < retryCount) {
        // Ждем перед повторной попыткой (exponential backoff)
        const delay = Math.pow(2, attemptNumber - 1) * 1000;
        console.log(`characterService: Повторная попытка через ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return attempt(attemptNumber + 1);
      } else {
        // Если все попытки неудачны, сохраняем локально
        const localCharacter = saveCharacter(character);
        console.warn('characterService: Сохранение в Firestore не удалось, сохранено локально');
        return localCharacter;
      }
    }
  };
  
  return attempt(1);
};

// Удаление персонажа
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    console.log('characterService: Удаление персонажа:', characterId);
    
    const uid = getCurrentUid();
    
    // Пытаемся удалить из Firestore только если пользователь авторизован
    if (uid) {
      try {
        const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
        await deleteDoc(characterRef);
        console.log('characterService: Персонаж удален из Firestore');
      } catch (firestoreError) {
        console.warn('characterService: Ошибка удаления из Firestore:', firestoreError);
      }
    }
    
    // Удаляем из localStorage в любом случае
    LocalCharacterStore.delete(characterId);
    
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
