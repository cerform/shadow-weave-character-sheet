
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';

// Фильтрация заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm || searchTerm.trim() === '') return spells;
  
  const normalizedSearchTerm = searchTerm.toLowerCase();
  
  return spells.filter(spell => 
    (spell.name && spell.name.toLowerCase().includes(normalizedSearchTerm)) || 
    (spell.description && typeof spell.description === 'string' && spell.description.toLowerCase().includes(normalizedSearchTerm))
  );
};

// Преобразование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Неизвестно',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    classes: spell.classes || [],
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    higherLevels: spell.higherLevels,
    prepared: spell.prepared
  };
};

// Фильтрация заклинаний по уровню
export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels || levels.length === 0) return spells;
  return spells.filter(spell => levels.includes(spell.level));
};

// Фильтрация заклинаний по школе
export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools || schools.length === 0) return spells;
  return spells.filter(spell => schools.includes(spell.school));
};

// Фильтрация заклинаний по классу
export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes || classes.length === 0) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => classes.includes(c));
    } else if (typeof spell.classes === 'string') {
      // Если classes - это строка, проверяем, содержит ли она какой-либо из указанных классов
      return classes.some(c => spell.classes.includes(c));
    }
    
    return false;
  });
};

// Извлечение уникальных классов из заклинаний
export const extractClasses = (spells: SpellData[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(c => classesSet.add(c));
    } else if (typeof spell.classes === 'string') {
      // Разделяем строку с классами по запятым и добавляем в Set
      spell.classes.split(',').map(c => c.trim()).forEach(c => classesSet.add(c));
    }
  });
  
  return Array.from(classesSet).sort();
};

// Форматирование классов для отображения
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

// Проверка, является ли значение строкой
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

// Проверка, является ли значение массивом строк
export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};
