
import { SpellData } from '@/types/spells';

// Улучшенная функция фильтрации заклинаний по текстовому поиску
export const filterSpellsByText = (spells: SpellData[], searchText: string): SpellData[] => {
  const lowerSearchText = searchText.toLowerCase().trim();
  
  if (!lowerSearchText) return spells;
  
  // Разбиваем поисковый запрос на отдельные слова для более точного поиска
  const searchWords = lowerSearchText.split(/\s+/).filter(word => word.length > 0);
  
  return spells.filter(spell => {
    // Проверяем каждое слово из поискового запроса
    return searchWords.every(word => {
      const nameMatch = spell.name.toLowerCase().includes(word);
      
      // Безопасная проверка description с учетом различных типов
      let descriptionMatch = false;
      if (typeof spell.description === 'string') {
        descriptionMatch = spell.description.toLowerCase().includes(word);
      } else if (Array.isArray(spell.description)) {
        descriptionMatch = spell.description.some(desc => 
          typeof desc === 'string' && desc.toLowerCase().includes(word)
        );
      }
      
      // Проверка школы магии
      const schoolMatch = spell.school?.toLowerCase().includes(word);
      
      // Проверка компонентов
      const componentsMatch = spell.components?.toLowerCase().includes(word);
      
      // Проверка времени накладывания
      const castingTimeMatch = spell.castingTime?.toLowerCase().includes(word);
      
      // Проверка дистанции
      const rangeMatch = spell.range?.toLowerCase().includes(word);
      
      // Проверка длительности
      const durationMatch = spell.duration?.toLowerCase().includes(word);
      
      // Проверка классов (с учетом различных форматов)
      let classesMatch = false;
      if (Array.isArray(spell.classes)) {
        classesMatch = spell.classes.some(cls => 
          typeof cls === 'string' && cls.toLowerCase().includes(word)
        );
      } else if (typeof spell.classes === 'string') {
        classesMatch = spell.classes.toLowerCase().includes(word);
      }
      
      // Проверка высших уровней
      const higherLevelsMatch = spell.higherLevels?.toLowerCase().includes(word);
      
      return nameMatch || descriptionMatch || schoolMatch || componentsMatch || 
             castingTimeMatch || rangeMatch || durationMatch || classesMatch || 
             higherLevelsMatch;
    });
  });
};

// Улучшенная функция фильтрации заклинаний по уровню с поддержкой множественного выбора
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels.length) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

// Улучшенная функция фильтрации заклинаний по школе магии с поддержкой множественного выбора
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools.length) return spells;
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

// Улучшенная функция фильтрации заклинаний по классу персонажа с поддержкой множественного выбора
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(cls => classes.includes(cls));
    }
    else if (typeof spell.classes === 'string') {
      return classes.includes(spell.classes);
    }
    return false;
  });
};

// Улучшенная функция фильтрации заклинаний по ритуальности
export const filterSpellsByRitual = (spells: SpellData[], isRitual: boolean): SpellData[] => {
  if (!isRitual) return spells;
  return spells.filter(spell => spell.ritual === isRitual);
};

// Улучшенная функция фильтрации заклинаний по концентрации
export const filterSpellsByConcentration = (spells: SpellData[], isConcentration: boolean): SpellData[] => {
  if (!isConcentration) return spells;
  return spells.filter(spell => spell.concentration === isConcentration);
};

// Новая функция для фильтрации по компонентам заклинания
export const filterSpellsByComponents = (
  spells: SpellData[], 
  verbal: boolean | null, 
  somatic: boolean | null, 
  material: boolean | null
): SpellData[] => {
  return spells.filter(spell => {
    let matches = true;
    
    // Проверяем вербальный компонент если указано
    if (verbal !== null) {
      matches = matches && spell.verbal === verbal;
    }
    
    // Проверяем соматический компонент если указано
    if (somatic !== null) {
      matches = matches && spell.somatic === somatic;
    }
    
    // Проверяем материальный компонент если указано
    if (material !== null) {
      matches = matches && spell.material === material;
    }
    
    return matches;
  });
};

// Функция для проверки совпадения заклинания с фильтрами для быстрого поиска
export const doesSpellMatchFilters = (
  spell: SpellData, 
  searchTerm: string,
  levels: number[],
  schools: string[],
  classes: string[],
  isRitual: boolean,
  isConcentration: boolean
): boolean => {
  // Создаем временный массив с одним заклинанием
  const tempArray = [spell];
  
  // Последовательно применяем все фильтры
  let result = tempArray;
  
  if (searchTerm) {
    result = filterSpellsByText(result, searchTerm);
  }
  
  if (levels.length > 0) {
    result = filterSpellsByLevel(result, levels);
  }
  
  if (schools.length > 0) {
    result = filterSpellsBySchool(result, schools);
  }
  
  if (classes.length > 0) {
    result = filterSpellsByClass(result, classes);
  }
  
  if (isRitual) {
    result = filterSpellsByRitual(result, isRitual);
  }
  
  if (isConcentration) {
    result = filterSpellsByConcentration(result, isConcentration);
  }
  
  // Если после всех фильтров массив не пустой, значит заклинание соответствует всем условиям
  return result.length > 0;
};
