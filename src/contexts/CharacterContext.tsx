
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
  saveCurrentCharacter: () => Promise<string>;
  getUserCharacters: () => Promise<Character[]>;
  loading: boolean;
  error: Error | null;
  characters: Character[];
  refreshCharacters: () => Promise<void>;
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
  saveCurrentCharacter: async () => '',
  getUserCharacters: async () => [],
  loading: false,
  error: null,
  characters: [],
  refreshCharacters: async () => {},
});

// Create provider component
export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

  // Add new methods for the added properties
  const saveCurrentCharacter = async (): Promise<string> => {
    if (!character) {
      toast({
        title: "Ошибка сохранения",
        description: "Нет активного персонажа для сохранения",
        variant: "destructive"
      });
      return '';
    }
    
    try {
      setLoading(true);
      const id = await saveCharacterToFirestore(character);
      
      toast({
        title: "Успешно сохранено",
        description: "Персонаж успешно сохранен"
      });
      
      // Refresh the character list
      refreshCharacters();
      
      return id || '';
    } catch (error) {
      console.error('Error saving current character:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении персонажа",
        variant: "destructive"
      });
      return '';
    } finally {
      setLoading(false);
    }
  };
  
  const getUserCharacters = async (): Promise<Character[]> => {
    try {
      setLoading(true);
      // Use any user ID retrieval logic you have
      const userId = localStorage.getItem('userId') || '';
      if (!userId) return [];
      
      const userChars = await getCharactersByUserId(userId);
      setCharacters(userChars);
      return userChars;
    } catch (error: any) {
      console.error('Error getting user characters:', error);
      setError(error instanceof Error ? error : new Error('Unknown error'));
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const refreshCharacters = async (): Promise<void> => {
    return getUserCharacters().then(() => {});
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
        deleteCharacter: handleDeleteCharacter,
        saveCurrentCharacter,
        getUserCharacters,
        loading,
        error,
        characters,
        refreshCharacters
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => useContext(CharacterContext);
