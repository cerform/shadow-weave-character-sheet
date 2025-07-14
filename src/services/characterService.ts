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

// Коллекция персонажей в Firestore
const CHARACTERS_COLLECTION = 'characters';

// Получение всех персонажей пользователя
export const getUserCharacters = async (userId: string): Promise<Character[]> => {
  try {
    console.log('characterService: Загрузка персонажей для пользователя:', userId);
    
    const charactersRef = collection(db, CHARACTERS_COLLECTION);
    const q = query(
      charactersRef,
      where('userId', '==', userId)
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
      
      // Нормализуем характеристики при загрузке
      const normalizedCharacter = normalizeCharacterAbilities(character);
      console.log('characterService: Персонаж загружен и нормализован:', normalizedCharacter.name);
      return normalizedCharacter;
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
    // Нормализуем характеристики перед сохранением
    const normalizedCharacter = normalizeCharacterAbilities(character);
    
    // Генерируем ID если его нет
    if (!normalizedCharacter.id) {
      normalizedCharacter.id = `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Добавляем userId если его нет
    if (!normalizedCharacter.userId) {
      normalizedCharacter.userId = getCurrentUid();
    }
    
    // Обновляем временные метки
    const now = new Date().toISOString();
    if (!normalizedCharacter.createdAt) {
      normalizedCharacter.createdAt = now;
    }
    normalizedCharacter.updatedAt = now;
    
    // Сохраняем в localStorage как резервную копию
    localStorage.setItem(`character_${normalizedCharacter.id}`, JSON.stringify(normalizedCharacter));
    
    console.log('characterService: Персонаж нормализован и сохранен локально:', normalizedCharacter);
    return normalizedCharacter;
  } catch (error) {
    console.error('characterService: Ошибка сохранения персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

// Сохранение персонажа в Firestore с retry механизмом
export const saveCharacterToFirestore = async (character: Character, retryCount = 3): Promise<Character> => {
  const attempt = async (attemptNumber: number): Promise<Character> => {
    try {
      console.log(`characterService: Сохранение персонажа в Firestore (попытка ${attemptNumber}):`, character.name);
      
      // Нормализуем характеристики перед сохранением
      const normalizedCharacter = normalizeCharacterAbilities(character);
      
      // Подготавливаем данные для сохранения
      const characterData = {
        ...normalizedCharacter,
        userId: normalizedCharacter.userId || getCurrentUid(),
        updatedAt: new Date().toISOString(),
        createdAt: normalizedCharacter.createdAt || new Date().toISOString()
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
      
      // Сохраняем в localStorage как резервную копию
      localStorage.setItem(`character_${savedCharacter.id}`, JSON.stringify(savedCharacter));
      
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
        throw new Error('Не удалось сохранить персонажа в базу данных, сохранено локально');
      }
    }
  };
  
  return attempt(1);
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
