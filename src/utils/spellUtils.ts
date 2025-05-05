
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

// Функция для конвертации CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    // Если передана строка, возвращаем базовую структуру SpellData
    return {
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Нет описания',
      classes: [], // Добавляем пустой массив для classes
    };
  }
  
  // Используем функцию из types/spells.ts для конвертации
  return convertCharacterSpellToSpellData(spell);
};

// Функция для нормализации массива заклинаний
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        // Минимальные поля для CharacterSpell
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: 'В, С',
        duration: 'Мгновенная',
        description: 'Нет описания',
        classes: []
      };
    }
    return spell;
  });
};

/**
 * Определяет максимальный уровень заклинаний для персонажа
 */
export const getMaxSpellLevel = (characterLevel: number): number => {
  if (characterLevel >= 17) return 9;
  if (characterLevel >= 15) return 8;
  if (characterLevel >= 13) return 7;
  if (characterLevel >= 11) return 6;
  if (characterLevel >= 9) return 5;
  if (characterLevel >= 7) return 4;
  if (characterLevel >= 5) return 3;
  if (characterLevel >= 3) return 2;
  if (characterLevel >= 1) return 1;
  return 0;
};

/**
 * Рассчитывает количество известных заклинаний для класса
 */
export const calculateKnownSpells = (
  characterClass: string, 
  characterLevel: number, 
  spellcastingModifier: number = 0
): { cantrips: number; spells: number } => {
  // Значения по умолчанию
  let cantrips = 0;
  let spells = 0;
  
  // Конвертируем имя класса в нижний регистр для сравнения
  const className = characterClass.toLowerCase();
  
  // Расчет для каждого класса
  switch (className) {
    case 'бард':
    case 'bard':
      cantrips = 2;
      if (characterLevel >= 4) cantrips = 3;
      if (characterLevel >= 10) cantrips = 4;
      
      // Известные заклинания барда
      spells = 4;
      if (characterLevel >= 3) spells = 6;
      if (characterLevel >= 4) spells = 7;
      if (characterLevel >= 5) spells = 8;
      if (characterLevel >= 6) spells = 9;
      if (characterLevel >= 7) spells = 10;
      if (characterLevel >= 8) spells = 11;
      if (characterLevel >= 9) spells = 12;
      if (characterLevel >= 10) spells = 14;
      if (characterLevel >= 11) spells = 15;
      if (characterLevel >= 13) spells = 16;
      if (characterLevel >= 15) spells = 18;
      if (characterLevel >= 17) spells = 20;
      if (characterLevel >= 19) spells = 22;
      break;
      
    case 'жрец':
    case 'cleric':
      cantrips = 3;
      if (characterLevel >= 4) cantrips = 4;
      if (characterLevel >= 10) cantrips = 5;
      
      // Жрецы готовят заклинания: уровень + модификатор мудрости
      spells = characterLevel + Math.max(1, spellcastingModifier);
      break;
      
    case 'друид':
    case 'druid':
      cantrips = 2;
      if (characterLevel >= 4) cantrips = 3;
      if (characterLevel >= 10) cantrips = 4;
      
      // Друиды готовят заклинания: уровень + модификатор мудрости
      spells = characterLevel + Math.max(1, spellcastingModifier);
      break;
      
    case 'волшебник':
    case 'wizard':
      cantrips = 3;
      if (characterLevel >= 4) cantrips = 4;
      if (characterLevel >= 10) cantrips = 5;
      
      // Волшебники готовят заклинания: уровень + модификатор интеллекта
      spells = characterLevel + Math.max(1, spellcastingModifier);
      break;
      
    case 'колдун':
    case 'warlock':
      cantrips = 2;
      if (characterLevel >= 4) cantrips = 3;
      if (characterLevel >= 10) cantrips = 4;
      
      // Известные заклинания колдуна
      spells = 2;
      if (characterLevel >= 3) spells = 3;
      if (characterLevel >= 5) spells = 4;
      if (characterLevel >= 7) spells = 5;
      if (characterLevel >= 9) spells = 6;
      if (characterLevel >= 11) spells = 8;
      if (characterLevel >= 13) spells = 9;
      if (characterLevel >= 15) spells = 10;
      if (characterLevel >= 17) spells = 11;
      if (characterLevel >= 19) spells = 12;
      break;
      
    case 'чародей':
    case 'sorcerer':
      cantrips = 4;
      if (characterLevel >= 4) cantrips = 5;
      if (characterLevel >= 10) cantrips = 6;
      
      // Известные заклинания чародея
      spells = 2;
      if (characterLevel >= 2) spells = 3;
      if (characterLevel >= 3) spells = 4;
      if (characterLevel >= 4) spells = 5;
      if (characterLevel >= 5) spells = 6;
      if (characterLevel >= 6) spells = 7;
      if (characterLevel >= 7) spells = 8;
      if (characterLevel >= 8) spells = 9;
      if (characterLevel >= 9) spells = 10;
      if (characterLevel >= 10) spells = 11;
      if (characterLevel >= 11) spells = 12;
      if (characterLevel >= 13) spells = 13;
      if (characterLevel >= 15) spells = 14;
      if (characterLevel >= 17) spells = 15;
      break;
      
    case 'паладин':
    case 'paladin':
      cantrips = 0; // Паладины не получают заговоров
      
      // Паладины готовят заклинания: (уровень / 2, округленный вниз) + модификатор харизмы
      spells = Math.floor(characterLevel / 2) + Math.max(1, spellcastingModifier);
      break;
      
    case 'следопыт':
    case 'ranger':
      cantrips = 0; // Следопыты не получают заговоров (если нет особенностей подкласса)
      
      // Следопыты знают фиксированное количество заклинаний
      spells = 0;
      if (characterLevel >= 2) spells = 2;
      if (characterLevel >= 3) spells = 3;
      if (characterLevel >= 5) spells = 4;
      if (characterLevel >= 7) spells = 5;
      if (characterLevel >= 9) spells = 6;
      if (characterLevel >= 11) spells = 7;
      if (characterLevel >= 13) spells = 8;
      if (characterLevel >= 15) spells = 9;
      if (characterLevel >= 17) spells = 10;
      if (characterLevel >= 19) spells = 11;
      break;
      
    // Искусственный интеллект, если такой класс существует в вашей системе
    case 'искуситель':
      cantrips = 3;
      if (characterLevel >= 4) cantrips = 4;
      if (characterLevel >= 10) cantrips = 5;
      
      // Примерное количество заклинаний
      spells = 2;
      if (characterLevel >= 3) spells = 3;
      if (characterLevel >= 5) spells = 4;
      if (characterLevel >= 7) spells = 5;
      if (characterLevel >= 9) spells = 6;
      if (characterLevel >= 11) spells = 7;
      if (characterLevel >= 13) spells = 8;
      if (characterLevel >= 15) spells = 9;
      if (characterLevel >= 17) spells = 10;
      break;
  }
  
  return { cantrips, spells };
};

/**
 * Преобразует массив заклинаний в формат SpellData
 */
export const convertToSpellDataArray = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};
