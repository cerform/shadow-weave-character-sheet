
import { CharacterSheet } from '@/types/character';
import { getCurrentUserId } from '@/utils/authHelpers';

// Character service for offline mode
const characterService = {
  // Save a character
  saveCharacter: async (character: CharacterSheet): Promise<{ id: string }> => {
    try {
      // Ensure character has an ID
      const characterId = character.id || `char-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Ensure character has a userId
      const characterWithUser = {
        ...character,
        id: characterId,
        userId: character.userId || getCurrentUserId(),
        updatedAt: new Date().toISOString()
      };
      
      // Get existing characters from localStorage
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      // Update or add character
      const existingIndex = characters.findIndex((c: CharacterSheet) => c.id === characterWithUser.id);
      if (existingIndex !== -1) {
        characters[existingIndex] = characterWithUser;
      } else {
        characters.push({
          ...characterWithUser,
          createdAt: new Date().toISOString()
        });
      }
      
      // Save back to localStorage
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      
      // Set this as last selected character
      localStorage.setItem('last-selected-character', characterId);
      
      return { id: characterId };
    } catch (error) {
      console.error('Error saving character:', error);
      throw error;
    }
  },
  
  // Get a character by ID
  getCharacterById: async (id: string): Promise<CharacterSheet> => {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (!savedCharacters) return Promise.reject('No characters found');
      
      const characters = JSON.parse(savedCharacters);
      const character = characters.find((c: CharacterSheet) => c.id === id);
      
      if (!character) return Promise.reject(`Character with ID ${id} not found`);
      
      return character;
    } catch (error) {
      console.error('Error getting character by ID:', error);
      throw error;
    }
  },
  
  // Get all characters for the current user
  getCharactersByUserId: async (): Promise<CharacterSheet[]> => {
    try {
      const userId = getCurrentUserId();
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (!savedCharacters) return [];
      
      const characters = JSON.parse(savedCharacters);
      // Filter by userId or return all in offline mode
      return characters.filter((c: CharacterSheet) => !c.userId || c.userId === userId);
    } catch (error) {
      console.error('Error getting characters by user ID:', error);
      return [];
    }
  },
  
  // Get all characters (alias for getCharactersByUserId)
  getCharacters: async (): Promise<CharacterSheet[]> => {
    return characterService.getCharactersByUserId();
  },
  
  // Delete a character
  deleteCharacter: async (id: string): Promise<boolean> => {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      if (!savedCharacters) return false;
      
      const characters = JSON.parse(savedCharacters);
      const filteredCharacters = characters.filter((c: CharacterSheet) => c.id !== id);
      
      localStorage.setItem('dnd-characters', JSON.stringify(filteredCharacters));
      
      // If this was the last selected character, remove that reference
      const lastSelected = localStorage.getItem('last-selected-character');
      if (lastSelected === id) {
        localStorage.removeItem('last-selected-character');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }
};

export default characterService;
