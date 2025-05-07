
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { Spell, SpellList } from '@/types/spells';

export interface SpellbookContextType {
  selectedSpells: CharacterSpell[];
  availableSpells: Spell[];
  addSpell: (spell: CharacterSpell) => void;
  removeSpell: (spellName: string) => void;
  getSpellLimits: (characterClass: string, level: number) => { maxKnown: number; maxPrepared: number };
  getSelectedSpellCount: () => number;
  saveCharacterSpells: (character: Character) => void;
  loadSpellsForCharacter: (character: Character) => void;
}

export const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  availableSpells: [],
  addSpell: () => {},
  removeSpell: () => {},
  getSpellLimits: () => ({ maxKnown: 0, maxPrepared: 0 }),
  getSelectedSpellCount: () => 0,
  saveCharacterSpells: () => {},
  loadSpellsForCharacter: () => {},
});

interface SpellbookProviderProps {
  children: ReactNode;
}

export const SpellbookProvider: React.FC<SpellbookProviderProps> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);

  const addSpell = (spell: CharacterSpell) => {
    setSelectedSpells([...selectedSpells, spell]);
  };

  const removeSpell = (spellName: string) => {
    setSelectedSpells(selectedSpells.filter(spell => spell.name !== spellName));
  };

  const getSpellLimits = (characterClass: string, level: number) => {
    // Примерные значения, можно настроить под D&D правила
    return { maxKnown: level * 2, maxPrepared: level + 2 };
  };

  const getSelectedSpellCount = () => {
    return selectedSpells.length;
  };

  const saveCharacterSpells = (character: Character) => {
    // В реальности здесь должно быть сохранение в базу данных или локальное хранилище
    console.log("Сохранение заклинаний для персонажа:", character.name);
    // Просто присваиваем выбранные заклинания персонажу
    character.spells = [...selectedSpells];
  };

  const loadSpellsForCharacter = (character: Character) => {
    console.log("Загрузка заклинаний для персонажа:", character.name);
    if (character.spells && character.spells.length > 0) {
      setSelectedSpells(character.spells);
    } else {
      setSelectedSpells([]);
    }
  };

  const value = {
    selectedSpells,
    availableSpells,
    addSpell,
    removeSpell,
    getSpellLimits,
    getSelectedSpellCount,
    saveCharacterSpells,
    loadSpellsForCharacter
  };

  return (
    <SpellbookContext.Provider value={value}>
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
