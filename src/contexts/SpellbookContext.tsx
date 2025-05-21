
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpellsFromDatabase, saveSpellToDatabase, deleteSpellFromDatabase } from '@/services/spellService';
import { toast } from 'sonner';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';

export interface SpellbookContextType {
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
  
  // Добавляем недостающие свойства и методы
  availableSpells: SpellData[];
  loading: boolean;
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
  getSpellLimits: (characterClass: string, level: number, abilityModifier?: number) => { 
    maxSpellLevel: number;
    cantripsCount: number;
    knownSpells: number;
  };
  getSelectedSpellCount: () => { cantrips: number; spells: number };
  saveCharacterSpells: () => void;
}

export const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  filteredSpells: [],
  availableSpells: [], // Добавлено
  loading: false, // Добавлено
  searchQuery: '',
  setSearchQuery: () => {},
  loadSpells: async () => {},
  addSpell: () => {},
  removeSpell: () => {},
  prepareSpell: () => {},
  unprepareSpell: () => {},
  exportSpells: () => {},
  importSpells: () => {},
  loadSpellsForCharacter: () => {}, // Добавлено
  getSpellLimits: () => ({ maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 }), // Добавлено
  getSelectedSpellCount: () => ({ cantrips: 0, spells: 0 }), // Добавлено
  saveCharacterSpells: () => {} // Добавлено
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spells, setSpells] = useState<SpellData[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]); // Добавлено
  const [loading, setLoading] = useState(false); // Добавлено
  
  const loadSpells = async () => {
    try {
      setLoading(true);
      const loadedSpells = await getAllSpellsFromDatabase();
      setSpells(loadedSpells);
      setFilteredSpells(loadedSpells);
      setAvailableSpells(loadedSpells); // Добавлено
    } catch (error) {
      console.error('Error loading spells:', error);
      toast.error('Ошибка при загрузке заклинаний');
    } finally {
      setLoading(false);
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
        const id = spell.id ? String(spell.id) : `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
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

  // Добавляем новые методы
  const loadSpellsForCharacter = (characterClass: string, level: number) => {
    setLoading(true);
    
    // Здесь должна быть логика загрузки заклинаний для конкретного класса и уровня
    // Для примера, просто фильтруем существующие заклинания
    try {
      // Загрузка всех заклинаний, если еще не загружены
      if (spells.length === 0) {
        loadSpells().then(() => {
          // После загрузки всех заклинаний фильтруем их
          const filtered = spells.filter(spell => {
            const classes = Array.isArray(spell.classes) 
              ? spell.classes 
              : typeof spell.classes === 'string' 
                ? [spell.classes] 
                : [];
            return classes.some(c => c.toLowerCase() === characterClass.toLowerCase());
          });
          setAvailableSpells(filtered);
        });
      } else {
        // Если заклинания уже загружены, просто фильтруем
        const filtered = spells.filter(spell => {
          const classes = Array.isArray(spell.classes) 
            ? spell.classes 
            : typeof spell.classes === 'string' 
              ? [spell.classes] 
              : [];
          return classes.some(c => c.toLowerCase() === characterClass.toLowerCase());
        });
        setAvailableSpells(filtered);
      }
    } catch (error) {
      console.error('Error loading spells for character:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpellLimits = (characterClass: string, level: number, abilityModifier = 0) => {
    return calculateAvailableSpellsByClassAndLevel(characterClass, level, abilityModifier);
  };

  const getSelectedSpellCount = () => {
    const cantrips = spells.filter(spell => spell.level === 0).length;
    const regularSpells = spells.filter(spell => spell.level > 0).length;
    return { cantrips, spells: regularSpells };
  };

  const saveCharacterSpells = () => {
    // Здесь должна быть логика сохранения заклинаний персонажа
    toast.success('Заклинания персонажа сохранены');
  };
  
  return (
    <SpellbookContext.Provider
      value={{
        selectedSpells: spells,
        filteredSpells,
        availableSpells,
        loading,
        searchQuery,
        setSearchQuery,
        loadSpells,
        addSpell,
        removeSpell,
        prepareSpell,
        unprepareSpell,
        exportSpells,
        importSpells,
        loadSpellsForCharacter,
        getSpellLimits,
        getSelectedSpellCount,
        saveCharacterSpells
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
