import { Character } from '@/types/character';
import { normalizeCharacterAbilities } from '@/utils/characterNormalizer';

// Централизованное управление localStorage для персонажей
export class LocalCharacterStore {
  private static STORAGE_KEY = 'dnd-characters';
  private static CHARACTER_PREFIX = 'character_';

  // Сохранить персонажа в localStorage
  static save(character: Character): Character {
    try {
      // Нормализуем характеристики перед сохранением
      const normalizedCharacter = normalizeCharacterAbilities(character);
      
      // Генерируем ID если его нет
      if (!normalizedCharacter.id) {
        normalizedCharacter.id = `${this.CHARACTER_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Обновляем временные метки
      const now = new Date().toISOString();
      if (!normalizedCharacter.createdAt) {
        normalizedCharacter.createdAt = now;
      }
      normalizedCharacter.updatedAt = now;

      // Сохраняем персонажа по его ID
      const key = `${this.CHARACTER_PREFIX}${normalizedCharacter.id}`;
      localStorage.setItem(key, JSON.stringify(normalizedCharacter));
      
      // Также обновляем общий список для быстрого доступа
      this.updateCharactersList(normalizedCharacter);
      
      console.log('LocalCharacterStore: Персонаж сохранен:', normalizedCharacter.name);
      return normalizedCharacter;
    } catch (error) {
      console.error('LocalCharacterStore: Ошибка сохранения персонажа:', error);
      throw new Error('Не удалось сохранить персонажа локально');
    }
  }

  // Получить всех персонажей пользователя
  static getAll(userId?: string): Character[] {
    try {
      const characters: Character[] = [];
      
      // Проходим по всем ключам localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CHARACTER_PREFIX) && !key.includes('backup')) {
          try {
            const characterData = JSON.parse(localStorage.getItem(key) || '');
            
            // Фильтруем по userId если указан
            if (!userId || characterData.userId === userId) {
              const normalizedCharacter = normalizeCharacterAbilities(characterData);
              characters.push(normalizedCharacter);
            }
          } catch (parseError) {
            console.warn('LocalCharacterStore: Ошибка парсинга персонажа:', key, parseError);
          }
        }
      }
      
      // Сортируем по дате обновления
      characters.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('LocalCharacterStore: Загружено персонажей:', characters.length);
      return characters;
    } catch (error) {
      console.error('LocalCharacterStore: Ошибка загрузки персонажей:', error);
      return [];
    }
  }

  // Получить персонажа по ID
  static getById(characterId: string): Character | null {
    try {
      const key = `${this.CHARACTER_PREFIX}${characterId}`;
      const data = localStorage.getItem(key);
      
      if (data) {
        const characterData = JSON.parse(data);
        const normalizedCharacter = normalizeCharacterAbilities(characterData);
        console.log('LocalCharacterStore: Персонаж загружен:', normalizedCharacter.name);
        return normalizedCharacter;
      }
      
      return null;
    } catch (error) {
      console.error('LocalCharacterStore: Ошибка получения персонажа:', error);
      return null;
    }
  }

  // Удалить персонажа
  static delete(characterId: string): void {
    try {
      const key = `${this.CHARACTER_PREFIX}${characterId}`;
      localStorage.removeItem(key);
      
      // Обновляем общий список
      this.removeFromCharactersList(characterId);
      
      console.log('LocalCharacterStore: Персонаж удален:', characterId);
    } catch (error) {
      console.error('LocalCharacterStore: Ошибка удаления персонажа:', error);
      throw new Error('Не удалось удалить персонажа');
    }
  }

  // Получить недавних персонажей (последние 5)
  static getRecent(userId?: string, count: number = 5): Character[] {
    const allCharacters = this.getAll(userId);
    return allCharacters.slice(0, count);
  }

  // Проверить существование персонажа
  static exists(characterId: string): boolean {
    const key = `${this.CHARACTER_PREFIX}${characterId}`;
    return localStorage.getItem(key) !== null;
  }

  // Очистить все персонажи пользователя
  static clearAll(userId?: string): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CHARACTER_PREFIX)) {
          if (!userId) {
            keysToRemove.push(key);
          } else {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '');
              if (data.userId === userId) {
                keysToRemove.push(key);
              }
            } catch (e) {
              // Удаляем поврежденные записи
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Очищаем общий список
      if (!userId) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      
      console.log('LocalCharacterStore: Очищено персонажей:', keysToRemove.length);
    } catch (error) {
      console.error('LocalCharacterStore: Ошибка очистки персонажей:', error);
    }
  }

  // Получить статистику хранилища
  static getStats(): { total: number; sizeInBytes: number } {
    let total = 0;
    let sizeInBytes = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.CHARACTER_PREFIX)) {
        total++;
        const value = localStorage.getItem(key) || '';
        sizeInBytes += new Blob([key + value]).size;
      }
    }
    
    return { total, sizeInBytes };
  }

  // Обновить общий список персонажей (для быстрого доступа)
  private static updateCharactersList(character: Character): void {
    try {
      const currentList = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const existingIndex = currentList.findIndex((c: any) => c.id === character.id);
      
      const characterInfo = {
        id: character.id,
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        userId: character.userId,
        updatedAt: character.updatedAt,
        createdAt: character.createdAt
      };
      
      if (existingIndex >= 0) {
        currentList[existingIndex] = characterInfo;
      } else {
        currentList.push(characterInfo);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentList));
    } catch (error) {
      console.warn('LocalCharacterStore: Ошибка обновления списка персонажей:', error);
    }
  }

  // Удалить из общего списка персонажей
  private static removeFromCharactersList(characterId: string): void {
    try {
      const currentList = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const filteredList = currentList.filter((c: any) => c.id !== characterId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredList));
    } catch (error) {
      console.warn('LocalCharacterStore: Ошибка удаления из списка персонажей:', error);
    }
  }
}