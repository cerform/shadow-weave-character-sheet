
import { createContext, useContext, useState, ReactNode } from 'react';
import { Character } from '@/types/character';
import { saveCharacterToFirestore, getCharacterById, getAllCharacters, deleteCharacter, getCharactersByUserId } from '@/services/characterService';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character) => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCharacter: (character: Character) => Promise<string>;
  getCharacterById: (id: string) => Promise<Character | null>;
  getAllCharacters: () => Promise<Character[]>;
  getCharactersByUserId: (userId: string) => Promise<Character[]>;
  deleteCharacter: (id: string) => Promise<void>;
}

// Create context with default values
const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  updateCharacter: () => {},
  saveCharacter: async () => '',
  getCharacterById: async () => null,
  getAllCharacters: async () => [],
  getCharactersByUserId: async () => [],
  deleteCharacter: async () => {},
});

// Create provider component
export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const { toast } = useToast();

  const updateCharacter = (updates: Partial<Character>) => {
    if (!character) return;

    const updatedCharacter = { ...character, ...updates };
    setCharacter(updatedCharacter);
  };

  const handleSaveCharacter = async (char: Character): Promise<string> => {
    try {
      const id = await saveCharacterToFirestore(char);
      return id || '';
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: "Ошибка при сохранении персонажа",
        description: "Произошла ошибка при сохранении персонажа. Пожалуйста, попробуйте еще раз.",
        variant: "destructive"
      });
      return '';
    }
  };
  
  const handleGetCharacterById = async (id: string): Promise<Character | null> => {
    try {
      return await getCharacterById(id);
    } catch (error) {
      console.error('Error getting character:', error);
      return null;
    }
  };

  const handleGetAllCharacters = async (): Promise<Character[]> => {
    try {
      return await getAllCharacters();
    } catch (error) {
      console.error('Error getting all characters:', error);
      return [];
    }
  };

  const handleGetCharactersByUserId = async (userId: string): Promise<Character[]> => {
    try {
      return await getCharactersByUserId(userId);
    } catch (error) {
      console.error('Error getting user characters:', error);
      return [];
    }
  };

  const handleDeleteCharacter = async (id: string): Promise<void> => {
    try {
      await deleteCharacter(id);
      // If the currently active character is being deleted, set character to null
      if (character?.id === id) {
        setCharacter(null);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        setCharacter,
        updateCharacter,
        saveCharacter: handleSaveCharacter,
        getCharacterById: handleGetCharacterById,
        getAllCharacters: handleGetAllCharacters,
        getCharactersByUserId: handleGetCharactersByUserId,
        deleteCharacter: handleDeleteCharacter
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
