
import { SpellData } from './types';
import { CharacterSpell } from '@/types/character';
import { safeFilter, safeSome } from '@/utils/spellUtils';

// Проверка, что значение является строкой
export function isString(value: any): value is string {
  return typeof value === 'string';
}

// Класс типа guard для проверки строк в массиве
export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Конвертер из CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => ({
  id: spell.id?.toString(),
  name: spell.name,
  level: spell.level,
  school: spell.school || 'Unknown', 
  castingTime: spell.castingTime || '',
  range: spell.range || '',
  components: spell.components || '',
  duration: spell.duration || '',
  description: spell.description || '',
  classes: spell.classes || [],
  isRitual: spell.ritual || false,
  isConcentration: spell.concentration || false,
  verbal: spell.verbal || false,
  somatic: spell.somatic || false,
  material: spell.material || false,
  higherLevel: spell.higherLevels || '',
  ritual: spell.ritual || false,
  concentration: spell.concentration || false
});

// Функция для фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  if (searchTerm.trim() === '') {
    return spells;
  }

  const term = searchTerm.toLowerCase();
  return spells.filter(spell => {
    return spell.name.toLowerCase().includes(term) || 
      (spell.description && spell.description.toLowerCase().includes(term));
  });
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: CharacterSpell[], levels: number[]): CharacterSpell[] => {
  if (!levels.length) {
    return spells;
  }
  return spells.filter(spell => levels.includes(spell.level));
};

// Функция для фильтрации заклинаний по школе
export const filterSpellsBySchool = (spells: CharacterSpell[], schools: string[]): CharacterSpell[] => {
  if (!schools.length) {
    return spells;
  }
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

// Функция для фильтрации заклинаний по классу
export const filterSpellsByClass = (spells: CharacterSpell[], classes: string[]): CharacterSpell[] => {
  if (!classes.length) {
    return spells;
  }
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    // Use the utility function for safely checking string or string[] types
    return safeSome(spell.classes, spellClass => 
      classes.some(className => spellClass.toLowerCase() === className.toLowerCase())
    );
  });
};

// Функция для извлечения уникальных классов из заклинаний
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(cls => {
        if (cls) classSet.add(cls);
      });
    } else if (typeof spell.classes === 'string') {
      classSet.add(spell.classes);
    }
  });
  
  return Array.from(classSet).sort();
};

// Функция для форматирования классов для отображения
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

// Экспортируем функции с другими именами для обратной совместимости
export const filterByLevel = filterSpellsByLevel;
export const filterBySchool = filterSpellsBySchool;
export const filterByClass = filterSpellsByClass;
export const filterBySearchTerm = filterSpellsBySearchTerm;
