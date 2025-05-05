
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';

interface CharacterContextProps {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCharacterToStorage: (character: Character) => void;
}

// Default context
export const CharacterContext = createContext<CharacterContextProps>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCharacterToStorage: () => {},
});

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [character, setCharacterState] = useState<Character | null>(null);
  
  // Load character from localStorage on initial load
  useEffect(() => {
    const loadCharacter = () => {
      try {
        // Check for last selected character ID
        const lastCharacterId = localStorage.getItem('last-selected-character');
        
        if (lastCharacterId) {
          const savedCharacters = localStorage.getItem('dnd-characters');
          if (savedCharacters) {
            const characters = JSON.parse(savedCharacters);
            const found = characters.find((c: Character) => c.id === lastCharacterId);
            if (found) {
              setCharacterState(found);
              return;
            }
          }
        }
        
        // If no last character, try to load the first one
        const savedCharacters = localStorage.getItem('dnd-characters');
        if (savedCharacters) {
          const characters = JSON.parse(savedCharacters);
          if (characters.length > 0) {
            setCharacterState(characters[0]);
            localStorage.setItem('last-selected-character', characters[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading character:', error);
      }
    };
    
    loadCharacter();
  }, []);
  
  // Save character to localStorage
  const saveCharacterToStorage = useCallback((character: Character) => {
    try {
      const savedCharacters = localStorage.getItem('dnd-characters');
      let characters = savedCharacters ? JSON.parse(savedCharacters) : [];
      
      const index = characters.findIndex((c: Character) => c.id === character.id);
      if (index >= 0) {
        characters[index] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem('dnd-characters', JSON.stringify(characters));
      localStorage.setItem('last-selected-character', character.id);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  }, []);
  
  // Update character with new values
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    setCharacterState(updatedCharacter);
    saveCharacterToStorage(updatedCharacter);
  }, [character, saveCharacterToStorage]);
  
  // Set character with validation
  const setCharacter = useCallback((newCharacter: Character | null) => {
    if (newCharacter) {
      // Ensure character has an ID
      const characterWithId = newCharacter.id ? newCharacter : { ...newCharacter, id: uuidv4() };
      setCharacterState(characterWithId);
      saveCharacterToStorage(characterWithId);
    } else {
      setCharacterState(null);
    }
  }, [saveCharacterToStorage]);
  
  return (
    <CharacterContext.Provider
      value={{
        character,
        setCharacter,
        updateCharacter,
        saveCharacterToStorage,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = React.useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
