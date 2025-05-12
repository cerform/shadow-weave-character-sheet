
import { SpellData } from "@/types/spells";

/**
 * Фильтрует заклинания по имени
 * @param spells Список заклинаний
 * @param searchTerm Строка поиска
 * @returns Отфильтрованный список заклинаний
 */
export const searchSpellsByName = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(lowerSearchTerm)
  );
};

/**
 * Фильтрует заклинания по уровням
 * @param spells Список заклинаний
 * @param levels Массив уровней для фильтрации
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels || levels.length === 0) return spells;
  
  return spells.filter(spell => levels.includes(spell.level));
};

/**
 * Фильтрует заклинания по школам магии
 * @param spells Список заклинаний
 * @param schools Массив школ для фильтрации
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools || schools.length === 0) return spells;
  
  return spells.filter(spell => {
    // Безопасно обрабатываем возможные значения school
    if (!spell.school) return false;
    
    const spellSchool = typeof spell.school === 'string' 
      ? spell.school.toLowerCase() 
      : '';
      
    return schools.some(school => school.toLowerCase() === spellSchool);
  });
};

/**
 * Фильтрует заклинания по классам
 * @param spells Список заклинаний
 * @param classes Массив классов для фильтрации
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes || classes.length === 0) return spells;
  
  return spells.filter(spell => {
    // Проверяем, есть ли у заклинания информация о классах
    if (!spell.classes) return false;
    
    // Преобразуем в массив, если это строка
    const spellClasses = typeof spell.classes === 'string' 
      ? [spell.classes] 
      : Array.isArray(spell.classes) ? spell.classes : [];
      
    // Проверяем каждый класс заклинания
    for (const spellClass of spellClasses) {
      // Если класс не строка, пропускаем
      if (typeof spellClass !== 'string') continue;
      
      // Проверяем, соответствует ли хотя бы один класс заклинания запрошенным классам
      if (classes.some(cls => 
        cls.toLowerCase() === spellClass.toLowerCase()
      )) {
        return true;
      }
    }
    
    return false;
  });
};

/**
 * Фильтрует заклинания по наличию свойства "ритуал"
 * @param spells Список заклинаний
 * @param isRitual Флаг для фильтрации ритуальных заклинаний
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsByRitual = (spells: SpellData[], isRitual: boolean | null): SpellData[] => {
  if (isRitual === null) return spells;
  
  return spells.filter(spell => Boolean(spell.ritual) === isRitual);
};

/**
 * Фильтрует заклинания по наличию свойства "концентрация"
 * @param spells Список заклинаний
 * @param requiresConcentration Флаг для фильтрации заклинаний с концентрацией
 * @returns Отфильтрованный список заклинаний
 */
export const filterSpellsByConcentration = (spells: SpellData[], requiresConcentration: boolean | null): SpellData[] => {
  if (requiresConcentration === null) return spells;
  
  return spells.filter(spell => Boolean(spell.concentration) === requiresConcentration);
};

/**
 * Применяет все фильтры к списку заклинаний
 * @param spells Исходный список заклинаний
 * @param filters Объект с фильтрами
 * @returns Отфильтрованный список заклинаний
 */
export const applyAllFilters = (
  spells: SpellData[], 
  filters: {
    name: string;
    schools: string[];
    levels: number[];
    classes: string[];
    ritual: boolean | null;
    concentration: boolean | null;
  }
): SpellData[] => {
  let filteredSpells = [...spells];
  
  // Применяем все фильтры последовательно
  filteredSpells = searchSpellsByName(filteredSpells, filters.name);
  filteredSpells = filterSpellsByLevel(filteredSpells, filters.levels);
  filteredSpells = filterSpellsBySchool(filteredSpells, filters.schools);
  filteredSpells = filterSpellsByClass(filteredSpells, filters.classes);
  filteredSpells = filterSpellsByRitual(filteredSpells, filters.ritual);
  filteredSpells = filterSpellsByConcentration(filteredSpells, filters.concentration);
  
  return filteredSpells;
};
