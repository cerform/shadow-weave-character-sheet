import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SpellData, convertCharacterSpellToSpellData, convertSpellArray } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { useCharacter } from './CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';
import { calculateAvailableSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';
import { normalizeCharacterSpells, updateCharacterSpells } from '@/utils/spellTypeUtils';

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
  loadSpellsForCharacter: (characterClass: string, level: number) => void;
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
  loadSpellsForCharacter: () => {},
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();

  // Загружаем доступные заклинания для класса персонажа
  useEffect(() => {
    if (character && character.class) {
      loadSpellsForCharacter(character.class, character.level || 1);
    }
  }, [character?.class, character?.level]);

  // Функция для загрузки заклинаний, которую можно вызывать извне
  const loadSpellsForCharacter = (characterClass: string, level: number) => {
    console.log("Loading spells for class:", characterClass, "level:", level);
    
    const allSpells = getAllSpells();
    console.log("Total spells found:", allSpells.length);
    
    // Получаем максимальный уровень заклинаний
    const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(
      characterClass, 
      level || 1,
      getModifierForClass(character)
    );
    
    console.log("Max spell level calculated:", maxSpellLevel);
    
    // Фильтруем заклинания для класса персонажа и уровня
    const classSpells = allSpells.filter(spell => {
      if (!spell.classes) return false;
      
      // Преобразуем classes к массиву, если строка
      const spellClasses = typeof spell.classes === 'string' 
        ? [spell.classes.toLowerCase()] 
        : (spell.classes || []).map((cls: string) => cls.toLowerCase());
        
      // Проверяем соответствие класса персонажа
      const isForClass = spellClasses.some(cls => {
        const characterClassLower = characterClass.toLowerCase();
        
        // Проверяем как русские, так и английские названия классов
        return cls === characterClassLower || 
          (characterClassLower === 'жрец' && cls === 'cleric') ||
          (characterClassLower === 'волшебник' && cls === 'wizard') ||
          (characterClassLower === 'друид' && cls === 'druid') ||
          (characterClassLower === 'бард' && cls === 'bard') ||
          (characterClassLower === 'колдун' && cls === 'warlock') ||
          (characterClassLower === 'чародей' && cls === 'sorcerer') ||
          (characterClassLower === 'паладин' && cls === 'paladin');
      });
      
      // Проверяем соответствие уровня заклинания
      const isLevelAvailable = spell.level <= maxSpellLevel;
      
      return isForClass && isLevelAvailable;
    });
    
    console.log(`Found ${classSpells.length} spells for ${characterClass}`);
    
    // Преобразуем заклинания в формат SpellData
    const spellDataArray = classSpells.map(spell => {
      return {
        id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell.name,
        level: spell.level,
        school: spell.school || 'Универсальная',
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'Касание',
        components: spell.components || '',
        duration: spell.duration || 'Мгновенная',
        description: spell.description || '',
        classes: spell.classes || [],
        ritual: spell.ritual || false,
        concentration: spell.concentration || false
      } as SpellData;
    });
    
    setAvailableSpells(spellDataArray);
    
    // Если у персонажа уже есть заклинания, загружаем их
    if (character && character.spells && character.spells.length > 0) {
      // Преобразуем CharacterSpell[] в SpellData[]
      const normalizedSpells = normalizeCharacterSpells(character.spells);
      
      const characterSpellData = normalizedSpells.map(spell => {
        // Ищем полные данные в allSpells
        const foundSpell = allSpells.find(s => s.name === spell.name);
        if (foundSpell) {
          return convertCharacterSpellToSpellData(foundSpell as CharacterSpell);
        } else {
          // Создаем минимальный объект заклинания
          return {
            id: `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: spell.name,
            level: spell.level || 0,
            school: spell.school || 'Универсальная',
            castingTime: spell.castingTime || '1 действие',
            range: spell.range || 'Касание',
            components: spell.components || '',
            duration: spell.duration || 'Мгновенная',
            description: spell.description || [''],
            classes: spell.classes || characterClass,
            ritual: spell.ritual || false,
            concentration: spell.concentration || false
          } as SpellData;
        }
      });
      
      setSelectedSpells(characterSpellData);
    }
  };

  // Получаем модификатор характеристики для класса
  const getModifierForClass = (character: any): number => {
    if (!character || !character.abilities) return 3; // По умолчанию +3
    
    const classLower = character?.class?.toLowerCase() || '';
    
    if (['жрец', 'друид'].includes(classLower)) {
      // Мудрость
      return Math.floor((character.abilities?.wisdom || character.wisdom || 10) - 10) / 2;
    } else if (['волшебник', 'маг'].includes(classLower)) {
      // Интеллект
      return Math.floor((character.abilities?.intelligence || character.intelligence || 10) - 10) / 2;
    } else {
      // Харизма (бард, колдун, чародей, паладин)
      return Math.floor((character.abilities?.charisma || character.charisma || 10) - 10) / 2;
    }
  };

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
    
    // Добавляем заклинание в контекст только если его еще нет
    if (!selectedSpells.some(s => s.id === spell.id || s.name === spell.name)) {
      const updatedSelectedSpells = [...selectedSpells, spell];
      setSelectedSpells(updatedSelectedSpells);
      
      // Также добавляем заклинание в персонажа, если есть доступ к updateCharacter
      if (character && updateCharacter) {
        // Преобразуем SpellData в CharacterSpell
        const characterSpell: CharacterSpell = {
          id: spell.id.toString(),
          name: spell.name,
          level: spell.level,
          school: spell.school,
          castingTime: spell.castingTime,
          range: spell.range,
          components: spell.components,
          duration: spell.duration,
          description: spell.description,
          classes: spell.classes,
          prepared: true // По умолчанию заклинания подготовлены
        };
        
        // Добавляем заклинание к списку заклинаний персонажа
        const normalizedSpells = normalizeCharacterSpells(character.spells || []);
        const updatedSpells = [...normalizedSpells, characterSpell];
        
        updateCharacter(updateCharacterSpells(character, updatedSpells));
        
        toast({
          title: "Заклинание добавлено",
          description: `Заклинание "${spell.name}" добавлено в список известных заклинаний`,
        });
      }
    }
  };

  // Удаление заклинания
  const removeSpell = (spellId: string) => {
    // Удаляем из контекста
    setSelectedSpells(selectedSpells.filter(spell => spell.id !== spellId && spell.id !== `spell-${spellId}`));
    
    // Также удаляем из персонажа, если есть доступ к updateCharacter
    if (character && character.spells && updateCharacter) {
      const spellName = selectedSpells.find(s => s.id === spellId || s.id === `spell-${spellId}`)?.name;
      
      if (spellName) {
        const normalizedSpells = normalizeCharacterSpells(character.spells);
        
        const updatedSpells = normalizedSpells.filter(spell => 
          spell.id !== spellId && spell.name !== spellName
        );
        
        updateCharacter(updateCharacterSpells(character, updatedSpells));
        
        toast({
          title: "Заклинание удалено",
          description: `Заклинание "${spellName}" удалено из списка известных заклинаний`,
        });
      }
    }
  };
  
  // Проверка доступности заклинания для класса
  const isSpellAvailableForClass = (spell: SpellData): boolean => {
    if (!character || !character.class) return false;
    
    const characterClassLower = character.class.toLowerCase();
    
    // Преобразуем classes к массиву
    const spellClasses = typeof spell.classes === 'string' 
      ? [spell.classes.toLowerCase()]
      : (spell.classes || []).map(cls => typeof cls === 'string' ? cls.toLowerCase() : '');
    
    // Проверяем соответствие класса
    return spellClasses.some(cls => 
      cls === characterClassLower ||
      (characterClassLower === 'жрец' && cls === 'cleric') ||
      (characterClassLower === 'волшебник' && cls === 'wizard') ||
      (characterClassLower === 'друид' && cls === 'druid') ||
      (characterClassLower === 'бард' && cls === 'bard') ||
      (characterClassLower === 'колдун' && cls === 'warlock') ||
      (characterClassLower === 'чародей' && cls === 'sorcerer') ||
      (characterClassLower === 'паладин' && cls === 'paladin')
    );
  };
  
  // Получение лимитов заклинаний для текущего уровня и класса
  const getSpellLimits = () => {
    if (!character || !character.class) return { cantrips: 0, spells: 0 };
    
    const { cantripsCount, knownSpells } = calculateAvailableSpellsByClassAndLevel(
      character.class, 
      character.level || 1,
      getModifierForClass(character)
    );
    
    return { cantrips: cantripsCount, spells: knownSpells };
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
      id: spell.id.toString(),
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
        loadSpellsForCharacter,
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
