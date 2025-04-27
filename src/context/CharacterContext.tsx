import { createContext, useContext, useState, ReactNode } from "react";

interface CharacterAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface CharacterData {
  race: string;
  class: string;
  attributes: CharacterAttributes;
}

interface CharacterContextType {
  character: CharacterData;
  setCharacter: (data: Partial<CharacterData>) => void;
}

const defaultCharacter: CharacterData = {
  race: "",
  class: "",
  attributes: {
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  },
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [character, setCharacterState] = useState<CharacterData>(defaultCharacter);

  const setCharacter = (data: Partial<CharacterData>) => {
    setCharacterState(prev => ({
      ...prev,
      ...data,
      attributes: {
        ...prev.attributes,
        ...(data.attributes || {}),
      },
    }));
  };

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }
  return context;
};
