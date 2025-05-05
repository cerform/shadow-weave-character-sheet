
import { useState, useEffect } from 'react';
import { spells as allSpells, getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData, convertSpellDataToCharacterSpell } from '@/types/spells';

export const useSpellbook = (characterClass = '', characterLevel = 1) => {
  const [loading, setLoading] = useState(true);
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, CharacterSpell[]>>({});

  // Load spells based on class and level
  useEffect(() => {
    if (characterClass) {
      // Get spells available to this class
      const classSpells = getSpellsByClass(characterClass);
      
      // Filter by level (spells available should be character level / 2 rounded up)
      const maxSpellLevel = Math.ceil(characterLevel / 2);
      const filteredSpells = classSpells.filter(spell => spell.level <= maxSpellLevel);
      
      // Set the available spells
      setAvailableSpells(filteredSpells);
      
      // Group spells by level
      const groupedSpells: Record<number, CharacterSpell[]> = {};
      
      for (let i = 0; i <= 9; i++) {
        const spellsForLevel = filteredSpells.filter(spell => spell.level === i);
        if (spellsForLevel.length > 0) {
          groupedSpells[i] = spellsForLevel;
        }
      }
      
      setSpellsByLevel(groupedSpells);
      setLoading(false);
    }
  }, [characterClass, characterLevel]);

  // Handle updating selected spells
  const updateSelectedSpells = (spells: SpellData[] | CharacterSpell[]) => {
    // Convert SpellData[] to CharacterSpell[] if necessary
    const convertedSpells: CharacterSpell[] = spells.map(spell => {
      if ('school' in spell && typeof spell.school === 'string') {
        return convertSpellDataToCharacterSpell(spell as SpellData);
      }
      return spell as CharacterSpell;
    });
    
    setSelectedSpells(convertedSpells);
  };

  // Add a spell to selected spells
  const addSpell = (spell: CharacterSpell) => {
    if (!selectedSpells.some(s => s.name === spell.name)) {
      setSelectedSpells([...selectedSpells, spell]);
    }
  };

  // Remove a spell from selected spells
  const removeSpell = (spellName: string) => {
    setSelectedSpells(selectedSpells.filter(spell => spell.name !== spellName));
  };

  // Toggle prepared status of a spell
  const togglePrepared = (spellName: string) => {
    setSelectedSpells(
      selectedSpells.map(spell =>
        spell.name === spellName
          ? { ...spell, prepared: !spell.prepared }
          : spell
      )
    );
  };

  return {
    loading,
    availableSpells,
    selectedSpells,
    spellsByLevel,
    updateSelectedSpells,
    addSpell,
    removeSpell,
    togglePrepared
  };
};

export * from './useSpellbook';
