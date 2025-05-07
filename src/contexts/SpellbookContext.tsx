// Import statements
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Spell, SpellList } from '@/types/spells';

interface SpellbookContextType {
  allSpells: Spell[];
  spellLists: SpellList[];
  addSpellList: (name: string) => void;
  removeSpellList: (id: string) => void;
  addSpellToList: (spellListId: string, spellId: string) => void;
  removeSpellFromList: (spellListId: string, spellId: string) => void;
  renameSpellList: (spellListId: string, newName: string) => void;
  filterSpellsByClass: (className: string) => Spell[];
}

const SpellbookContext = createContext<SpellbookContextType | undefined>(undefined);

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allSpells, setAllSpells] = useState<Spell[]>([]);
  const [spellLists, setSpellLists] = useState<SpellList[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Load spells from local storage
      const savedSpells = localStorage.getItem('dnd-spells');
      if (savedSpells) {
        setAllSpells(JSON.parse(savedSpells));
      }

      // Load spell lists from local storage
      const savedSpellLists = localStorage.getItem('dnd-spell-lists');
      if (savedSpellLists) {
        setSpellLists(JSON.parse(savedSpellLists));
      }

      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      // Save spells to local storage
      localStorage.setItem('dnd-spells', JSON.stringify(allSpells));

      // Save spell lists to local storage
      localStorage.setItem('dnd-spell-lists', JSON.stringify(spellLists));
    }
  }, [allSpells, spellLists, initialized]);

  const addSpellList = (name: string) => {
    const newSpellList: SpellList = {
      id: Date.now().toString(),
      name,
      spells: []
    };
    setSpellLists(prev => [...prev, newSpellList]);
  };

  const removeSpellList = (id: string) => {
    setSpellLists(prev => prev.filter(list => list.id !== id));
  };

  const addSpellToList = (spellListId: string, spellId: string) => {
    setSpellLists(prev => {
      return prev.map(list => {
        if (list.id === spellListId) {
          return {
            ...list,
            spells: [...list.spells, spellId]
          };
        }
        return list;
      });
    });
  };

  const removeSpellFromList = (spellListId: string, spellId: string) => {
    setSpellLists(prev => {
      return prev.map(list => {
        if (list.id === spellListId) {
          return {
            ...list,
            spells: list.spells.filter(id => id !== spellId)
          };
        }
        return list;
      });
    });
  };

  const renameSpellList = (spellListId: string, newName: string) => {
    setSpellLists(prev => {
      return prev.map(list => {
        if (list.id === spellListId) {
          return {
            ...list,
            name: newName
          };
        }
        return list;
      });
    });
  };
  
  const filterSpellsByClass = (className: string) => {
    // Fix the replace issue by checking if classes is an array first
    return allSpells.filter(spell => {
      if (Array.isArray(spell.classes)) {
        return spell.classes.includes(className);
      }
      // If classes is a string, convert to array and check
      if (typeof spell.classes === 'string') {
        return spell.classes.split(',').map(c => c.trim()).includes(className);
      }
      return false;
    });
  };

  return (
    <SpellbookContext.Provider value={{
      allSpells,
      spellLists,
      addSpellList,
      removeSpellList,
      addSpellToList,
      removeSpellFromList,
      renameSpellList,
      filterSpellsByClass
    }}>
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};
