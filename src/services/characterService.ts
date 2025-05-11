
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/firebase';
import { createClient } from '@supabase/supabase-js';
import { createDefaultCharacter } from '@/utils/characterUtils';

// Создаем Supabase клиент
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Генерируем уникальный ID для персонажа
const generateId = (): string => {
  return uuidv4();
};

/**
 * Получение списка персонажей пользователя
 */
export const getUserCharacters = async (userId?: string): Promise<Character[]> => {
  try {
    // Если ID пользователя не предоставлен, используем текущего авторизованного пользователя
    const currentUserId = userId || auth.currentUser?.uid;
    
    if (!currentUserId) {
      throw new Error('Пользователь не авторизован');
    }
    
    // Запрашиваем персонажей из Supabase
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('userId', currentUserId)
      .order('updatedAt', { ascending: false });
    
    if (error) {
      console.error('Ошибка при получении персонажей:', error);
      throw error;
    }
    
    return (data || []) as Character[];
  } catch (error) {
    console.error('Не удалось получить персонажей:', error);
    return [];
  }
};

/**
 * Alias для getUserCharacters - добавляем для исправления ссылок в коде
 */
export const getAllCharacters = getUserCharacters;

/**
 * Получение персонажей по ID пользователя
 */
export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  return getUserCharacters(userId);
};

/**
 * Получение персонажа по ID
 */
export const getCharacter = async (characterId: string): Promise<Character | null> => {
  try {
    // Запрашиваем персонажа из Supabase
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();
    
    if (error) {
      console.error('Ошибка при получении персонажа:', error);
      throw error;
    }
    
    return data as Character;
  } catch (error) {
    console.error(`Не удалось получить персонажа с ID ${characterId}:`, error);
    return null;
  }
};

/**
 * Сохранение персонажа в Supabase
 */
export const saveCharacterToFirestore = async (character: Character): Promise<Character> => {
  try {
    // Проверяем наличие обязательных полей
    if (!character.id) {
      character.id = generateId();
    }
    
    if (!character.name) {
      character.name = 'Новый персонаж';
    }
    
    // Добавляем метаданные
    const now = new Date().toISOString();
    character.updatedAt = now;
    
    if (!character.createdAt) {
      character.createdAt = now;
    }
    
    // Получаем текущего пользователя
    const currentUser = auth.currentUser;
    
    if (!character.userId && currentUser) {
      character.userId = currentUser.uid;
    }
    
    // Преобразуем персонажа в формат, подходящий для Supabase
    // используем распаковку объекта для избежания ошибок типов с Supabase
    const characterForSupabase = { ...character };
    
    // Проверяем существующего персонажа
    const { data: existingCharacter } = await supabase
      .from('characters')
      .select('id')
      .eq('id', character.id)
      .single();
    
    let result;
    
    if (existingCharacter) {
      // Обновляем существующего персонажа
      const { data, error } = await supabase
        .from('characters')
        .update(characterForSupabase)
        .eq('id', character.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      result = data;
    } else {
      // Создаем нового персонажа
      const { data, error } = await supabase
        .from('characters')
        .insert(characterForSupabase)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      result = data;
    }
    
    return result as Character;
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw error;
  }
};

/**
 * Удаление персонажа
 */
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Не удалось удалить персонажа с ID ${characterId}:`, error);
    throw error;
  }
};

/**
 * Преобразование персонажа из Firestore в полный объект персонажа
 */
export const convertFirestoreCharacterToCharacter = (firestoreCharacter: any): Character => {
  // Получаем базовый персонаж с дефолтными значениями
  const baseCharacter = createDefaultCharacter();
  
  // Объединяем с данными из Firestore
  const character = {
    ...baseCharacter,
    ...firestoreCharacter
  };
  
  return character as Character;
};
