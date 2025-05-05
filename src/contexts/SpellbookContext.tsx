
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SpellData } from '@/types/spells';

interface SpellbookContextType {
  selectedSpells: SpellData[];
  setSelectedSpells: (spells: SpellData[]) => void;
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
}

const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  setSelectedSpells: () => {},
  addSpell: () => {},
  removeSpell: () => {},
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);

  const addSpell = (spell: SpellData) => {
    if (!selectedSpells.some(s => s.id === spell.id)) {
      setSelectedSpells([...selectedSpells, spell]);
    }
  };

  const removeSpell = (spellId: string) => {
    setSelectedSpells(selectedSpells.filter(spell => spell.id !== spellId));
  };

  return (
    <SpellbookContext.Provider
      value={{
        selectedSpells,
        setSelectedSpells,
        addSpell,
        removeSpell,
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
