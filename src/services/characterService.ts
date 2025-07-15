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
import { db } from '@/lib/firebaseRealtime';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';
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
  if (!uid) return character;

  const characterId = character.id || `character_${Date.now()}`;
  const data = {
    ...normalizeCharacterAbilities(character),
    userId: uid,
    updatedAt: new Date().toISOString(),
    createdAt: character.createdAt || new Date().toISOString()
  };

  await set(ref(db, `${CHARACTERS_PATH}/${uid}/${characterId}`), data);
  return { ...data, id: characterId };
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  const uid = getCurrentUid();
  if (!uid) return;
  await remove(ref(db, `${CHARACTERS_PATH}/${uid}/${characterId}`));
};
