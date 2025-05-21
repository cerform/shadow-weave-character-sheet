
import React, { createContext, useContext, useState } from 'react';
import { SpellData } from '@/types/spells';
import { getAllSpellsFromDatabase, saveSpellToDatabase, deleteSpellFromDatabase } from '@/services/spellService';
import { toast } from 'sonner';

interface SpellbookContextType {
  selectedSpells: SpellData[];
  filteredSpells: SpellData[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadSpells: () => Promise<void>;
  addSpell: (spell: SpellData) => void;
  removeSpell: (id: string) => void;
  prepareSpell: (id: string) => void;
  unprepareSpell: (id: string) => void;
  exportSpells: () => void;
  importSpells: (spells: SpellData[]) => void;
}

const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  filteredSpells: [],
  searchQuery: '',
  setSearchQuery: () => {},
  loadSpells: async () => {},
  addSpell: () => {},
  removeSpell: () => {},
  prepareSpell: () => {},
  unprepareSpell: () => {},
  exportSpells: () => {},
  importSpells: () => {}
});

export const SpellbookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadSpells = async () => {
    try {
      const loadedSpells = await getAllSpellsFromDatabase();
      setSpells(loadedSpells);
      setFilteredSpells(loadedSpells);
    } catch (error) {
      console.error('Error loading spells:', error);
      toast.error('Ошибка при загрузке заклинаний');
    }
  };
  
  const addSpell = async (spell: SpellData) => {
    try {
      const id = await saveSpellToDatabase(spell);
      const newSpell = { ...spell, id };
      setSpells(prev => [...prev, newSpell]);
      setFilteredSpells(prev => [...prev, newSpell]);
      toast.success('Заклинание добавлено');
    } catch (error) {
      console.error('Error adding spell:', error);
      toast.error('Ошибка при добавлении заклинания');
    }
  };
  
  const removeSpell = async (id: string) => {
    try {
      await deleteSpellFromDatabase(id);
      setSpells(prev => prev.filter(spell => spell.id !== id));
      setFilteredSpells(prev => prev.filter(spell => spell.id !== id));
      toast.success('Заклинание удалено');
    } catch (error) {
      console.error('Error removing spell:', error);
      toast.error('Ошибка при удалении заклинания');
    }
  };
  
  const prepareSpell = (id: string) => {
    setSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: true } : spell
      )
    );
    setFilteredSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: true } : spell
      )
    );
  };
  
  const unprepareSpell = (id: string) => {
    setSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: false } : spell
      )
    );
    setFilteredSpells(prev => 
      prev.map(spell => 
        spell.id === id ? { ...spell, prepared: false } : spell
      )
    );
  };
  
  const exportSpells = () => {
    try {
      const dataStr = JSON.stringify(spells, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `spellbook_export_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Экспорт заклинаний выполнен успешно');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте заклинаний');
    }
  };
  
  const importSpells = (importedSpells: SpellData[]) => {
    try {
      if (!Array.isArray(importedSpells)) {
        toast.error('Неверный формат заклинаний');
        return;
      }
      
      // Проверяем идентификаторы и генерируем новые при необходимости
      const processedSpells = importedSpells.map(spell => {
        // Если есть id, используем его, иначе генерируем временный
        const id = spell.id?.toString() || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        return {
          ...spell,
          id
        };
      });
      
      // Добавляем новые заклинания к существующим
      setSpells(prev => [...prev, ...processedSpells]);
      setFilteredSpells(prev => [...prev, ...processedSpells]);
      
      toast.success(`Импортировано ${processedSpells.length} заклинаний`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте заклинаний');
    }
  };
  
  return (
    <SpellbookContext.Provider
      value={{
        selectedSpells: spells,
        filteredSpells,
        searchQuery,
        setSearchQuery,
        loadSpells,
        addSpell,
        removeSpell,
        prepareSpell,
        unprepareSpell,
        exportSpells,
        importSpells
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
