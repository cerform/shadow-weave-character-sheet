
// Импорт массивов заклинаний из разделенных файлов
import { spells } from './spells/index';
export * from './spells/index';

// Функция получения деталей заклинания по имени
export const getSpellDetails = (spellName: string) => {
  // Используем импортированный массив заклинаний
  return spells.find((spell) => spell.name === spellName) || null;
};

// Функция получения всех заклинаний
export const getAllSpells = () => {
  return spells;
};

// Функция получения заклинаний по классу
export const getSpellsByClass = (className: string) => {
  const lowerClassName = className.toLowerCase();
  
  // Соответствие между русскими и английскими названиями классов
  const classNameMapping: Record<string, string[]> = {
    'жрец': ['cleric', 'жрец'],
    'волшебник': ['wizard', 'волшебник'],
    'друид': ['druid', 'друид'],
    'бард': ['bard', 'бард'],
    'колдун': ['warlock', 'колдун'],
    'чародей': ['sorcerer', 'чародей'],
    'паладин': ['paladin', 'паладин'],
    'следопыт': ['ranger', 'следопыт']
  };
  
  // Получаем все возможные варианты названия класса
  const possibleClassNames = classNameMapping[lowerClassName] || [lowerClassName];
  
  console.log(`Looking for spells for class: ${className}, possible names:`, possibleClassNames);
  // Фильтруем заклинания по классу
  return spells.filter((spell) => {
    if (!spell.classes) return false;
    
    const spellClasses = typeof spell.classes === 'string' 
      ? [spell.classes.toLowerCase()] 
      : spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '');
    
    // Проверяем, есть ли хотя бы одно совпадение между возможными именами класса и классами заклинания
    const matches = spellClasses.some(cls => possibleClassNames.includes(cls));
    return matches;
  });
};

// Функция получения заклинаний по уровню
export const getSpellsByLevel = (level: number) => {
  return spells.filter((spell) => spell.level === level);
};

// Функция получения заклинаний по школе магии
export const getSpellsBySchool = (school: string) => {
  const lowerSchool = school.toLowerCase();
  return spells.filter((spell) => {
    return typeof spell.school === 'string' && spell.school.toLowerCase() === lowerSchool;
  });
};
