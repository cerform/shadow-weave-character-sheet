import {
  ref,
  get,
  set,
  onValue,
  remove,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';
import { db } from '@/lib/firebase';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';
import { generateRandomId } from '@/utils/idGenerator';
import { LocalCharacterStore } from './characterStorage';

const CHARACTERS_PATH = 'characters';

export const subscribeToCharacters = (callback: (characters: Character[]) => void): (() => void) | null => {
  const uid = getCurrentUid();
  if (!uid) return null;

  const userRef = ref(db, `${CHARACTERS_PATH}/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    const characters: Character[] = [];
    if (data) {
      for (const key in data) {
        characters.push(normalizeCharacterAbilities({ ...data[key], id: key }));
      }
    }
    callback(characters);
  });

  return () => unsubscribe();
};

export const getUserCharacters = async (userId?: string): Promise<Character[]> => {
  const uid = userId || getCurrentUid();
  if (!uid) return [];
  const snapshot = await get(ref(db, `${CHARACTERS_PATH}/${uid}`));
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.entries(data).map(([id, value]) => normalizeCharacterAbilities({ ...(value as any), id }));
};

export const getCharacterById = async (characterId: string): Promise<Character | null> => {
  const uid = getCurrentUid();
  if (!uid) return null;

  const snapshot = await get(ref(db, `${CHARACTERS_PATH}/${uid}/${characterId}`));
  if (!snapshot.exists()) return null;

  return normalizeCharacterAbilities({ ...(snapshot.val() as any), id: characterId });
};

export const saveCharacter = async (character: Character): Promise<Character> => {
  const uid = getCurrentUid();
  if (!uid) {
    console.error('saveCharacter: No user ID available');
    return character;
  }

  const characterId = character.id || generateRandomId();
  console.log('saveCharacter: Saving character with ID:', characterId);
  
  const data = {
    ...normalizeCharacterAbilities(character),
    userId: uid,
    updatedAt: new Date().toISOString(),
    createdAt: character.createdAt || new Date().toISOString()
  };

  try {
    await set(ref(db, `${CHARACTERS_PATH}/${uid}/${characterId}`), data);
    console.log('saveCharacter: Character saved successfully');
    return { ...data, id: characterId };
  } catch (error) {
    console.error('saveCharacter: Error saving character:', error);
    throw error;
  }
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  const uid = getCurrentUid();
  if (!uid) return;
  await remove(ref(db, `${CHARACTERS_PATH}/${uid}/${characterId}`));
};

// Алиас для getUserCharacters для обратной совместимости
export const getCharactersByUserId = getUserCharacters;

// Функция для сохранения в Firestore (алиас для saveCharacter)
export const saveCharacterToFirestore = saveCharacter;

// Функции для работы с бэкапами в localStorage
export const getAllBackups = (): Array<{ id: string; character: Character; timestamp: string }> => {
  const backups: Array<{ id: string; character: Character; timestamp: string }> = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('character_backup_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const backup = JSON.parse(data);
            backups.push({
              id: key.replace('character_backup_', ''),
              character: backup.character,
              timestamp: backup.timestamp
            });
          } catch (error) {
            console.warn(`Ошибка парсинга бэкапа ${key}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Ошибка получения бэкапов:', error);
  }
  
  // Сортируем по времени (новые сначала)
  return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const restoreFromBackup = (backupId: string): Character | null => {
  try {
    const data = localStorage.getItem(`character_backup_${backupId}`);
    if (data) {
      const backup = JSON.parse(data);
      return backup.character;
    }
  } catch (error) {
    console.error('Ошибка восстановления из бэкапа:', error);
  }
  return null;
};

export const createBackup = (character: Character): void => {
  try {
    const backupId = `${character.id}_${Date.now()}`;
    const backup = {
      character,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`character_backup_${backupId}`, JSON.stringify(backup));
  } catch (error) {
    console.error('Ошибка создания бэкапа:', error);
  }
};

// Пустая функция для обратной совместимости
export const unsubscribeAll = (): void => {
  // Заглушка - в данной реализации нет глобальных подписок для отмены
};
