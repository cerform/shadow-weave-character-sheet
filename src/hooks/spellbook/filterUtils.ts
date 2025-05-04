
import { SpellData } from './types';
import { CharacterSpell } from '@/types/character';

// Функция для фильтрации заклинаний по поисковому запросу
export const filterSpellsBySearchTerm = (spells: any[], searchTerm: string): any[] => {
  if (!searchTerm) return spells;
  
  const lowercaseTerm = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(lowercaseTerm) || 
    (spell.description && String(spell.description).toLowerCase().includes(lowercaseTerm))
  );
};

// Функция для конвертации CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || Math.random().toString(),
    name: spell.name,
    level: spell.level,
    description: spell.description || "",
    school: spell.school || "Преобразование", // Устанавливаем значение по умолчанию
    castingTime: spell.castingTime || "1 действие", // Устанавливаем значение по умолчанию
    range: spell.range || "На себя", // Устанавливаем значение по умолчанию
    components: spell.components || "В", // Устанавливаем значение по умолчанию
    duration: spell.duration || "Мгновенная", // Устанавливаем значение по умолчанию
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    isRitual: spell.ritual,
    isConcentration: spell.concentration,
    ritual: spell.ritual,
    concentration: spell.concentration,
    classes: spell.classes || [],
    higherLevels: spell.higherLevels,
    // Добавляем toString для совместимости
    toString: () => spell.name
  };
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: any[], activeLevel: number[]): any[] => {
  if (activeLevel.length === 0) return spells;
  return spells.filter(spell => activeLevel.includes(spell.level));
};

// Функция для фильтрации заклинаний по школе
export const filterSpellsBySchool = (spells: any[], activeSchool: string[]): any[] => {
  if (activeSchool.length === 0) return spells;
  return spells.filter(spell => activeSchool.includes(spell.school));
};

// Функция для фильтрации заклинаний по классу
export const filterSpellsByClass = (spells: any[], activeClass: string[]): any[] => {
  if (activeClass.length === 0) return spells;
  
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    // Проверяем, является ли classes строкой или массивом
    const spellClasses = isStringArray(spell.classes) 
      ? spell.classes 
      : isString(spell.classes) 
        ? [spell.classes]
        : [];
    
    // Проверяем, есть ли хотя бы один выбранный класс среди классов заклинания
    return activeClass.some(className => 
      spellClasses.some((spellClass: string) => 
        spellClass.toLowerCase().includes(className.toLowerCase())
      )
    );
  });
};

// Функция для извлечения всех уникальных классов из заклинаний
export const extractClasses = (spells: any[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      // Если classes - массив строк
      if (isStringArray(spell.classes)) {
        spell.classes.forEach((className: string) => {
          classesSet.add(className);
        });
      }
      // Если classes - строка
      else if (isString(spell.classes)) {
        spell.classes.split(', ').forEach(className => {
          classesSet.add(className.trim());
        });
      }
    }
  });
  
  return Array.from(classesSet).sort();
};

// Форматирование строки классов для отображения
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return "Нет данных";
  
  if (isStringArray(classes)) {
    return classes.join(', ');
  } else if (isString(classes)) {
    return classes;
  }
  
  return "Нет данных";
};

// Безопасная функция для проверки наличия класса в списке классов заклинания
export const hasClass = (classes: string[] | string | undefined, className: string): boolean => {
  if (!classes) return false;
  
  if (isStringArray(classes)) {
    return classes.some(c => c.toLowerCase().includes(className.toLowerCase()));
  } else if (isString(classes)) {
    return classes.toLowerCase().includes(className.toLowerCase());
  }
  
  return false;
};

// Вспомогательные функции для проверки типов
export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// Безопасное форматирование массива в строку
export function safeJoin(value: string[] | string | undefined, separator: string = ', '): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.join(separator);
  }
  return value;
}
