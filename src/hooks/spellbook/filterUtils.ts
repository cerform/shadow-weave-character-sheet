
import { SpellData } from './types';

// Получаем все уникальные уровни заклинаний
export const getAllLevels = (spells: SpellData[]): number[] => {
  const levels = Array.from(new Set(spells.map(spell => spell.level)));
  return levels.sort((a, b) => a - b);
};

// Получаем все уникальные школы магии
export const getAllSchools = (spells: SpellData[]): string[] => {
  const schools = Array.from(new Set(spells.map(spell => spell.school)));
  return schools.sort();
};

// Получаем все уникальные классы
export const getAllClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        spell.classes.forEach(className => classesSet.add(className));
      } else if (typeof spell.classes === 'string') {
        classesSet.add(spell.classes);
      }
    }
  });
  
  return Array.from(classesSet).sort();
};

// Форматирование списка классов для отображения
export const formatClassesString = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

// Получаем цвет для уровня заклинания
export const getBadgeColorByLevel = (level: number): string => {
  switch (level) {
    case 0: return '#78716c'; // Заговор
    case 1: return '#2563eb'; // 1 уровень
    case 2: return '#7c3aed'; // 2 уровень
    case 3: return '#db2777'; // 3 уровень
    case 4: return '#b91c1c'; // 4 уровень
    case 5: return '#ea580c'; // 5 уровень
    case 6: return '#65a30d'; // 6 уровень
    case 7: return '#0d9488'; // 7 уровень
    case 8: return '#6d28d9'; // 8 уровень
    case 9: return '#4c1d95'; // 9 уровень
    default: return '#1e293b';
  }
};

// Получаем цвет для школы магии
export const getSchoolBadgeColor = (school: string): string => {
  const normalizedSchool = typeof school === 'string' ? school.toLowerCase() : '';
  
  switch (normalizedSchool) {
    case 'воплощение': return '#dc2626';
    case 'некромантия': return '#4b5563';
    case 'очарование': return '#ec4899';
    case 'преобразование': return '#2563eb';
    case 'прорицание': return '#9333ea';
    case 'вызов': return '#ea580c';
    case 'ограждение': return '#65a30d';
    case 'иллюзия': return '#8b5cf6';
    default: return '#475569';
  }
};

// Фильтрация заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm) return spells;
  
  const lowercasedTerm = searchTerm.toLowerCase();
  
  return spells.filter(spell => {
    // Фильтрация по имени
    const nameMatch = spell.name.toLowerCase().includes(lowercasedTerm);
    
    // Фильтрация по описанию
    const descriptionMatch = spell.description?.toLowerCase().includes(lowercasedTerm) || false;
    
    return nameMatch || descriptionMatch;
  });
};

// Фильтрация заклинаний по уровню
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (levels.length === 0) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

// Фильтрация заклинаний по школе
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (schools.length === 0) return spells;
  return spells.filter(spell => schools.includes(spell.school));
};

// Фильтрация заклинаний по классу
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (classes.length === 0) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return classes.some(className => 
        spell.classes.some(spellClass => 
          typeof spellClass === 'string' && spellClass.toLowerCase().includes(className.toLowerCase())
        )
      );
    } 
    
    if (typeof spell.classes === 'string') {
      const spellClassLower = spell.classes.toLowerCase();
      return classes.some(className => 
        spellClassLower.includes(className.toLowerCase())
      );
    }
    
    return false;
  });
};
