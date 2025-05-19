
import { Character } from '@/types/character';
import { db } from '@/services/firebase/firestore';
import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { getCurrentUid } from '@/utils/authHelpers';

// Константы
const CHARACTERS_COLLECTION = 'characters';

// Функция сохранения персонажа
export async function saveCharacter(character: Character): Promise<string> {
  try {
    console.log('saveCharacter: Начало сохранения персонажа:', character.name);
    
    // Проверка авторизации
    const userId = getCurrentUid();
    if (!userId) {
      throw new Error('saveCharacter: Пользователь не авторизован');
    }
    
    // Проверяем и устанавливаем userId
    if (!character.userId) {
      character.userId = userId;
    }
    
    // Устанавливаем метки времени
    if (!character.createdAt) {
      character.createdAt = new Date().toISOString();
    }
    character.updatedAt = new Date().toISOString();
    
    // Если у персонажа уже есть id, используем его, иначе создаем новый
    const characterId = character.id || doc(collection(db, CHARACTERS_COLLECTION)).id;
    character.id = characterId;
    
    // Сохраняем в Firestore
    await setDoc(doc(db, CHARACTERS_COLLECTION, characterId), character);
    
    console.log('saveCharacter: Персонаж успешно сохранен с ID:', characterId);
    return characterId;
  } catch (error) {
    console.error('saveCharacter: Ошибка при сохранении персонажа:', error);
    throw error;
  }
}

// Функция получения персонажа по ID
export async function getCharacter(id: string): Promise<Character | null> {
  try {
    console.log('getCharacter: Получение персонажа с ID:', id);
    
    const docRef = doc(db, CHARACTERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const characterData = docSnap.data() as Character;
      console.log('getCharacter: Персонаж успешно получен:', characterData.name);
      return { ...characterData, id: docSnap.id };
    } else {
      console.log('getCharacter: Персонаж не найден');
      return null;
    }
  } catch (error) {
    console.error('getCharacter: Ошибка при получении персонажа:', error);
    return null;
  }
}

// Функция удаления персонажа
export async function deleteCharacter(id: string): Promise<void> {
  try {
    console.log('deleteCharacter: Удаление персонажа с ID:', id);
    
    // Проверка авторизации
    const userId = getCurrentUid();
    if (!userId) {
      throw new Error('deleteCharacter: Пользователь не авторизован');
    }
    
    // Проверяем, принадлежит ли персонаж текущему пользователю
    const character = await getCharacter(id);
    if (!character) {
      throw new Error('deleteCharacter: Персонаж не найден');
    }
    
    if (character.userId !== userId) {
      throw new Error('deleteCharacter: У пользователя нет прав на удаление этого персонажа');
    }
    
    // Удаляем персонажа
    await deleteDoc(doc(db, CHARACTERS_COLLECTION, id));
    
    console.log('deleteCharacter: Персонаж успешно удален');
  } catch (error) {
    console.error('deleteCharacter: Ошибка при удалении персонажа:', error);
    throw error;
  }
}

// Функция получения всех персонажей
export async function getAllCharacters(): Promise<Character[]> {
  try {
    console.log('getAllCharacters: Получение всех персонажей');
    
    const querySnapshot = await getDocs(collection(db, CHARACTERS_COLLECTION));
    const characters: Character[] = [];
    
    querySnapshot.forEach((doc) => {
      characters.push({ ...doc.data(), id: doc.id } as Character);
    });
    
    console.log(`getAllCharacters: Получено ${characters.length} персонажей`);
    return characters;
  } catch (error) {
    console.error('getAllCharacters: Ошибка при получении персонажей:', error);
    return [];
  }
}

// Функция получения персонажей пользователя
export async function getCharactersByUserId(userId: string): Promise<Character[]> {
  try {
    console.log('getCharactersByUserId: Получение персонажей для пользователя с ID:', userId);
    
    // Если userId не передан, выбрасываем ошибку
    if (!userId) {
      throw new Error('getCharactersByUserId: ID пользователя не передан');
    }
    
    // Создаем запрос для получения персонажей конкретного пользователя
    const q = query(collection(db, CHARACTERS_COLLECTION), where('userId', '==', userId));
    
    // Выполняем запрос
    const querySnapshot = await getDocs(q);
    
    console.log('getCharactersByUserId: Найдено', querySnapshot.size, 'документов');
    
    // Обрабатываем полученные документы
    const characters: Character[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Character;
      characters.push({ ...data, id: doc.id });
    });
    
    console.log('getCharactersByUserId: Обработано', characters.length, 'персонажей:', characters);
    return characters;
  } catch (error) {
    console.error('getCharactersByUserId: Ошибка при получении персонажей пользователя:', error);
    return [];
  }
}
