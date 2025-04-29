
// src/contexts/CharacterContext.tsx

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
}

// Контекст и его тип
export interface CharacterContextType {
  character: Character | null;
  setCharacter: (char: Character) => void;
  clearCharacter: () => void;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  clearCharacter: () => {},
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
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [character]);

  const setCharacter = useCallback((char: Character) => {
    console.log("Установка персонажа:", char.name);
    setCharacterState(char);
  }, []);

  const clearCharacter = useCallback(() => {
    console.log("Удаление персонажа");
    setCharacterState(null);
  }, []);

  return (
    <CharacterContext.Provider
      value={{ character, setCharacter, clearCharacter }}
    >
      {children}
    </CharacterContext.Provider>
  );
}
