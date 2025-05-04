
import { SpellData } from './types';
import { CharacterSpell } from '@/types/character';

// Класс типа guard для проверки строк в массиве
export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Проверка, что значение является строкой
export function isString(value: any): value is string {
  return typeof value === 'string';
}

// Конвертер из CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => ({
  ...spell,
  id: spell.id !== undefined ? spell.id : undefined,
  isRitual: spell.ritual || false,
  isConcentration: spell.concentration || false
});

// Функция для фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  if (searchTerm.trim() === '') {
    return spells;
  }

  const term = searchTerm.toLowerCase();
  return spells.filter(spell => {
    // Проверка имени заклинания
    const nameMatch = spell.name.toLowerCase().includes(term);
    
    // Проверка описания заклинания
    const descriptionMatch = spell.description ? spell.description.toLowerCase().includes(term) : false;
    
    // Проверка классов заклинания
    let classesMatch = false;
    if (spell.classes) {
      // Если classes - строка
      if (isString(spell.classes)) {
        classesMatch = spell.classes.toLowerCase().includes(term);
      }
      // Если classes - массив строк
      else if (isStringArray(spell.classes)) {
        classesMatch = spell.classes.some(cls => isString(cls) && cls.toLowerCase().includes(term));
      }
    }
    
    return nameMatch || descriptionMatch || classesMatch;
  });
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: CharacterSpell[], activeLevels: number[]): CharacterSpell[] => {
  if (activeLevels.length === 0) {
    return spells;
  }
  return spells.filter(spell => activeLevels.includes(spell.level));
};

// Функция для фильтрации заклинаний по школе
export const filterSpellsBySchool = (spells: CharacterSpell[], activeSchools: string[]): CharacterSpell[] => {
  if (activeSchools.length === 0) {
    return spells;
  }
  return spells.filter(spell => activeSchools.includes(spell.school));
};

// Функция для фильтрации заклинаний по классам
export const filterSpellsByClass = (spells: CharacterSpell[], activeClasses: string[]): CharacterSpell[] => {
  if (activeClasses.length === 0) {
    return spells;
  }

  return spells.filter(spell => {
    // Если классы не определены, заклинание не соответствует фильтру
    if (!spell.classes) return false;
    
    // Проверка если classes - строка
    if (isString(spell.classes)) {
      const spellClassesStr = spell.classes;
      return activeClasses.some(cls => 
        isString(cls) && spellClassesStr.toLowerCase().includes(cls.toLowerCase())
      );
    } 
    // Проверка если classes - массив строк
    else if (isStringArray(spell.classes)) {
      return spell.classes.some(spellClass => 
        activeClasses.some(cls => 
          isString(cls) && isString(spellClass) && 
          spellClass.toLowerCase().includes(cls.toLowerCase())
        )
      );
    }
    return false;
  });
};

// Извлечение уникальных классов из заклинаний
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      // Если classes - строка, разделяем по запятым
      if (isString(spell.classes)) {
        const classesString = spell.classes;
        classesString.split(',').forEach(cls => 
          classesSet.add(cls.trim())
        );
      } else if (isStringArray(spell.classes)) {
        // Если classes - массив строк, добавляем каждый элемент
        spell.classes.forEach(cls => {
          if (isString(cls)) {
            classesSet.add(cls.trim());
          }
        });
      }
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
