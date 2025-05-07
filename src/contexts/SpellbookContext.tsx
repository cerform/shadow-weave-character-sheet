
import React, { createContext, useState, ReactNode } from 'react';
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export interface SpellbookContextType {
  selectedSpells: CharacterSpell[];
  availableSpells: SpellData[];
  addSpell: (spell: SpellData | CharacterSpell) => void;
  removeSpell: (spellId: string) => void;
  getSpellLimits: (characterClass: string, level: number) => { maxKnown: number; maxPrepared: number };
  getSelectedSpellCount: () => number;
  saveCharacterSpells: (character?: Character) => void;
  loadSpellsForCharacter: (character: Character | string, level?: number) => void;
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
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);

  const addSpell = (spell: SpellData | CharacterSpell) => {
    const characterSpell: CharacterSpell = {
      id: spell.id?.toString(),
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      prepared: true
    };
    
    setSelectedSpells([...selectedSpells, characterSpell]);
  };

  const removeSpell = (spellId: string) => {
    setSelectedSpells(selectedSpells.filter(spell => 
      spell.id !== spellId && spell.name !== spellId
    ));
  };

  const getSpellLimits = (characterClass: string, level: number) => {
    // Примерные значения, можно настроить под D&D правила
    return { maxKnown: level * 2, maxPrepared: level + 2 };
  };

  const getSelectedSpellCount = () => {
    return selectedSpells.length;
  };

  const saveCharacterSpells = (character?: Character) => {
    // В реальности здесь должно быть сохранение в базу данных или локальное хранилище
    console.log("Сохранение заклинаний для персонажа:", character?.name || "текущий персонаж");
    // Функция может работать без параметра для обратной совместимости
  };

  const loadSpellsForCharacter = (character: Character | string, level?: number) => {
    const characterName = typeof character === 'string' ? character : character.name;
    console.log(`Загрузка заклинаний для ${characterName}${level ? `, уровень ${level}` : ''}`);
    
    // Преобразовать тип character к Character если это строка
    if (typeof character === 'object' && character.spells && character.spells.length > 0) {
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

export { useSpellbookContext } from '@/hooks/spellbook';
