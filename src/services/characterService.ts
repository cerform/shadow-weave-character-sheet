import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  getDoc,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';
import { LocalCharacterStore } from './characterStorage';

// Коллекция персонажей в Firestore
const CHARACTERS_COLLECTION = 'characters';

// Генерация уникального ID для персонажа
const generateCharacterId = () => `character_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Хранилище активных подписок
const activeSubscriptions = new Map<string, Unsubscribe>();

// 🔥 Реалтайм подписка на персонажей пользователя
export const subscribeToCharacters = (callback: (characters: Character[]) => void): Unsubscribe | null => {
  const uid = getCurrentUid();
  
  if (!uid) {
    console.log('characterService: Пользователь не авторизован, используем localStorage');
    const localCharacters = LocalCharacterStore.getAll();
    callback(localCharacters);
    return null;
  }

  try {
    console.log('characterService: Подписка на персонажей пользователя:', uid);
    
    const q = query(
      collection(db, CHARACTERS_COLLECTION),
      where('userId', '==', uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const characters: Character[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const normalizedCharacter = normalizeCharacterAbilities({
          ...data,
          id: doc.id
        } as Character);
        characters.push(normalizedCharacter);
        
        // Синхронизируем с localStorage как резервную копию
        try {
          localStorage.setItem(`character_${doc.id}`, JSON.stringify(normalizedCharacter));
        } catch (e) {
          console.warn('characterService: Не удалось сохранить резервную копию:', doc.id);
        }
      });
      
      console.log('characterService: Получено персонажей в реальном времени:', characters.length);
      callback(characters);
    }, (error) => {
      console.error('characterService: Ошибка подписки на Firestore, используем localStorage:', error);
      // Fallback на localStorage
      const localCharacters = LocalCharacterStore.getAll(uid);
      callback(localCharacters);
    });

    // Сохраняем подписку для возможности отписки
    const subscriptionKey = `characters_${uid}`;
    activeSubscriptions.set(subscriptionKey, unsubscribe);
    
    return unsubscribe;
  } catch (error) {
    console.error('characterService: Ошибка создания подписки:', error);
    // Fallback на localStorage
    const localCharacters = LocalCharacterStore.getAll();
    callback(localCharacters);
    return null;
  }
};

// Получение всех персонажей пользователя (одноразовый запрос)
export const getUserCharacters = async (userId?: string): Promise<Character[]> => {
  try {
    const uid = userId || getCurrentUid();
    console.log('characterService: Загрузка персонажей для пользователя:', uid);
    
    if (!uid) {
      console.log('characterService: Пользователь не авторизован, используем localStorage');
      return LocalCharacterStore.getAll();
    }
    
    try {
      const q = query(
        collection(db, CHARACTERS_COLLECTION),
        where('userId', '==', uid),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const characters: Character[] = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const normalizedCharacter = normalizeCharacterAbilities({
          ...data,
          id: doc.id
        } as Character);
        characters.push(normalizedCharacter);
        
        // Синхронизируем с localStorage
        try {
          localStorage.setItem(`character_${doc.id}`, JSON.stringify(normalizedCharacter));
        } catch (e) {
          console.warn('characterService: Не удалось сохранить резервную копию:', doc.id);
        }
      });
      
      console.log('characterService: Загружено персонажей из Firestore:', characters.length);
      return characters;
    } catch (firestoreError) {
      console.warn('characterService: Ошибка загрузки из Firestore, используем localStorage:', firestoreError);
      return LocalCharacterStore.getAll(uid);
    }
  } catch (error) {
    console.error('characterService: Ошибка получения персонажей:', error);
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
      // Пытаемся загрузить из Firestore
      const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
      const snapshot = await getDoc(characterRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        const character = normalizeCharacterAbilities({
          ...data,
          id: characterId
        } as Character);
        
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

// 🔥 Сохранение персонажа в Firestore
export const saveCharacterToDatabase = async (character: Character): Promise<Character> => {
  const uid = getCurrentUid();
  
  if (!uid) {
    console.warn('characterService: Пользователь не авторизован, сохраняем только в localStorage');
    return saveCharacter(character);
  }

  try {
    console.log('characterService: Сохранение персонажа в Firestore:', character.name);
    
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
      characterId = generateCharacterId();
    }
    
    // Сохраняем в Firestore
    const characterRef = doc(db, CHARACTERS_COLLECTION, characterId);
    await setDoc(characterRef, characterData);
    
    const savedCharacter = {
      ...characterData,
      id: characterId
    };
    
    // Сохраняем в localStorage как резервную копию
    LocalCharacterStore.save(savedCharacter);
    
    console.log('characterService: Персонаж сохранен в Firestore:', savedCharacter.id);
    return savedCharacter;
  } catch (error) {
    console.error('characterService: Ошибка сохранения в Firestore, сохраняем локально:', error);
    const localCharacter = saveCharacter(character);
    return localCharacter;
  }
};

// Обновленный алиас для сохранения в базу данных
export const saveCharacterToFirestore = saveCharacterToDatabase;

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

// Очистка всех активных подписок
export const unsubscribeAll = (): void => {
  console.log('characterService: Отписка от всех активных подписок');
  activeSubscriptions.forEach((unsubscribe) => {
    unsubscribe();
  });
  activeSubscriptions.clear();
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