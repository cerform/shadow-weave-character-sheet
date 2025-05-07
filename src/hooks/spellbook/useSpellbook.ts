
import { useState, useMemo } from 'react';
import { SpellData, SpellFilter, convertSpellDataToCharacterSpell } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpells } from '@/data/spells/index';
import { filterSpells } from '@/utils/spellHelpers';

export interface UseSpellbookResult {
  spells: SpellData[];
  filteredSpells: SpellData[];
  filter: SpellFilter;
  setFilter: (filter: SpellFilter) => void;
  addSpellToCharacter: (spell: SpellData | string) => void;
  removeSpellFromCharacter: (spellId: string) => void;
  togglePrepared: (spellId: string) => void;
  characterSpells: CharacterSpell[];
  loading: boolean;
}

export const useSpellbookManager = (
  initialCharacterSpells: CharacterSpell[] = [],
  characterClass?: string,
): UseSpellbookResult => {
  const [filter, setFilter] = useState<SpellFilter>({});
  const [characterSpells, setCharacterSpells] = useState<CharacterSpell[]>(initialCharacterSpells);
  const [loading, setLoading] = useState(false);
  
  // Получение всех заклинаний
  const spells = useMemo(() => getAllSpells(), []);
  
  // Фильтрация заклинаний
  const filteredSpells = useMemo(() => {
    // Если указан класс персонажа, добавляем его к фильтру
    const fullFilter = characterClass 
      ? { ...filter, class: characterClass } 
      : filter;
    
    return filterSpells(spells, fullFilter);
  }, [spells, filter, characterClass]);
  
  // Добавление заклинания персонажу
  const addSpellToCharacter = (spell: SpellData | string) => {
    if (typeof spell === 'string') {
      // Если передан ID заклинания, находим его в списке всех заклинаний
      const foundSpell = spells.find(s => s.id === spell);
      if (!foundSpell) return;
      
      const newSpell = convertSpellDataToCharacterSpell(foundSpell);
      setCharacterSpells(prev => [...prev, newSpell]);
    } else {
      // Если передано само заклинание
      const newSpell = convertSpellDataToCharacterSpell(spell);
      setCharacterSpells(prev => [...prev, newSpell]);
    }
  };
  
  // Удаление заклинания у персонажа
  const removeSpellFromCharacter = (spellId: string) => {
    setCharacterSpells(prev => prev.filter(spell => spell.id !== spellId));
  };
  
  // Переключение статуса "подготовлено" для заклинания
  const togglePrepared = (spellId: string) => {
    setCharacterSpells(prev => 
      prev.map(spell => 
        spell.id === spellId 
          ? { ...spell, prepared: !spell.prepared } 
          : spell
      )
    );
  };
  
  return {
    spells,
    filteredSpells,
    filter,
    setFilter,
    addSpellToCharacter,
    removeSpellFromCharacter,
    togglePrepared,
    characterSpells,
    loading
  };
};

export default useSpellbookManager;
