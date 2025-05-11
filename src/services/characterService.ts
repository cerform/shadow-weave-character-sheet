
import { collection, doc, getDocs, query, where, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Character } from '@/types/character';
import { getCurrentUid } from '@/utils/authHelpers';
import { auth } from '@/lib/firebase';
import { convertToCharacter } from '@/utils/characterConverter';
// Удаляем импорт supabase, так как он не существует
// import { supabase } from '@/lib/supabase';

/**
 * Получение всех персонажей
 * @returns Массив персонажей
 */
export const getAllCharacters = async (): Promise<Character[]> => {
  try {
    console.log('characterService: запрос всех персонажей');
    const charactersRef = collection(db, 'characters');
    const snapshot = await getDocs(charactersRef);
    
    const characters = snapshot.docs.map(doc => {
      const data = doc.data();
      // Используем convertToCharacter для гарантии правильной структуры объекта
      return convertToCharacter({ ...data, id: doc.id });
    });
    
    console.log(`characterService: получено ${characters.length} персонажей`);
    return characters;
  } catch (error) {
    console.error('Ошибка при получении всех персонажей:', error);
    throw error;
  }
};

/**
 * Получение персонажей конкретного пользователя
 * @param userId ID пользователя
 * @returns Массив персонажей
 */
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('getCharactersByUserId: Некорректный userId:', userId);
      throw new Error('Некорректный ID пользователя');
    }
    
    console.log('getCharactersByUserId: Запрос персонажей для пользователя:', userId);
    
    // Проверяем, что пользователь авторизован
    if (!auth.currentUser) {
      console.error('getCharactersByUserId: Пользователь не авторизован!');
      throw new Error('Пользователь не авторизован');
    }
    
    // Явно преобразуем в строку и используем trim для удаления пробелов
    const userIdString = String(userId).trim();
    
    // Проверяем доступность базы данных
    if (!db) {
      console.error('getCharactersByUserId: База данных недоступна');
      throw new Error('База данных недоступна');
    }
    
    console.log('getCharactersByUserId: Проверка базы данных успешна');
    
    // Создаем запрос с ЯВНЫМ фильтром по userId
    const charactersRef = collection(db, 'characters');
    const q = query(charactersRef, where("userId", "==", userIdString));
    
    console.log('getCharactersByUserId: Выполняем запрос с userId =', userIdString);
    
    try {
      const snapshot = await getDocs(q);
      console.log(`getCharactersByUserId: Найдено ${snapshot.docs.length} документов`);
      
      // Логируем все полученные документы для отладки
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`getCharactersByUserId: Документ ${index + 1}:`, { 
          id: doc.id,
          userId: data.userId,
          name: data.name || 'без имени'
        });
      });
      
      // Маппинг результатов с дополнительной проверкой
      const characters = snapshot.docs.map(doc => {
        const data = doc.data();
        // Добавляем проверку наличия userId и соответствия запрошенному
        if (!data.userId) {
          console.warn(`getCharactersByUserId: У персонажа ${doc.id} отсутствует userId, ожидалось ${userIdString}`);
          data.userId = userIdString; // Исправляем на лету
        }
        
        // Используем convertToCharacter для гарантии правильной структуры объекта
        return convertToCharacter({ ...data, id: doc.id });
      });
      
      console.log(`getCharactersByUserId: Обработано ${characters.length} персонажей:`, 
        characters.map(c => ({ id: c.id, name: c.name, userId: c.userId })));
      
      return characters;
    } catch (error) {
      console.error('getCharactersByUserId: Ошибка при выполнении запроса:', error);
      throw error;
    }
  } catch (error) {
    console.error('Ошибка при получении персонажей пользователя:', error);
    throw error;
  }
};

/**
 * Получение персонажа по ID
 * @param id ID персонажа
 * @returns Персонаж или null
 */
export const getCharacter = async (id: string): Promise<Character | null> => {
  try {
    const docRef = doc(db, 'characters', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Используем convertToCharacter для гарантии правильной структуры объекта
      return convertToCharacter({ ...data, id: docSnap.id });
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при получении персонажа с ID ${id}:`, error);
    throw error;
  }
};

// Adding the missing getCharacterById function (alias for getCharacter)
export const getCharacterById = async (id: string): Promise<Character | null> => {
  return getCharacter(id);
};

/**
 * Сохранение персонажа
 * @param character Данные персонажа
 * @returns ID персонажа
 */
export const saveCharacter = async (character: Character): Promise<string> => {
  try {
    // Проверяем наличие userId
    const userId = getCurrentUid();
    
    // Если у персонажа нет userId и мы можем его получить, добавляем
    if (!character.userId && userId) {
      character.userId = userId;
      console.log('saveCharacter: Добавлен userId:', userId);
    }
    
    // Если у персонажа по-прежнему нет userId, это ошибка
    if (!character.userId) {
      throw new Error('Ошибка: У персонажа отсутствует userId');
    }
    
    // Проверяем соединение с базой
    if (!db) {
      console.error('saveCharacter: Нет соединения с Firebase');
      throw new Error('Нет соединения с базой данных');
    }
    
    console.log('saveCharacter: Сохраняем персонажа', { 
      id: character.id, 
      name: character.name, 
      userId: character.userId 
    });
    
    if (character.id) {
      // Обновляем существующий документ
      const docRef = doc(db, 'characters', character.id);
      await updateDoc(docRef, character);
      console.log(`saveCharacter: Персонаж ${character.id} обновлен успешно`);
      return character.id;
    } else {
      // Создаем новый документ
      const docRef = await addDoc(collection(db, 'characters'), character);
      console.log(`saveCharacter: Создан новый персонаж с ID ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

/**
 * Сохранение персонажа в Firestore
 * @param character Объект персонажа для сохранения
 */
export const saveCharacterToFirestore = async (character: Character): Promise<void> => {
  await saveCharacter(character);
};

/**
 * Удаление персонажа по ID
 * @param id ID персонажа
 */
export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    // Проверяем, что ID существует
    if (!id) {
      throw new Error('Не указан ID персонажа для удаления');
    }
    
    // Проверяем, что пользователь авторизован
    const userId = getCurrentUid();
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Получаем персонажа для проверки владения
    const character = await getCharacter(id);
    if (!character) {
      throw new Error(`Персонаж с ID ${id} не найден`);
    }
    
    // Проверяем, что персонаж принадлежит текущему пользователю
    if (character.userId && character.userId !== userId) {
      throw new Error('Нет прав на удаление этого персонажа');
    }
    
    // Удаляем персонажа
    await deleteDoc(doc(db, 'characters', id));
    console.log(`deleteCharacter: Персонаж ${id} удален успешно`);
  } catch (error) {
    console.error(`Ошибка при удалении персонажа с ID ${id}:`, error);
    throw error;
  }
};

// Удаляем проблемный код с top-level return и Supabase
// Вместо этого добавим полезную функцию генерации ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Вместо прежнего кода Supabase, создадим функцию для создания полного объекта персонажа
export const createFullCharacter = (characterData: Partial<Character>): Character => {
  return {
    id: characterData.id || generateId(),
    name: characterData.name || 'Новый персонаж',
    class: characterData.class || '',
    className: characterData.className || characterData.class || '',
    race: characterData.race || '',
    level: characterData.level || 1,
    experience: characterData.xp || characterData.experience || 0,
    xp: characterData.xp || characterData.experience || 0,
    strength: characterData.strength || (characterData.stats?.strength || 10),
    dexterity: characterData.dexterity || (characterData.stats?.dexterity || 10),
    constitution: characterData.constitution || (characterData.stats?.constitution || 10),
    intelligence: characterData.intelligence || (characterData.stats?.intelligence || 10),
    wisdom: characterData.wisdom || (characterData.stats?.wisdom || 10),
    charisma: characterData.charisma || (characterData.stats?.charisma || 10),
    stats: characterData.stats || {
      strength: characterData.strength || 10,
      dexterity: characterData.dexterity || 10, 
      constitution: characterData.constitution || 10,
      intelligence: characterData.intelligence || 10,
      wisdom: characterData.wisdom || 10,
      charisma: characterData.charisma || 10
    },
    // Добавляем обязательные поля Character
    background: characterData.background || '',
    alignment: characterData.alignment || '',
    abilities: characterData.abilities || {
      STR: characterData.strength || 10,
      DEX: characterData.dexterity || 10,
      CON: characterData.constitution || 10,
      INT: characterData.intelligence || 10,
      WIS: characterData.wisdom || 10,
      CHA: characterData.charisma || 10,
      strength: characterData.strength || 10,
      dexterity: characterData.dexterity || 10,
      constitution: characterData.constitution || 10,
      intelligence: characterData.intelligence || 10,
      wisdom: characterData.wisdom || 10,
      charisma: characterData.charisma || 10
    },
    savingThrows: characterData.savingThrows || {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
    },
    skills: characterData.skills || {},
    hp: characterData.hp || 10,
    maxHp: characterData.maxHp || 10,
    temporaryHp: characterData.temporaryHp || 0,
    ac: characterData.ac || 10,
    proficiencyBonus: characterData.proficiencyBonus || 2,
    speed: characterData.speed || 30,
    initiative: characterData.initiative || 0,
    inspiration: characterData.inspiration || false,
    hitDice: characterData.hitDice || {
      total: characterData.level || 1,
      used: 0,
      dieType: 'd8'
    },
    resources: characterData.resources || {},
    deathSaves: characterData.deathSaves || {
      successes: 0,
      failures: 0
    },
    spellcasting: characterData.spellcasting || {
      ability: '',
      dc: 0,
      attack: 0
    },
    spellSlots: characterData.spellSlots || {},
    spells: characterData.spells || [],
    equipment: characterData.equipment || {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    },
    proficiencies: characterData.proficiencies || {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    features: characterData.features || [],
    notes: characterData.notes || '',
    personality: characterData.personality || {
      traits: '',
      ideals: '',
      bonds: '',
      flaws: ''
    }
  };
};
