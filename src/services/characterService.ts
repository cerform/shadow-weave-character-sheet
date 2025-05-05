
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

export const saveCharacter = (character: Character): Character => {
  try {
    // Generate ID if not present
    if (!character.id) {
      character = { ...character, id: uuidv4() };
    }
    
    // Get existing characters from localStorage
    const existingChars = localStorage.getItem('dnd-characters');
    let characters: Character[] = [];
    
    if (existingChars) {
      try {
        characters = JSON.parse(existingChars);
      } catch (e) {
        console.error('Error parsing stored characters, starting fresh', e);
      }
    }
    
    // Check if character already exists to update, otherwise add
    const index = characters.findIndex(char => char.id === character.id);
    
    if (index >= 0) {
      characters[index] = { ...characters[index], ...character };
    } else {
      characters.push(character);
    }
    
    // Save back to localStorage
    localStorage.setItem('dnd-characters', JSON.stringify(characters));
    
    return character;
  } catch (error) {
    console.error('Error saving character:', error);
    throw error;
  }
};

export const getCharacter = (id: string): Character | null => {
  try {
    const existingChars = localStorage.getItem('dnd-characters');
    
    if (!existingChars) {
      return null;
    }
    
    const characters: Character[] = JSON.parse(existingChars);
    const character = characters.find(char => char.id === id);
    
    return character || null;
  } catch (error) {
    console.error('Error getting character:', error);
    return null;
  }
};

export const deleteCharacter = (id: string): void => {
  try {
    const existingChars = localStorage.getItem('dnd-characters');
    
    if (!existingChars) {
      return;
    }
    
    let characters: Character[] = JSON.parse(existingChars);
    characters = characters.filter(char => char.id !== id);
    
    localStorage.setItem('dnd-characters', JSON.stringify(characters));
  } catch (error) {
    console.error('Error deleting character:', error);
  }
};

export const getAllCharacters = (): Character[] => {
  try {
    const existingChars = localStorage.getItem('dnd-characters');
    
    if (!existingChars) {
      return [];
    }
    
    const characters: Character[] = JSON.parse(existingChars);
    return characters;
  } catch (error) {
    console.error('Error getting all characters:', error);
    return [];
  }
};

// Экспортируем функции как дефолтный экспорт для совместимости
const characterService = {
  saveCharacter,
  getCharacter,
  deleteCharacter,
  getAllCharacters,
  getCharactersByUserId: () => getAllCharacters() // Для совместимости со старым API
};

export default characterService;
