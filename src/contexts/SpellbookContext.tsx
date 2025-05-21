import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SpellData, convertCharacterSpellToSpellData, convertSpellArray } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { useCharacter } from './CharacterContext';
import { useToast } from '@/hooks/use-toast';
import { getAllSpells } from '@/data/spells';
import { calculateAvailableSpellsByClassAndLevel, getMaxSpellLevel } from '@/utils/spellUtils';

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
  // New functions needed by SpellBookViewer
  prepareSpell: (spellId: string) => void;
  unprepareSpell: (spellId: string) => void;
  loadSpells: () => void;
  exportSpells: () => void;
  importSpells: (spells: CharacterSpell[]) => void;
  loading: boolean;
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
  // New functions needed by SpellBookViewer
  prepareSpell: () => {},
  unprepareSpell: () => {},
  loadSpells: () => {},
  exportSpells: () => {},
  importSpells: () => {},
  loading: false
});

export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedSpells, setSelectedSpells] = useState<SpellData[]>([]);
  const [availableSpells, setAvailableSpells] = useState<SpellData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
        : (Array.isArray(spell.classes) ? spell.classes.map((cls: string) => cls.toLowerCase()) : []);
      
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
      const characterSpellData = Array.isArray(character.spells) 
        ? character.spells.map(spell => {
            if (typeof spell === 'string') {
              // Если заклинание представлено строкой, ищем полные данные
              const foundSpell = allSpells.find(s => s.name === spell);
              if (foundSpell) {
                return convertCharacterSpellToSpellData(foundSpell as CharacterSpell);
              } else {
                // Создаем минимальный объект заклинания
                return {
                  id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
                  name: spell,
                  level: 0,
                  school: 'Универсальная',
                  castingTime: '1 действие',
                  range: 'Касание',
                  components: '',
                  duration: 'Мгновенная',
                  description: [''],
                  classes: characterClass,
                  ritual: false,
                  concentration: false
                } as SpellData;
              }
            } else {
              // Если это уже объект заклинания
              return convertCharacterSpellToSpellData(spell);
            }
          })
        : [];
      
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
        const updatedSpells = [...(character.spells || []), characterSpell];
        updateCharacter({ spells: updatedSpells });
        
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
        const updatedSpells = character.spells.filter(spell => {
          if (typeof spell === 'string') {
            return spell !== spellName;
          }
          return spell.id !== spellId && spell.name !== spellName;
        });
        
        updateCharacter({ spells: updatedSpells });
        
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
      : (Array.isArray(spell.classes) ? spell.classes.map((cls: string) => cls.toLowerCase()) : []);
    
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

  // Новые функции для SpellBookViewer
  const prepareSpell = (spellId: string) => {
    if (!character || !character.spells) return;
    
    // Находим заклинание в списке выбранных
    const selectedSpellIndex = selectedSpells.findIndex(s => s.id === spellId);
    
    if (selectedSpellIndex >= 0) {
      const updatedSpells = [...selectedSpells];
      updatedSpells[selectedSpellIndex] = {
        ...updatedSpells[selectedSpellIndex],
        prepared: true
      };
      
      setSelectedSpells(updatedSpells);
      
      // Обновляем в персонаже
      if (updateCharacter && Array.isArray(character.spells)) {
        const characterSpellIndex = character.spells.findIndex(s => 
          typeof s === 'object' && (s.id === spellId || s.name === updatedSpells[selectedSpellIndex].name)
        );
        
        if (characterSpellIndex >= 0) {
          const updatedCharacterSpells = [...character.spells];
          
          if (typeof updatedCharacterSpells[characterSpellIndex] === 'object') {
            updatedCharacterSpells[characterSpellIndex] = {
              ...updatedCharacterSpells[characterSpellIndex] as CharacterSpell,
              prepared: true
            };
            
            updateCharacter({ spells: updatedCharacterSpells });
          }
        }
      }
    }
  };
  
  const unprepareSpell = (spellId: string) => {
    if (!character || !character.spells) return;
    
    // Находим заклинание в списке выбранных
    const selectedSpellIndex = selectedSpells.findIndex(s => s.id === spellId);
    
    if (selectedSpellIndex >= 0) {
      const updatedSpells = [...selectedSpells];
      updatedSpells[selectedSpellIndex] = {
        ...updatedSpells[selectedSpellIndex],
        prepared: false
      };
      
      setSelectedSpells(updatedSpells);
      
      // Обновляем в персонаже
      if (updateCharacter && Array.isArray(character.spells)) {
        const characterSpellIndex = character.spells.findIndex(s => 
          typeof s === 'object' && (s.id === spellId || s.name === updatedSpells[selectedSpellIndex].name)
        );
        
        if (characterSpellIndex >= 0) {
          const updatedCharacterSpells = [...character.spells];
          
          if (typeof updatedCharacterSpells[characterSpellIndex] === 'object') {
            updatedCharacterSpells[characterSpellIndex] = {
              ...updatedCharacterSpells[characterSpellIndex] as CharacterSpell,
              prepared: false
            };
            
            updateCharacter({ spells: updatedCharacterSpells });
          }
        }
      }
    }
  };
  
  // Загрузка всех заклинаний
  const loadSpells = () => {
    setLoading(true);
    try {
      if (character && character.class) {
        loadSpellsForCharacter(character.class, character.level || 1);
      } else {
        // Если нет персонажа, загружаем все заклинания
        const allSpells = getAllSpells();
        const spellDataArray = allSpells.map(spell => ({
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
        } as SpellData));
        
        setAvailableSpells(spellDataArray);
      }
    } catch (error) {
      console.error('Error loading spells:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить заклинания',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Экспорт заклинаний в JSON
  const exportSpells = () => {
    if (selectedSpells.length === 0) {
      toast({
        title: 'Нет заклинаний',
        description: 'У вас нет заклинаний для экспорта',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const jsonData = JSON.stringify(selectedSpells, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-spells.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Заклинания экспортированы',
        description: 'Заклинания успешно экспортированы в JSON файл'
      });
    } catch (error) {
      console.error('Error exporting spells:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать заклинания',
        variant: 'destructive'
      });
    }
  };
  
  // Импорт заклинаний из JSON
  const importSpells = (spells: CharacterSpell[]) => {
    try {
      if (!Array.isArray(spells) || spells.length === 0) {
        throw new Error('Неверный формат данных');
      }
      
      // Преобразуем импортированные заклинания в SpellData
      const importedSpellData = spells.map(spell => convertCharacterSpellToSpellData(spell));
      
      // Объединяем с существующими заклинаниями
      const updatedSpells = [...selectedSpells];
      
      importedSpellData.forEach(spell => {
        // Добавляем только если такого еще нет
        if (!updatedSpells.some(s => s.id === spell.id || s.name === spell.name)) {
          updatedSpells.push(spell);
        }
      });
      
      setSelectedSpells(updatedSpells);
      
      // Обновляем заклинания в персонаже, если есть
      if (character && updateCharacter) {
        const characterSpells = updatedSpells.map(spell => ({
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
          prepared: spell.prepared || true
        }));
        
        updateCharacter({ spells: characterSpells });
      }
      
      toast({
        title: 'Заклинания импортированы',
        description: `Импортировано ${importedSpellData.length} заклинаний`
      });
    } catch (error) {
      console.error('Error importing spells:', error);
      toast({
        title: 'Ошибка импорта',
        description: 'Не удалось импортировать заклинания',
        variant: 'destructive'
      });
    }
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
        // Add new functions
        prepareSpell,
        unprepareSpell,
        loadSpells,
        exportSpells,
        importSpells,
        loading
      }}
    >
      {children}
    </SpellbookContext.Provider>
  );
};

export const useSpellbook = () => useContext(SpellbookContext);
