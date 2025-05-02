
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

// Получить заклинания для определённого класса
export const getSpellsByClass = (className: string, characterLevel: number = 1): CharacterSpell[] => {
  // Стандартные заклинатели
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Колдун', 'Чернокнижник'].includes(className)) {
    return allSpells.filter(spell => spell.classes.includes(className));
  }
  
  // Полузаклинатели
  if (className === 'Паладин' || className === 'Следопыт') {
    // Доступны только с 2 уровня
    if (characterLevel < 2) return [];
    
    // Максимальный уровень заклинаний для полузаклинателей
    const maxSpellLevel = Math.min(
      Math.ceil(characterLevel / 4) + 1, // 5й уровень на 17м уровне персонажа
      5
    );
    
    return allSpells.filter(spell => 
      spell.classes.includes(className) && 
      spell.level > 0 && // у них нет заговоров
      spell.level <= maxSpellLevel
    );
  }
  
  // Особые случаи для классов, которые используют заклинания через подклассы
  
  // Воин (Мистический рыцарь) получает заклинания волшебника
  if (className === 'Воин') {
    // Доступны только с 3 уровня
    if (characterLevel < 3) return [];
    
    // Максимальный уровень доступных заклинаний зависит от уровня персонажа
    const maxSpellLevel = Math.min(
      Math.floor((characterLevel - 3) / 6) + 2, // 4й уровень на 19м уровне персонажа
      4
    );
    
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      // Мистические рыцари могут использовать только заклинания школ Преобразования и Ограждения
      (spell.school === 'Преобразование' || spell.school === 'Ограждение' || 
        spell.school === 'Воплощение' || spell.school === 'Ограждение') &&
      spell.level <= maxSpellLevel
    );
  }
  
  // Плут (Мистический ловкач) получает заклинания волшебника
  if (className === 'Плут') {
    // Доступны только с 3 уровня
    if (characterLevel < 3) return [];
    
    // Максимальный уровень доступных заклинаний зависит от уровня персонажа
    const maxSpellLevel = Math.min(
      Math.floor((characterLevel - 3) / 6) + 2, // 4й уровень на 19м уровне персонажа
      4
    );
    
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      // Фокусируются на школах Иллюзии и Очарования
      (spell.school === 'Иллюзия' || spell.school === 'Очарование') &&
      spell.level <= maxSpellLevel
    );
  }
  
  // Варвар (Путь Тотемного Воина) может накладывать некоторые ритуальные заклинания
  if (className === 'Варвар') {
    // Доступны только с 3 уровня
    if (characterLevel < 3) return [];
    
    return allSpells.filter(spell => 
      // Доступны только некоторые заклинания друида, связанные с животными и природой
      spell.ritual && 
      spell.classes.includes('Друид') && 
      spell.level === 1 &&
      ['Разговор с животными', 'Зверинное чутьё', 'Общение с природой'].includes(spell.name)
    );
  }
  
  // Монах (Путь Четырех Стихий) может накладывать некоторые заклинания, связанные со стихиями
  if (className === 'Монах') {
    // Доступны только с 3 уровня
    if (characterLevel < 3) return [];
    
    // Максимальный уровень заклинаний зависит от уровня персонажа
    const maxSpellLevel = Math.min(
      Math.floor((characterLevel - 1) / 4) + 1,
      5
    );
    
    return allSpells.filter(spell => 
      spell.classes.includes('Друид') && 
      // Заклинания, связанные со стихиями (огонь, вода, воздух, земля)
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
