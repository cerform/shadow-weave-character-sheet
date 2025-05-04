
import { CharacterSheet } from '@/types/character';

// Имитация сервиса для работы с персонажами
// В реальном приложении здесь будут API-вызовы к бэкенду

const LOCAL_STORAGE_KEY = 'dnd-characters';

// Получение всех персонажей текущего пользователя
export const getCharactersByUserId = async (userId?: string): Promise<CharacterSheet[]> => {
  try {
    const charactersJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!charactersJson) {
      return [];
    }

    const allCharacters: CharacterSheet[] = JSON.parse(charactersJson);
    
    // Фильтруем по userId, если он передан
    if (userId) {
      return allCharacters.filter(char => char.userId === userId);
    }
    
    return allCharacters;
  } catch (error) {
    console.error('Ошибка при получении персонажей:', error);
    return [];
  }
};

// Получение персонажа по id
export const getCharacterById = async (id: string): Promise<CharacterSheet | null> => {
  try {
    const charactersJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!charactersJson) {
      return null;
    }

    const allCharacters: CharacterSheet[] = JSON.parse(charactersJson);
    return allCharacters.find(char => char.id === id) || null;
  } catch (error) {
    console.error('Ошибка при получении персонажа по id:', error);
    return null;
  }
};

// Сохранение персонажа
export const saveCharacter = async (character: CharacterSheet): Promise<{id: string}> => {
  try {
    let allCharacters: CharacterSheet[] = [];
    const charactersJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (charactersJson) {
      allCharacters = JSON.parse(charactersJson);
    }
    
    // Генерируем id, если его нет
    if (!character.id) {
      character.id = Math.random().toString(36).substr(2, 9);
    }
    
    // Обновляем или добавляем
    const existingIndex = allCharacters.findIndex(char => char.id === character.id);
    
    if (existingIndex >= 0) {
      allCharacters[existingIndex] = {...character};
    } else {
      allCharacters.push({...character});
    }
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCharacters));
    return { id: character.id };
  } catch (error) {
    console.error('Ошибка при сохранении персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

// Удаление персонажа
export const deleteCharacter = async (id: string): Promise<{success: boolean}> => {
  try {
    const charactersJson = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!charactersJson) {
      return { success: false };
    }

    let allCharacters: CharacterSheet[] = JSON.parse(charactersJson);
    allCharacters = allCharacters.filter(char => char.id !== id);
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allCharacters));
    return { success: true };
  } catch (error) {
    console.error('Ошибка при удалении персонажа:', error);
    return { success: false };
  }
};

export default {
  getCharactersByUserId,
  getCharacterById,
  saveCharacter,
  deleteCharacter
};
