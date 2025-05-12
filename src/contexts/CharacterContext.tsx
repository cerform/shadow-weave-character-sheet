
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { createCharacter, getCharacter } from '@/lib/supabase';
import { getCurrentUid } from '@/utils/authHelpers';
import { useToast } from '@/hooks/use-toast';

// Add the missing functions (mock implementations)
const updateCharacterInDb = async (character: Character) => {
  console.log('Updating character in DB:', character);
  return character;
};

const deleteCharacterInDb = async (id: string) => {
  console.log('Deleting character from DB:', id);
  return true;
};

interface CharacterContextType {
  character: Character | null;
  characters: Character[];
  loading: boolean;
  error: string | null;
  setCharacter: (character: Character | null) => void;
  createCharacter: (characterData: Omit<Character, 'id'>) => Promise<Character | null>;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  getCharacterById: (id: string) => Promise<Character | null>;
  deleteCharacter: (id: string) => Promise<void>;
  convertToCharacter: (characterSheet: any) => Character;
  isMagicClass: () => boolean;
  getUserCharacters: () => Promise<Character[]>;
  refreshCharacters: () => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType>({
  character: null,
  characters: [],
  loading: false,
  error: null,
  setCharacter: () => {},
  createCharacter: async () => null,
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  getCharacterById: async () => null,
  deleteCharacter: async () => {},
  convertToCharacter: (characterSheet: any) => characterSheet as Character,
  isMagicClass: () => false,
  getUserCharacters: async () => [],
  refreshCharacters: async () => {},
});

export const useCharacter = () => useContext(CharacterContext);

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCharacter = async () => {
      const lastCharacterId = localStorage.getItem('last-selected-character');
      if (lastCharacterId) {
        try {
          const storedCharacter = localStorage.getItem(`character_${lastCharacterId}`);
          if (storedCharacter) {
            const parsedCharacter = JSON.parse(storedCharacter);
            setCharacter(parsedCharacter);
          } else {
            const fetchedCharacter = await getCharacterById(lastCharacterId);
            if (fetchedCharacter) {
              setCharacter(fetchedCharacter);
            } else {
              setCharacter(createDefaultCharacter());
            }
          }
        } catch (error) {
          console.error("Failed to load character from localStorage:", error);
          setCharacter(createDefaultCharacter());
        }
      } else {
        setCharacter(createDefaultCharacter());
      }
    };

    loadCharacter();
    getUserCharacters();
  }, []);

  const createCharacterInContext = async (characterData: Omit<Character, 'id'>): Promise<Character | null> => {
    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("User not logged in.");
        return null;
      }

      const newCharacterData: Character = {
        ...characterData,
        userId: uid,
        id: uuidv4(),
        updatedAt: new Date().toISOString()
      } as Character;

      const newCharacter = await createCharacter(newCharacterData);

      if (newCharacter) {
        setCharacter(newCharacter);
        localStorage.setItem('last-selected-character', newCharacter.id);
        localStorage.setItem(`character_${newCharacter.id}`, JSON.stringify(newCharacter));
        toast({
          title: "Персонаж создан!",
          description: "Персонаж успешно создан.",
        });
        return newCharacter;
      } else {
        toast({
          title: "Ошибка создания",
          description: "Не удалось создать персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating character:", error);
      toast({
        title: "Ошибка создания",
        description: "Произошла ошибка при создании персонажа.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter((prevCharacter) => {
      if (prevCharacter) {
        const updatedCharacter = { ...prevCharacter, ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(`character_${updatedCharacter.id}`, JSON.stringify(updatedCharacter));
        return updatedCharacter;
      }
      return prevCharacter;
    });
  };

  const saveCurrentCharacter = async () => {
    if (!character) {
      console.warn("No character to save.");
      return;
    }

    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("User not logged in.");
        return;
      }

      const characterToSave = { 
        ...character, 
        userId: uid,
        updatedAt: new Date().toISOString()
      };
      await updateCharacterInDb(characterToSave);
      localStorage.setItem(`character_${character.id}`, JSON.stringify(characterToSave));
      toast({
        title: "Персонаж сохранен!",
        description: "Изменения успешно сохранены.",
      });
    } catch (error) {
      console.error("Error saving character:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменения. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const getCharacterById = async (id: string): Promise<Character | null> => {
    try {
      const fetchedCharacter = await getCharacter(id);
      if (fetchedCharacter) {
        // Ensure character has updatedAt field
        if (!fetchedCharacter.updatedAt) {
          fetchedCharacter.updatedAt = new Date().toISOString();
        }
        
        return fetchedCharacter as Character;
      } else {
        console.log("Персонаж не найден в базе данных, проверка localStorage...");
        const storedCharacter = localStorage.getItem(`character_${id}`);
        if (storedCharacter) {
          return JSON.parse(storedCharacter) as Character;
        }
        return null;
      }
    } catch (error) {
      console.error("Error fetching character:", error);
      return null;
    }
  };

  const deleteCharacter = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await deleteCharacterInDb(id);
      localStorage.removeItem(`character_${id}`);
      setCharacters(prev => prev.filter(char => char.id !== id));
      
      if (character && character.id === id) {
        setCharacter(null);
        localStorage.removeItem('last-selected-character');
      }
      
      toast({
        title: "Персонаж удален",
        description: "Персонаж успешно удален.",
      });
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить персонажа.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserCharacters = async (): Promise<Character[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock implementation for now
      const localCharacters: Character[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("character_")) {
          const characterString = localStorage.getItem(key);
          if (characterString) {
            const character = JSON.parse(characterString) as Character;
            localCharacters.push(character);
          }
        }
      }
      
      setCharacters(localCharacters);
      return localCharacters;
    } catch (error) {
      console.error("Error fetching characters:", error);
      setError("Не удалось загрузить персонажей");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const refreshCharacters = async (): Promise<void> => {
    await getUserCharacters();
  };

  const convertToCharacter = (characterSheet: any): Character => {
    // Simple implementation - assuming characterSheet has most of the required fields
    const defaultChar = createDefaultCharacter();
    return {
      ...defaultChar,
      ...characterSheet,
      updatedAt: new Date().toISOString()
    };
  };
  
  const isMagicClass = (): boolean => {
    if (!character) return false;
    
    const magicClasses = ['жрец', 'волшебник', 'бард', 'друид', 'колдун', 'чародей', 'паладин', 'следопыт',
                          'cleric', 'wizard', 'bard', 'druid', 'warlock', 'sorcerer', 'paladin', 'ranger'];
    
    return magicClasses.includes(character.class.toLowerCase());
  };

  return (
    <CharacterContext.Provider
      value={{
        character,
        characters,
        loading,
        error,
        setCharacter,
        createCharacter: createCharacterInContext,
        updateCharacter,
        saveCurrentCharacter,
        getCharacterById,
        deleteCharacter,
        convertToCharacter,
        isMagicClass,
        getUserCharacters,
        refreshCharacters
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export default CharacterProvider;
