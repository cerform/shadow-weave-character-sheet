
import { Character } from '@/types/character';

// Временная реализация сервиса персонажей с использованием localStorage
// В будущем можно заменить на работу с базой данных

export const saveCharacter = (character: Character): Character => {
  try {
    // Генерируем ID если его нет
    if (!character.id) {
      character.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Добавляем временные метки
    const now = new Date().toISOString();
    character.updatedAt = now;
    if (!character.createdAt) {
      character.createdAt = now;
    }

    // Сохраняем в localStorage
    localStorage.setItem(`character_${character.id}`, JSON.stringify(character));
    
    // Обновляем список персонажей пользователя
    const userId = character.userId;
    if (userId) {
      const userCharactersKey = `user_characters_${userId}`;
      const existingCharacters = JSON.parse(localStorage.getItem(userCharactersKey) || '[]');
      const characterIndex = existingCharacters.findIndex((c: Character) => c.id === character.id);
      
      if (characterIndex >= 0) {
        existingCharacters[characterIndex] = character;
      } else {
        existingCharacters.push(character);
      }
      
      localStorage.setItem(userCharactersKey, JSON.stringify(existingCharacters));
    }

    // Создаем резервную копию
    createBackup(character);

    return character;
  } catch (error) {
    console.error('Ошибка сохранения персонажа:', error);
    throw new Error('Не удалось сохранить персонажа');
  }
};

export const getCharacterById = async (id: string): Promise<Character | null> => {
  try {
    const stored = localStorage.getItem(`character_${id}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Ошибка загрузки персонажа:', error);
    return null;
  }
};

export const getCharactersByUserId = async (userId: string): Promise<Character[]> => {
  try {
    const userCharactersKey = `user_characters_${userId}`;
    const stored = localStorage.getItem(userCharactersKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Ошибка загрузки персонажей пользователя:', error);
    return [];
  }
};

export const deleteCharacter = async (id: string): Promise<void> => {
  try {
    // Получаем персонажа для получения userId
    const character = await getCharacterById(id);
    
    // Удаляем из localStorage
    localStorage.removeItem(`character_${id}`);
    
    // Удаляем резервные копии
    localStorage.removeItem(`character_backup_${id}`);
    localStorage.removeItem(`character_autosave_${id}`);
    
    // Обновляем список персонажей пользователя
    if (character?.userId) {
      const userCharactersKey = `user_characters_${character.userId}`;
      const existingCharacters = JSON.parse(localStorage.getItem(userCharactersKey) || '[]');
      const filteredCharacters = existingCharacters.filter((c: Character) => c.id !== id);
      localStorage.setItem(userCharactersKey, JSON.stringify(filteredCharacters));
    }
  } catch (error) {
    console.error('Ошибка удаления персонажа:', error);
    throw new Error('Не удалось удалить персонажа');
  }
};

// Новые функции для работы с резервными копиями
export const createBackup = (character: Character): void => {
  try {
    const backupData = {
      character,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(`character_backup_${character.id}`, JSON.stringify(backupData));
  } catch (error) {
    console.error('Ошибка создания резервной копии:', error);
  }
};

export const restoreFromBackup = (id: string): Character | null => {
  try {
    const backup = localStorage.getItem(`character_backup_${id}`);
    if (backup) {
      const backupData = JSON.parse(backup);
      return backupData.character;
    }
    return null;
  } catch (error) {
    console.error('Ошибка восстановления из резервной копии:', error);
    return null;
  }
};

export const getAllBackups = (): Array<{ id: string; character: Character; timestamp: string }> => {
  try {
    const backups: Array<{ id: string; character: Character; timestamp: string }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('character_backup_')) {
        const backup = localStorage.getItem(key);
        if (backup) {
          const backupData = JSON.parse(backup);
          backups.push({
            id: key.replace('character_backup_', ''),
            character: backupData.character,
            timestamp: backupData.timestamp
          });
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Ошибка получения списка резервных копий:', error);
    return [];
  }
};
