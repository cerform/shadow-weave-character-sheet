import { 
  ref, 
  get, 
  set, 
  push, 
  remove,
  query,
  orderByChild,
  equalTo,
  DataSnapshot
} from 'firebase/database';
import { db } from '@/lib/firebase';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';
import { LocalCharacterStore } from './characterStorage';

// Базовый путь для персонажей в Realtime Database
const CHARACTERS_PATH = 'characters';

// Генерация уникального ID для персонажа
const generateCharacterId = () => `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    
    console.log('characterService: Загружаем из Realtime Database для пользователя:', uid);
    
    try {
      // Получаем всех персонажей и фильтруем по userId
      const charactersRef = ref(db, CHARACTERS_PATH);
      const snapshot = await get(charactersRef);
      
      const characters: Character[] = [];
      
      if (snapshot.exists()) {
        const charactersData = snapshot.val();
        
        // Фильтруем персонажей по userId
        Object.keys(charactersData).forEach((characterId) => {
          const characterData = charactersData[characterId];
          if (characterData.userId === uid) {
            const normalizedCharacter = normalizeCharacterAbilities({
              ...characterData,
              id: characterId
            });
            characters.push(normalizedCharacter);
          }
        });
        
        // Сортируем по дате обновления (новые сначала)
        characters.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      }
      
      console.log('characterService: Загружено персонажей из Realtime Database:', characters.length);
      
      // Синхронизируем с localStorage (сохраняем как резервные копии)
      characters.forEach(character => {
        try {
          localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
        } catch (e) {
          console.warn('characterService: Не удалось сохранить резервную копию:', character.id);
        }
      });
      
      return characters;
    } catch (databaseError) {
      console.warn('characterService: Ошибка загрузки из Realtime Database, используем localStorage:', databaseError);
      
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
      // Сначала пытаемся загрузить из Realtime Database
      const characterRef = ref(db, `${CHARACTERS_PATH}/${characterId}`);
      const snapshot = await get(characterRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const character = normalizeCharacterAbilities({
          ...data,
          id: characterId
        });
        
        // Сохраняем в localStorage как резервную копию
        localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
        
        console.log('characterService: Персонаж загружен из Realtime Database:', character.name);
        return character;
      }
    } catch (databaseError) {
      console.warn('characterService: Ошибка загрузки из Realtime Database, проверяем localStorage:', databaseError);
    }
    
    // Fallback на localStorage
    const character = LocalCharacterStore.getById(characterId);
    if (character) {
      console.log('characterService: Персонаж загружен из localStorage:', character.name);
      return character;
    }
    
    console.log('characterService: Персонаж не найден ни в Realtime Database, ни в localStorage');
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

// Сохранение персонажа в Realtime Database с fallback на localStorage
export const saveCharacterToDatabase = async (character: Character, retryCount = 3): Promise<Character> => {
  const uid = getCurrentUid();
  
  // Если пользователь не авторизован, сохраняем только локально
  if (!uid) {
    console.warn('characterService: Пользователь не авторизован, сохраняем только в localStorage');
    return saveCharacter(character);
  }

  const attempt = async (attemptNumber: number): Promise<Character> => {
    try {
      console.log(`characterService: Сохранение персонажа в Realtime Database (попытка ${attemptNumber}):`, character.name);
      
      // Нормализуем характеристики перед сохранением
      const normalizedCharacter = normalizeCharacterAbilities(character);
      
      // Подготавливаем данные для сохранения
      const characterData = {
        ...normalizedCharacter,
        userId: uid,
        updatedAt: new Date().toISOString(),
        createdAt: normalizedCharacter.createdAt || new Date().toISOString()
      };
      
      let characterId = character.id;
      
      if (!characterId || !characterId.startsWith('character_')) {
        // Создаем нового персонажа с новым ID
        characterId = generateCharacterId();
      }
      
      // Сохраняем в Realtime Database
      const characterRef = ref(db, `${CHARACTERS_PATH}/${characterId}`);
      await set(characterRef, characterData);
      
      const savedCharacter = {
        ...characterData,
        id: characterId
      };
      
      // Сохраняем в localStorage как резервную копию
      LocalCharacterStore.save(savedCharacter);
      
      console.log('characterService: Персонаж сохранен в Realtime Database:', savedCharacter.id);
      return savedCharacter;
    } catch (error) {
      console.error(`characterService: Ошибка сохранения в Realtime Database (попытка ${attemptNumber}):`, error);
      
      if (attemptNumber < retryCount) {
        // Ждем перед повторной попыткой (exponential backoff)
        const delay = Math.pow(2, attemptNumber - 1) * 1000;
        console.log(`characterService: Повторная попытка через ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return attempt(attemptNumber + 1);
      } else {
        // Если все попытки неудачны, сохраняем локально
        const localCharacter = saveCharacter(character);
        console.warn('characterService: Сохранение в Realtime Database не удалось, сохранено локально');
        return localCharacter;
      }
    }
  };
  
  return attempt(1);
};

// Обновленный алиас для сохранения в базу данных
export const saveCharacterToFirestore = saveCharacterToDatabase;

// Удаление персонажа
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    console.log('characterService: Удаление персонажа:', characterId);
    
    const uid = getCurrentUid();
    
    // Пытаемся удалить из Realtime Database только если пользователь авторизован
    if (uid) {
      try {
        const characterRef = ref(db, `${CHARACTERS_PATH}/${characterId}`);
        await remove(characterRef);
        console.log('characterService: Персонаж удален из Realtime Database');
      } catch (databaseError) {
        console.warn('characterService: Ошибка удаления из Realtime Database:', databaseError);
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