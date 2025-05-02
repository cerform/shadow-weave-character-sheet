
import { CharacterSpell } from '@/types/character';
import { cantrips } from './cantrips';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';
import { level5 } from './level5';
import { level6 } from './level6';
import { level7 } from './level7';
import { level8 } from './level8';
import { level9 } from './level9';

export const allSpells: CharacterSpell[] = [
  ...cantrips,
  ...level1,
  ...level2,
  ...level3,
  ...level4,
  ...level5,
  ...level6,
  ...level7,
  ...level8,
  ...level9
];

// Получить все заклинания
export const getAllSpells = (): CharacterSpell[] => {
  return allSpells;
};

// Получить все названия заклинаний
export const getAllSpellNames = (): string[] => {
  return allSpells.map(spell => spell.name);
};

// Получить детали заклинания по имени
export const getSpellDetails = (spellName: string): CharacterSpell | undefined => {
  return allSpells.find(spell => spell.name === spellName);
};

// Получение максимального уровня заклинаний для класса и уровня персонажа
const getMaxSpellLevelForClass = (className: string, characterLevel: number): number => {
  // Полные заклинатели (Бард, Волшебник, Жрец, Друид, Чародей)
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей'].includes(className)) {
    if (characterLevel < 3) return 1;        // 1-2 уровень: доступ к 1 кругу
    if (characterLevel < 5) return 2;        // 3-4 уровень: доступ ко 2 кругу
    if (characterLevel < 7) return 3;        // 5-6 уровень: доступ к 3 кругу
    if (characterLevel < 9) return 4;        // 7-8 уровень: доступ к 4 кругу
    if (characterLevel < 11) return 5;       // 9-10 уровень: доступ к 5 кругу
    if (characterLevel < 13) return 6;       // 11-12 уровень: доступ к 6 кругу
    if (characterLevel < 15) return 7;       // 13-14 уровень: доступ к 7 кругу
    if (characterLevel < 17) return 8;       // 15-16 уровень: доступ к 8 кругу
    return 9;                                // 17+ уровень: доступ к 9 кругу
  }
  
  // Чернокнижник имеет особую систему заклинаний
  if (className === 'Чернокнижник') {
    if (characterLevel < 3) return 1;        // 1-2 уровень: доступ к 1 кругу
    if (characterLevel < 5) return 2;        // 3-4 уровень: доступ ко 2 кругу
    if (characterLevel < 7) return 3;        // 5-6 уровень: доступ к 3 кругу
    if (characterLevel < 9) return 4;        // 7-8 уровень: доступ к 4 кругу
    return 5;                                // 9+ уровень: доступ к 5 кругу
  }
  
  // Полузаклинатели (Следопыт, Паладин)
  if (className === 'Паладин' || className === 'Следопыт') {
    if (characterLevel < 2) return 0;        // 1 уровень: нет заклинаний
    if (characterLevel < 5) return 1;        // 2-4 уровень: доступ к 1 кругу
    if (characterLevel < 9) return 2;        // 5-8 уровень: доступ ко 2 кругу
    if (characterLevel < 13) return 3;       // 9-12 уровень: доступ к 3 кругу
    if (characterLevel < 17) return 4;       // 13-16 уровень: доступ к 4 кругу
    return 5;                                // 17+ уровень: доступ к 5 кругу
  }
  
  // Воин (Мистический рыцарь) и Плут (Мистический ловкач)
  if (className === 'Воин' || className === 'Плут') {
    if (characterLevel < 3) return 0;        // 1-2 уровень: нет заклинаний
    if (characterLevel < 7) return 1;        // 3-6 уровень: доступ к 1 кругу
    if (characterLevel < 13) return 2;       // 7-12 уровень: доступ ко 2 кругу
    if (characterLevel < 19) return 3;       // 13-18 уровень: доступ к 3 кругу
    return 4;                                // 19+ уровень: доступ к 4 кругу
  }
  
  // Монах (Путь Четырех Стихий)
  if (className === 'Монах') {
    if (characterLevel < 3) return 0;        // 1-2 уровень: нет заклинаний
    if (characterLevel < 5) return 1;        // 3-4 уровень: доступ к 1 кругу
    if (characterLevel < 9) return 2;        // 5-8 уровень: доступ ко 2 кругу
    if (characterLevel < 13) return 3;       // 9-12 уровень: доступ к 3 кругу
    if (characterLevel < 17) return 4;       // 13-16 уровень: доступ к 4 кругу
    return 5;                                // 17+ уровень: доступ к 5 кругу
  }
  
  // Варвар (Путь Тотемного Воина) может получить некоторые ритуальные заклинания
  if (className === 'Варвар' && characterLevel >= 3) {
    return 1; // Только заклинания 1 круга как ритуалы
  }
  
  return 0; // По умолчанию нет доступных заклинаний
};

// Получить заклинания для определённого класса
export const getSpellsByClass = (className: string, characterLevel: number = 1): CharacterSpell[] => {
  // Максимальный уровень заклинаний для этого класса и уровня персонажа
  const maxSpellLevel = getMaxSpellLevelForClass(className, characterLevel);
  
  // Если нет доступных заклинаний, возвращаем пустой массив
  if (maxSpellLevel === 0) return [];
  
  // Полные заклинатели (включая Чернокнижников)
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(className)) {
    return allSpells.filter(spell => 
      spell.classes.includes(className) && 
      spell.level <= maxSpellLevel // Фильтруем по максимальному доступному уровню
    );
  }
  
  // Полузаклинатели (Паладины и Следопыты)
  if (['Паладин', 'Следопыт'].includes(className)) {
    return allSpells.filter(spell => 
      spell.classes.includes(className) && 
      spell.level > 0 && // У них нет заговоров
      spell.level <= maxSpellLevel
    );
  }
  
  // Воин (Мистический рыцарь)
  if (className === 'Воин') {
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      (spell.school === 'Преобразование' || spell.school === 'Ограждение' || 
       spell.school === 'Воплощение') &&
      ((spell.level === 0 && characterLevel >= 3) || // Заговоры доступны с 3 уровня
       (spell.level > 0 && spell.level <= maxSpellLevel)) // Заклинания уровней 1-4
    );
  }
  
  // Плут (Мистический ловкач)
  if (className === 'Плут') {
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      (spell.school === 'Иллюзия' || spell.school === 'Очарование') &&
      ((spell.level === 0 && characterLevel >= 3) || // Заговоры доступны с 3 уровня
       (spell.level > 0 && spell.level <= maxSpellLevel)) // Заклинания уровней 1-4
    );
  }
  
  // Варвар (Путь Тотемного Воина)
  if (className === 'Варвар') {
    return allSpells.filter(spell => 
      spell.ritual && 
      spell.classes.includes('Друид') && 
      spell.level === 1 &&
      ['Разговор с животными', 'Зверинное чутьё', 'Общение с природой'].includes(spell.name)
    );
  }
  
  // Монах (Путь Четырех Стихий)
  if (className === 'Монах') {
    return allSpells.filter(spell => 
      spell.classes.includes('Друид') && 
      (spell.school === 'Воплощение' || spell.school === 'Преобразование') &&
      spell.level <= maxSpellLevel
    );
  }
  
  return [];
};

// Получить заклинания по нескольким уровням
export const getSpellsByLevels = (levels: number[]): CharacterSpell[] => {
  if (!levels || levels.length === 0) return [];
  return allSpells.filter(spell => levels.includes(spell.level));
};

// Логика для мультиклассирования
export const getMulticlassSpells = (classes: {className: string, level: number}[]): CharacterSpell[] => {
  // Если нет мультиклассов, возвращаем пустой массив
  if (!classes || classes.length === 0) return [];
  
  // Получаем полный уровень заклинателя по правилам мультикласса
  let fullCasterLevel = 0;
  let halfCasterLevel = 0;
  let thirdCasterLevel = 0;
  
  classes.forEach(classInfo => {
    const { className, level } = classInfo;
    
    // Полноценные заклинатели
    if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(className)) {
      fullCasterLevel += level;
    }
    // Полузаклинатели
    else if (['Паладин', 'Следопыт'].includes(className)) {
      halfCasterLevel += level;
    }
    // 1/3 заклинатели (через подклассы)
    else if (['Воин', 'Плут', 'Монах'].includes(className)) {
      thirdCasterLevel += level;
    }
  });
  
  // Суммируем уровни по правилам мультикласса
  const totalCasterLevel = fullCasterLevel + Math.floor(halfCasterLevel / 2) + Math.floor(thirdCasterLevel / 3);
  
  // Определяем максимальный уровень заклинаний
  let maxSpellLevel = 0;
  if (totalCasterLevel >= 1) maxSpellLevel = 1;
  if (totalCasterLevel >= 3) maxSpellLevel = 2;
  if (totalCasterLevel >= 5) maxSpellLevel = 3;
  if (totalCasterLevel >= 7) maxSpellLevel = 4;
  if (totalCasterLevel >= 9) maxSpellLevel = 5;
  if (totalCasterLevel >= 11) maxSpellLevel = 6;
  if (totalCasterLevel >= 13) maxSpellLevel = 7;
  if (totalCasterLevel >= 15) maxSpellLevel = 8;
  if (totalCasterLevel >= 17) maxSpellLevel = 9;
  
  // Собираем все заклинания для всех классов персонажа
  let allAvailableSpells: CharacterSpell[] = [];
  
  classes.forEach(classInfo => {
    const classSpells = getSpellsByClass(classInfo.className, classInfo.level);
    allAvailableSpells = [...allAvailableSpells, ...classSpells.filter(spell => spell.level <= maxSpellLevel)];
  });
  
  // Убираем дубликаты
  return Array.from(new Map(allAvailableSpells.map(spell => [spell.name, spell])).values());
};

// Получить заклинания определённого уровня
export const getSpellsByLevel = (level: number): CharacterSpell[] => {
  return allSpells.filter(spell => spell.level === level);
};

// Получить заклинания определённой школы
export const getSpellsBySchool = (school: string): CharacterSpell[] => {
  return allSpells.filter(spell => spell.school === school);
};

// Экспортируем все заклинания как массив
export const spells: CharacterSpell[] = allSpells;
