
import { useState, useCallback, useEffect } from 'react';
import { SpellData, convertSpellDataToCharacterSpell, convertCharacterSpellToSpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { filterSpells } from './filterUtils';

export type SpellFilter = {
  search: string;
  level: number[];
  school: string[];
  className: string[];
  ritual: boolean | null;
  concentration: boolean | null;
};

export interface UseSpellbookProps {
  initialSpells?: SpellData[];
}

export const useSpellbook = ({ initialSpells = [] }: UseSpellbookProps = {}) => {
  const [spells, setSpells] = useState<SpellData[]>(initialSpells);
  const [filteredSpells, setFilteredSpells] = useState<SpellData[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [filter, setFilter] = useState<SpellFilter>({
    search: '',
    level: [],
    school: [],
    className: [],
    ritual: null,
    concentration: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для установки заклинаний
  const setAllSpells = useCallback((spellsData: SpellData[]) => {
    setSpells(spellsData);
  }, []);

  // Функция для добавления заклинаний из Character
  const addSpellsFromCharacter = useCallback((characterSpells: CharacterSpell[]) => {
    if (!characterSpells || characterSpells.length === 0) return;
    
    const convertedSpells = characterSpells.map(spell => convertCharacterSpellToSpellData(spell));
    setSpells(prev => {
      // Объединяем и удаляем дубликаты по id
      const combined = [...prev, ...convertedSpells];
      const uniqueSpells = Array.from(
        new Map(combined.map(spell => [spell.id, spell])).values()
      );
      return uniqueSpells;
    });
    
    // Добавляем в выбранные заклинания
    setSelectedSpells(prev => {
      // Объединяем и удаляем дубликаты по id
      const combined = [...prev, ...convertedSpells];
      const uniqueSpells = Array.from(
        new Map(combined.map(spell => [spell.id, spell])).values()
      );
      return uniqueSpells;
    });
  }, []);
  
  // Функция для выбора заклинания
  const selectSpell = useCallback((spell: SpellData) => {
    setSelectedSpells(prev => [...prev, spell]);
  }, []);

  // Функция для снятия выбора заклинания
  const unselectSpell = useCallback((spellId: string | number) => {
    setSelectedSpells(prev => prev.filter(spell => spell.id !== spellId));
  }, []);

  // Функция для проверки, выбрано ли заклинание
  const isSpellSelected = useCallback((spellId: string | number) => {
    return selectedSpells.some(spell => spell.id === spellId);
  }, [selectedSpells]);

  // Функция для установки фильтра
  const updateFilter = useCallback((newFilter: Partial<SpellFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  // Функция для сброса фильтра
  const resetFilter = useCallback(() => {
    setFilter({
      search: '',
      level: [],
      school: [],
      className: [],
      ritual: null,
      concentration: null,
    });
  }, []);

  // Применение фильтра при его изменении
  useEffect(() => {
    const result = filterSpells(spells, filter);
    setFilteredSpells(result);
  }, [spells, filter]);
  
  // Инициализация начальными заклинаниями
  useEffect(() => {
    if (initialSpells && initialSpells.length > 0) {
      setSpells(initialSpells);
    }
  }, [initialSpells]);

  return {
    spells,
    filteredSpells,
    selectedSpells,
    filter,
    loading,
    error,
    setAllSpells,
    setSpells,
    addSpellsFromCharacter,
    selectSpell,
    unselectSpell,
    isSpellSelected,
    updateFilter,
    resetFilter,
    setSelectedSpells
  };
};

export default useSpellbook;
