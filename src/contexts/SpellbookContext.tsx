
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SpellData, convertCharacterSpellToSpellData, convertSpellArray } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { useCharacter } from './CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';

interface SpellbookContextType {
  selectedSpells: SpellData[];
  availableSpells: SpellData[];
  setSelectedSpells: (spells: SpellData[]) => void;
  addSpell: (spell: SpellData) => void;
  removeSpell: (spellId: string) => void;
  canAddSpell: (spell: SpellData) => boolean;
  getSpellLimits: () => { cantrips: number; spells: number };
  getSelectedSpellCount: () => { cantrips: number; spells: number };
  saveCharacterSpells: () => void;
  isSpellAvailableForClass: (spell: SpellData) => boolean;
}

export const SpellbookContext = createContext<SpellbookContextType>({
  selectedSpells: [],
  availableSpells: [],
  setSelectedSpells: () => {},
  addSpell: () => {},
  removeSpell: () => {},
  canAddSpell: () => false,
  getSpellLimits: () => ({ cantrips: 0, spells: 0 }),
  getSelectedSpellCount: () => ({ cantrips: 0, spells: 0 }),
  saveCharacterSpells: () => {},
  isSpellAvailableForClass: () => false,
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();

  // Загружаем доступные заклинания для класса персонажа
  useEffect(() => {
    if (character && character.class) {
      const allSpells = getAllSpells();
      
      // Фильтруем заклинания для класса персонажа
      const classSpells = allSpells.filter(spell => {
        if (!spell.classes) return false;
        
        const spellClasses = typeof spell.classes === 'string' 
          ? [spell.classes] 
          : spell.classes;
          
        // Проверяем, доступно ли заклинание для класса персонажа
        return spellClasses.some(cls => 
          cls.toLowerCase() === character.class?.toLowerCase()
        );
      });
      
      // Преобразуем CharacterSpell[] в SpellData[]
      setAvailableSpells(convertSpellArray(classSpells));
      
      // Если у персонажа уже есть заклинания, загружаем их
      if (character.spells && character.spells.length > 0) {
        // Преобразуем CharacterSpell[] в SpellData[]
        setSelectedSpells(convertSpellArray(character.spells));
      }
    }
  }, [character]);

  // Добавление заклинания
  const addSpell = (spell: SpellData) => {
    if (!canAddSpell(spell)) {
      toast({
        title: "Лимит заклинаний",
        description: spell.level === 0 
          ? "Вы достигли максимального количества заговоров." 
          : "Вы достигли максимального количества заклинаний.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSpells.some(s => s.id === spell.id)) {
      setSelectedSpells([...selectedSpells, spell]);
    }
  };

  // Удаление заклинания
  const removeSpell = (spellId: string) => {
    setSelectedSpells(selectedSpells.filter(spell => spell.id !== spellId));
  };
  
  // Проверка доступности заклинания для класса
  const isSpellAvailableForClass = (spell: SpellData): boolean => {
    if (!character || !character.class) return false;
    
    const spellClasses = typeof spell.classes === 'string' 
      ? [spell.classes] 
      : spell.classes || [];
      
    return spellClasses.some(cls => 
      cls?.toLowerCase() === character.class?.toLowerCase()
    );
  };
  
  // Получение лимитов заклинаний для текущего уровня и класса
  const getSpellLimits = () => {
    if (!character) return { cantrips: 0, spells: 0 };
    
    // Базовые значения по умолчанию
    const limits = { cantrips: 0, spells: 0 };
    
    const characterClass = character.class?.toLowerCase();
    const level = character.level || 1;
    
    // Количество заговоров для разных классов
    if (characterClass === 'бард') {
      if (level >= 1) limits.cantrips = 2;
      if (level >= 4) limits.cantrips = 3;
      if (level >= 10) limits.cantrips = 4;
    } else if (characterClass === 'жрец' || characterClass === 'друид') {
      if (level >= 1) limits.cantrips = 3;
      if (level >= 4) limits.cantrips = 4;
      if (level >= 10) limits.cantrips = 5;
    } else if (characterClass === 'волшебник') {
      if (level >= 1) limits.cantrips = 3;
      if (level >= 4) limits.cantrips = 4;
      if (level >= 10) limits.cantrips = 5;
    } else if (characterClass === 'колдун') {
      if (level >= 1) limits.cantrips = 2;
      if (level >= 4) limits.cantrips = 3;
      if (level >= 10) limits.cantrips = 4;
    } else if (characterClass === 'чародей') {
      if (level >= 1) limits.cantrips = 4;
      if (level >= 4) limits.cantrips = 5;
      if (level >= 10) limits.cantrips = 6;
    }
    
    // Количество заклинаний (разное для разных классов)
    if (characterClass === 'бард') {
      limits.spells = level + 2;
    } else if (characterClass === 'колдун') {
      limits.spells = Math.min(level + 1, 15);
    } else if (characterClass === 'чародей') {
      limits.spells = level + 1;
    } else if (characterClass === 'следопыт' || characterClass === 'паладин') {
      // Для паладина и следопыта используется формула
      limits.spells = Math.floor((level / 2) + character.abilities?.WIS || 0);
    }
    
    return limits;
  };
  
  // Получение текущего количества выбранных заклинаний по типам
  const getSelectedSpellCount = () => {
    const cantrips = selectedSpells.filter(spell => spell.level === 0).length;
    const spells = selectedSpells.filter(spell => spell.level > 0).length;
    
    return { cantrips, spells };
  };
  
  // Проверка возможности добавления заклинания
  const canAddSpell = (spell: SpellData): boolean => {
    const limits = getSpellLimits();
    const counts = getSelectedSpellCount();
    
    if (spell.level === 0) {
      return counts.cantrips < limits.cantrips;
    } else {
      return counts.spells < limits.spells;
    }
  };
  
  // Сохранение выбранных заклинаний в персонажа
  const saveCharacterSpells = () => {
    if (!character) return;
    
    const characterSpells: CharacterSpell[] = selectedSpells.map(spell => ({
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school,
      castingTime: spell.castingTime,
      range: spell.range,
      components: spell.components,
      duration: spell.duration,
      description: spell.description,
      classes: spell.classes,
      prepared: true, // По умолчанию заклинания подготовлены
    }));
    
    updateCharacter({ spells: characterSpells });
    
    toast({
      title: "Заклинания сохранены",
      description: `${characterSpells.length} заклинаний сохранено для вашего персонажа.`
    });
  };

  return (
    <SpellbookContext.Provider
      value={{
        selectedSpells,
        availableSpells,
        setSelectedSpells,
        addSpell,
        removeSpell,
        canAddSpell,
        getSpellLimits,
        getSelectedSpellCount,
        saveCharacterSpells,
        isSpellAvailableForClass,
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
