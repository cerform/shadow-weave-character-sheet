
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

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

export interface Character {
  id?: string;
  name: string;
  race: string;
  subrace?: string; // Добавлено поле подрасы
  className: string;
  level: number;
  abilities: AbilityScores;
  spellsKnown: Spell[];
  spellSlots: SpellSlots;
  gender?: string;
  alignment?: string;
  background?: string;
  equipment?: string[];
  languages?: string[];
  proficiencies?: string[];
  // Добавлено поле для отслеживания темы персонажа
  theme?: string;
}

// Контекст и его тип
export interface CharacterContextType {
  character: Character | null;
  setCharacter: (char: Character) => void;
  clearCharacter: () => void;
  updateCharacter: (updates: Partial<Character>) => void; // Добавлен метод для частичного обновления
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  clearCharacter: () => {},
  updateCharacter: () => {},
});

interface Props {
  children: ReactNode;
}

const STORAGE_KEY = "dnd5e_character";

export function CharacterProvider({ children }: Props) {
  const [character, setCharacterState] = useState<Character | null>(null);

  // При старте читаем из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCharacterState(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка при чтении персонажа из localStorage:", e);
      }
    }
  }, []);

  // Сохраняем в localStorage при изменении
  useEffect(() => {
    if (character) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
      console.log("Персонаж сохранен:", character.name);
      
      // Если у персонажа есть тема, применяем её
      if (character.theme) {
        localStorage.setItem('theme', character.theme);
        document.body.className = `theme-${character.theme}`;
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [character]);

  const setCharacter = useCallback((char: Character) => {
    console.log("Установка персонажа:", char.name);
    setCharacterState(char);
  }, []);

  // Добавлен метод для частичного обновления персонажа
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacterState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      console.log("Обновление персонажа:", updated.name, updates);
      return updated;
    });
  }, []);

  const clearCharacter = useCallback(() => {
    console.log("Удаление персонажа");
    setCharacterState(null);
  }, []);

  return (
    <CharacterContext.Provider
      value={{ character, setCharacter, clearCharacter, updateCharacter }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
