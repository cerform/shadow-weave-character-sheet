
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
export const getSpellsByClass = (className: string): CharacterSpell[] => {
  // Стандартные заклинатели
  if (['Бард', 'Волшебник', 'Жрец', 'Друид', 'Чародей', 'Чернокнижник', 'Паладин', 'Следопыт'].includes(className)) {
    return allSpells.filter(spell => spell.classes.includes(className));
  }
  
  // Особые случаи для классов, которые используют заклинания через подклассы
  
  // Воин (Мистический рыцарь) получает заклинания волшебника
  if (className === 'Воин') {
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      // Мистические рыцари могут использовать только заклинания школ Преобразования и Ограждения до 4-го уровня
      ['Преобразование', 'Ограждение'].includes(spell.school) && 
      spell.level <= 4
    );
  }
  
  // Плут (Мистический ловкач) получает заклинания волшебника
  if (className === 'Плут') {
    return allSpells.filter(spell => 
      spell.classes.includes('Волшебник') && 
      // Мистические ловкачи могут использовать только заговоры и заклинания до 4-го уровня
      spell.level <= 4
    );
  }
  
  // Варвар (Путь Тотемного Воина) может накладывать некоторые ритуальные заклинания
  if (className === 'Варвар') {
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
    return allSpells.filter(spell => 
      spell.classes.includes('Друид') && 
      // Заклинания, связанные со стихиями (огонь, вода, воздух, земля)
      ['Воплощение', 'Преобразование'].includes(spell.school) &&
      spell.level <= 5
    );
  }
  
  return [];
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
