
import { CharacterSheet } from '@/types/character';

// Служба для работы с персонажами
const characterService = {
  // Получение всех персонажей текущего пользователя
  getCharacters: async (): Promise<CharacterSheet[]> => {
    try {
      // Получаем персонажей из localStorage
      const charactersJSON = localStorage.getItem('characters');
      if (!charactersJSON) {
        return [];
      }
      
      const characters = JSON.parse(charactersJSON);
      return Array.isArray(characters) ? characters : [];
    } catch (error) {
      console.error('Ошибка при получении персонажей:', error);
      return [];
    }
  },
  
  // Получение персонажа по ID
  getCharacterById: async (id: string): Promise<CharacterSheet> => {
    try {
      const characters = await characterService.getCharacters();
      const character = characters.find(char => char.id === id);
      
      if (!character) {
        throw new Error('Персонаж не найден');
      }
      
      return character;
    } catch (error) {
      console.error('Ошибка при получении персонажа:', error);
      throw error;
    }
  },
  
  // Сохранение персонажа
  saveCharacter: async (character: CharacterSheet): Promise<boolean> => {
    try {
      const characters = await characterService.getCharacters();
      
      // Если у персонажа нет ID, создаем новый
      if (!character.id) {
        character.id = Date.now().toString();
        character.createdAt = new Date().toISOString();
        characters.push(character);
      } else {
        // Иначе обновляем существующего
        const index = characters.findIndex(char => char.id === character.id);
        if (index !== -1) {
          characters[index] = {
            ...characters[index],
            ...character,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Если персонаж с таким ID не найден, добавляем как новый
          character.createdAt = character.createdAt || new Date().toISOString();
          characters.push(character);
        }
      }
      
      localStorage.setItem('characters', JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      return false;
    }
  },
  
  // Удаление персонажа
  deleteCharacter: async (id: string): Promise<boolean> => {
    try {
      const characters = await characterService.getCharacters();
      const filteredCharacters = characters.filter(char => char.id !== id);
      
      localStorage.setItem('characters', JSON.stringify(filteredCharacters));
      return true;
    } catch (error) {
      console.error('Ошибка при удалении персонажа:', error);
      return false;
    }
  },
  
  // Обновление локального персонажа (для оптимистичного UI)
  updateLocalCharacter: (character: CharacterSheet): void => {
    try {
      const charactersJSON = localStorage.getItem('characters');
      if (!charactersJSON) return;
      
      const characters = JSON.parse(charactersJSON);
      if (!Array.isArray(characters)) return;
      
      const index = characters.findIndex(char => char.id === character.id);
      if (index !== -1) {
        characters[index] = {
          ...characters[index],
          ...character,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('characters', JSON.stringify(characters));
      }
    } catch (error) {
      console.error('Ошибка при обновлении локального персонажа:', error);
    }
  },
  
  // Удаление локального персонажа (для оптимистичного UI)
  removeLocalCharacter: (id: string): void => {
    try {
      const charactersJSON = localStorage.getItem('characters');
      if (!charactersJSON) return;
      
      const characters = JSON.parse(charactersJSON);
      if (!Array.isArray(characters)) return;
      
      const filteredCharacters = characters.filter(char => char.id !== id);
      localStorage.setItem('characters', JSON.stringify(filteredCharacters));
    } catch (error) {
      console.error('Ошибка при удалении локального персонажа:', error);
    }
  },
  
  // Очистка всех персонажей
  clearAllCharacters: async (): Promise<boolean> => {
    try {
      localStorage.removeItem('characters');
      return true;
    } catch (error) {
      console.error('Ошибка при очистке персонажей:', error);
      return false;
    }
  }
};

export default characterService;
