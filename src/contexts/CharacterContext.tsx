import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from "sonner";

// Типы для заклинания и персонажа
export interface Spell {
  id: string;
  name: string;
  level: number;
  // сюда можно дописать school, components и т.д.
}

export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

export interface SpellSlots {
  [spellLevel: number]: {
    max: number;
    used: number;
  };
}

export interface SorceryPoints {
  current: number;
  max: number;
}

export interface Character {
  id: string;
  userId?: string; 
  name: string;
  race: string;
  subrace?: string; 
  className: string;
  level: number;
  abilities: AbilityScores;
  spellsKnown?: Spell[];
  spells?: string[];
  spellSlots: SpellSlots;
  gender?: string;
  alignment?: string;
  background?: string;
  equipment?: string[];
  languages?: string[];
  proficiencies?: string[];
  // Добавляем владение навыками
  skillProficiencies?: {
    [skillName: string]: boolean;
  };
  maxHp?: number;
  currentHp?: number;
  sorceryPoints?: SorceryPoints;
  theme?: string;
  createdAt: string;
  updatedAt: string;
  savingThrowProficiencies?: {
    [ability: string]: boolean;
  };
}

// Контекст и его тип
export interface CharacterContextType {
  characters: Character[];
  character: Character | null;
  setCharacter: (char: Character) => void;
  clearCharacter: () => void;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCharacter: (char: Partial<Character>) => Promise<Character>;
  deleteCharacter: (id: string) => Promise<void>;
  getUserCharacters: () => Character[];
}

export const CharacterContext = createContext<CharacterContextType>({
  characters: [],
  character: null,
  setCharacter: () => {},
  clearCharacter: () => {},
  updateCharacter: () => {},
  saveCharacter: async () => {
    throw new Error('Not implemented');
  },
  deleteCharacter: async () => {},
  getUserCharacters: () => [],
});

interface Props {
  children: ReactNode;
}

const STORAGE_KEY = "dnd5e_characters";
const ACTIVE_CHARACTER_KEY = "dnd5e_active_character";

export function CharacterProvider({ children }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [character, setCharacterState] = useState<Character | null>(null);
  const { currentUser, addCharacterToUser, removeCharacterFromUser } = useAuth();

  // При старте читаем из localStorage
  useEffect(() => {
    const savedCharacters = localStorage.getItem(STORAGE_KEY);
    if (savedCharacters) {
      try {
        setCharacters(JSON.parse(savedCharacters));
      } catch (e) {
        console.error("Ошибка при чтении персонажей из localStorage:", e);
      }
    }
    
    const savedActiveCharacter = localStorage.getItem(ACTIVE_CHARACTER_KEY);
    if (savedActiveCharacter) {
      try {
        setCharacterState(JSON.parse(savedActiveCharacter));
      } catch (e) {
        console.error("Ошибка при чтении активного персонажа из localStorage:", e);
      }
    }
  }, []);

  // Сохраняем список персонажей в localStorage при изменении
  useEffect(() => {
    if (characters.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    }
  }, [characters]);

  // Сохраняем активного персонажа при изменении
  useEffect(() => {
    if (character) {
      localStorage.setItem(ACTIVE_CHARACTER_KEY, JSON.stringify(character));
      
      // Если у персонажа есть тема, применяем её
      if (character.theme) {
        localStorage.setItem('theme', character.theme);
        document.body.className = `theme-${character.theme}`;
      }
    } else {
      localStorage.removeItem(ACTIVE_CHARACTER_KEY);
    }
  }, [character]);

  const setCharacter = useCallback((char: Character) => {
    console.log("Установка персонажа:", char.name);
    
    // Если персонаж - чародей, добавляем очки чародея
    if (char.className?.includes('Чародей') && !char.sorceryPoints) {
      char.sorceryPoints = {
        current: char.level,
        max: char.level
      };
    }
    
    setCharacterState(char);
  }, []);

  // Метод для частичного обновления персонажа
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacterState((prev) => {
      if (!prev) return null;
      
      // Проверяем, есть ли обновление для класса
      const updatedChar = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      
      // Добавляем очки чародея, если персонаж стал чародеем
      if (updates.className?.includes('Чародей') && !prev.className?.includes('Чародей')) {
        updatedChar.sorceryPoints = {
          current: updatedChar.level,
          max: updatedChar.level
        };
      }
      
      console.log("Обновление персонажа:", updatedChar.name, updates);
      
      // Обновляем также в общем списке персонажей
      setCharacters(prevChars => 
        prevChars.map(c => c.id === prev.id ? updatedChar : c)
      );
      
      return updatedChar;
    });
  }, []);

  const clearCharacter = useCallback(() => {
    console.log("Удаление активного персонажа");
    setCharacterState(null);
  }, []);
  
  // Метод для сохранения персонажа
  const saveCharacter = useCallback(async (charData: Partial<Character>): Promise<Character> => {
    const now = new Date().toISOString();
    
    // Проверяем, новый это персонаж или обновление существующего
    if (charData.id) {
      // Обновление существующего персонажа
      const updatedChar = {
        ...charData,
        updatedAt: now
      } as Character;
      
      setCharacters(prevChars => 
        prevChars.map(c => c.id === charData.id ? updatedChar : c)
      );
      
      console.log("Обновлен персонаж:", updatedChar.name);
      return updatedChar;
    } else {
      // Создание нового персонажа
      const newChar: Character = {
        ...charData as Omit<Character, 'id' | 'createdAt' | 'updatedAt'>,
        id: uuidv4(),
        userId: currentUser?.id, // Привязываем к текущему пользователю
        createdAt: now,
        updatedAt: now
      } as Character;
      
      setCharacters(prevChars => [...prevChars, newChar]);
      
      // Если есть авторизованный пользователь, добавляем персонажа к нему
      if (currentUser) {
        try {
          await addCharacterToUser(newChar.id);
          toast.success(`Персонаж ${newChar.name} создан и привязан к аккаунту`);
        } catch (err) {
          console.error("Ошибка при привязке персонажа к пользователю:", err);
        }
      }
      
      console.log("Создан новый персонаж:", newChar.name);
      return newChar;
    }
  }, [currentUser, addCharacterToUser]);
  
  // Метод для удаления персонажа
  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    // Если текущий активный персонаж - удаляемый, очищаем его
    if (character?.id === id) {
      clearCharacter();
    }
    
    // Удаляем из списка персонажей
    setCharacters(prevChars => prevChars.filter(c => c.id !== id));
    
    // Если есть авторизованный пользователь, удаляем персонажа у него
    if (currentUser) {
      await removeCharacterFromUser(id);
    }
    
    console.log("Удален персонаж с ID:", id);
  }, [character, clearCharacter, currentUser, removeCharacterFromUser]);
  
  // Получение персонажей текущего пользователя
  const getUserCharacters = useCallback(() => {
    if (!currentUser) return [];
    
    // Если пользователь - DM, возвращаем все персонажи
    if (currentUser.isDM) {
      return characters;
    }
    
    // Иначе только персонажи этого пользователя
    return characters.filter(char => 
      char.userId === currentUser.id || 
      (currentUser.characters && currentUser.characters.includes(char.id))
    );
  }, [characters, currentUser]);

  return (
    <CharacterContext.Provider
      value={{ 
        characters, 
        character, 
        setCharacter,  // This line was missing! Adding it back
        clearCharacter, 
        updateCharacter,
        saveCharacter,
        deleteCharacter,
        getUserCharacters
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

// Хук для использования контекста
export const useCharacter = () => {
  const context = React.useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
