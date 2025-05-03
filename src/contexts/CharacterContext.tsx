
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
import { auth } from "@/services/firebase"; 
import { characterService } from "@/services/sessionService";
import { getCurrentUid } from "@/utils/authHelpers";

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
  class: string;  // Изменено с необязательного (?) на обязательное
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
  saveCharacter: (char: Character) => Promise<Character>;
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

// Унифицируем ключи локального хранилища
const STORAGE_KEY = "dnd-characters"; // Единый ключ для всего приложения
const ACTIVE_CHARACTER_KEY = "dnd-active-character"; // Обновленный ключ для активного персонажа

export function CharacterProvider({ children }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [character, setCharacterState] = useState<Character | null>(null);
  const { currentUser, addCharacterToUser, removeCharacterFromUser } = useAuth();

  // При старте читаем из localStorage и Firebase Storage
  useEffect(() => {
    // Загружаем персонажей из Storage при первой загрузке
    const loadCharacters = async () => {
      try {
        const loadedCharacters = await characterService.getCharacters();
        if (loadedCharacters && loadedCharacters.length > 0) {
          setCharacters(loadedCharacters as Character[]);
          
          // Если есть сохраненный активный персонаж, пытаемся его найти среди загруженных
          const savedActiveCharacterId = localStorage.getItem(ACTIVE_CHARACTER_KEY);
          if (savedActiveCharacterId) {
            try {
              const activeChar = JSON.parse(savedActiveCharacterId);
              const foundCharacter = loadedCharacters.find(c => c.id === activeChar.id);
              if (foundCharacter) {
                setCharacterState(foundCharacter as Character);
              }
            } catch (e) {
              console.error("Ошибка при чтении активного персонажа из localStorage:", e);
            }
          }
        } else {
          // Если из Storage ничего не загрузилось, пробуем из localStorage
          const savedCharacters = localStorage.getItem(STORAGE_KEY);
          if (savedCharacters) {
            try {
              const parsedChars = JSON.parse(savedCharacters);
              setCharacters(parsedChars);
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
        }
      } catch (error) {
        console.error("Ошибка при загрузке персонажей:", error);
        
        // При ошибке загрузки из Storage - используем localStorage
        const savedCharacters = localStorage.getItem(STORAGE_KEY);
        if (savedCharacters) {
          try {
            setCharacters(JSON.parse(savedCharacters));
          } catch (e) {
            console.error("Ошибка при чтении персонажей из localStorage:", e);
          }
        }
      }
    };
    
    loadCharacters();
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
    if ((char.className?.includes('Чародей') || char.class?.includes('Чародей')) && !char.sorceryPoints) {
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
      
      // Убеждаемся, что поле class заполнено
      if (!updatedChar.class && updatedChar.className) {
        updatedChar.class = updatedChar.className;
      }
      
      // Добавляем очки чародея, если персонаж стал чародеем
      if ((updates.className?.includes('Чародей') || updates.class?.includes('Чародей')) && 
          !prev.className?.includes('Чародей') && !prev.class?.includes('Чародей')) {
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
  
  // Метод для сохранения персонажа - теперь используем Firebase Storage
  const saveCharacter = useCallback(async (charData: Character): Promise<Character> => {
    const now = new Date().toISOString();
    
    try {
      // Получаем UID текущего пользователя
      const uid = getCurrentUid();
      
      // Убеждаемся, что поле class заполнено
      if (!charData.class && charData.className) {
        charData.class = charData.className;
      } else if (!charData.class) {
        // Если ни class, ни className не заполнены, устанавливаем значение по умолчанию
        charData.class = "Воин";
        charData.className = "Воин";
      }
      
      // Проверяем, новый это персонаж или обновление существующего
      if (charData.id) {
        // Обновление существующего персонажа
        const updatedChar = {
          ...charData,
          userId: uid, // Обновляем userId на случай, если персонаж был создан без авторизации
          updatedAt: now
        } as Character;
        
        // Сохраняем в Firebase Storage, только если пользователь авторизован
        if (uid) {
          const saved = await characterService.saveCharacter(updatedChar);
          if (!saved) {
            throw new Error("Не удалось сохранить персонажа в Firebase Storage");
          }
        } else {
          // Если пользователь не авторизован, сохраняем только локально
          console.warn("Пользователь не авторизован. Персонаж сохранен только локально.");
        }
        
        // Обновляем локальный список
        setCharacters(prevChars => 
          prevChars.map(c => c.id === charData.id ? updatedChar : c)
        );
        
        console.log("Обновлен персонаж:", updatedChar.name);
        return updatedChar;
        
      } else {
        // Создание нового персонажа
        const newChar: Character = {
          ...charData,
          id: uuidv4(),
          userId: uid, // Привязываем к текущему пользователю если авторизован
          createdAt: now,
          updatedAt: now
        };
        
        // Сохраняем в Firebase Storage, только если пользователь авторизован
        if (uid) {
          const saved = await characterService.saveCharacter(newChar);
          if (!saved) {
            throw new Error("Не удалось сохранить персонажа в Firebase Storage");
          }
          
          // Если есть авторизованный пользователь, добавляем персонажа к нему
          if (currentUser) {
            try {
              await addCharacterToUser(newChar.id);
              toast.success(`Персонаж ${newChar.name} создан и привязан к аккаунту`);
            } catch (err) {
              console.error("Ошибка при привязке персонажа к пользователю:", err);
            }
          }
        } else {
          // Если пользователь не авторизован, сохраняем только локально
          console.warn("Пользователь не авторизован. Персонаж сохранен только локально.");
        }
        
        // Обновляем локальный список
        setCharacters(prevChars => [...prevChars, newChar]);
        
        console.log("Создан новый персонаж:", newChar.name);
        return newChar;
      }
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast.error("Не удалось сохранить персонажа");
      throw error;
    }
  }, [currentUser, addCharacterToUser]);
  
  // Метод для удаления персонажа
  const deleteCharacter = useCallback(async (id: string): Promise<void> => {
    try {
      // Если текущий активный персонаж - удаляемый, очищаем его
      if (character?.id === id) {
        clearCharacter();
      }
      
      // Удаляем из Firebase Storage
      await characterService.deleteCharacter(id);
      
      // Удаляем из локального списка персонажей
      setCharacters(prevChars => prevChars.filter(c => c.id !== id));
      
      // Если есть авторизованный пользователь, удаляем персонажа у него
      if (currentUser) {
        await removeCharacterFromUser(id);
      }
      
      toast.success("Персонаж успешно удалён");
      console.log("Удален персонаж с ID:", id);
    } catch (error) {
      console.error("Ошибка при удалении персонажа:", error);
      toast.error("Не удалось удалить персонажа");
      throw error;
    }
  }, [character, clearCharacter, currentUser, removeCharacterFromUser]);
  
  // Получение персонажей текущего пользователя
  const getUserCharacters = useCallback(() => {
    // Проверяем, что characters - это массив
    if (!Array.isArray(characters)) {
      console.error("characters is not an array:", characters);
      return [];
    }

    if (!currentUser) return characters; // Возвращаем все персонажи, если пользователь не аутентифицирован
    
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
        setCharacter,
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
