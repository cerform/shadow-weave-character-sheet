
import { CharacterSpell } from '@/types/character';
import { SpellData } from './types';

// Вспомогательные функции для проверки типа
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Преобразование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || 0,
    isRitual: spell.ritual || false,
    isConcentration: spell.concentration || false,
    name: spell.name,
    level: spell.level,
    description: spell.description,
    school: spell.school,
    castingTime: spell.castingTime || 'Не указано',
    range: spell.range || 'Не указано',
    components: spell.components || 'Не указано',
    duration: spell.duration || 'Не указано',
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    higherLevels: spell.higherLevels || '',
    prepared: spell.prepared || false,
    classes: spell.classes || [],
    // Добавляем метод toString для преобразования в строку
    toString: function() {
      return this.name;
    }
  };
};

// Фильтрация заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  if (!searchTerm) return spells;
  
  const term = searchTerm.toLowerCase();
  
  return spells.filter(spell =>
    spell.name.toLowerCase().includes(term) ||
    (spell.description && spell.description.toLowerCase().includes(term)) ||
    (spell.school && spell.school.toLowerCase().includes(term))
  );
};

// Фильтрация заклинаний по уровню
export const filterSpellsByLevel = (spells: CharacterSpell[], levels: number[]): CharacterSpell[] => {
  if (!levels.length) return spells;
  
  return spells.filter(spell => levels.includes(spell.level));
};

// Фильтрация заклинаний по школе
export const filterSpellsBySchool = (spells: CharacterSpell[], schools: string[]): CharacterSpell[] => {
  if (!schools.length) return spells;
  
  return spells.filter(spell => schools.includes(spell.school));
};

// Фильтрация заклинаний по классу
export const filterSpellsByClass = (spells: CharacterSpell[], classes: string[]): CharacterSpell[] => {
  if (!classes.length) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (isString(spell.classes)) {
      return classes.includes(spell.classes);
    }
    
    if (isStringArray(spell.classes)) {
      return spell.classes.some(cls => classes.includes(cls));
    }
    
    return false;
  });
};

// Извлечение всех уникальных классов из заклинаний
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (isString(spell.classes)) {
      classesSet.add(spell.classes);
    } else if (isStringArray(spell.classes)) {
      spell.classes.forEach(cls => classesSet.add(cls));
    }
  });
  
  return Array.from(classesSet).sort();
};

// Форматирование списка классов для отображения
export const formatClasses = (classes: string[] | string): string => {
  if (!classes) return 'Нет классов';
  
  if (isString(classes)) {
    return classes;
  }
  
  return classes.join(', ');
};
