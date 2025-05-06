
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getSpellLevelName } from './spellHelpers';

/**
 * Вычисляет максимальный уровень заклинаний и количество известных заклинаний
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } => {
  // Преобразуем класс к нижнему регистру для удобства сравнения
  const classLower = characterClass.toLowerCase();
  
  // Параметры по умолчанию
  let maxSpellLevel = Math.ceil(level / 2);
  let cantripsCount = 3;
  let knownSpells = level + 1;

  // Проверяем класс персонажа и устанавливаем соответствующие значения
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard'].includes(classLower)) {
    // Полноценные заклинатели: Жрец, Друид, Волшебник
    cantripsCount = level < 4 ? 3 : level < 10 ? 4 : 5;
    knownSpells = level + Math.max(1, abilityModifier); // Все заклинания уровня + модификатор характеристики
    maxSpellLevel = Math.ceil(level / 2); // 1-2 уровень -> 1, 3-4 -> 2, и т.д.
  } 
  else if (['бард', 'чародей', 'колдун', 'bard', 'sorcerer', 'warlock'].includes(classLower)) {
    // Колдуны и Чародеи
    cantripsCount = level < 4 ? 2 : level < 10 ? 3 : 4;
    
    // Для колдунов особые правила по известным заклинаниям
    if (['колдун', 'warlock'].includes(classLower)) {
      if (level === 1) knownSpells = 2;
      else if (level === 2) knownSpells = 3;
      else if (level <= 4) knownSpells = 4;
      else if (level <= 6) knownSpells = 5;
      else if (level <= 8) knownSpells = 6;
      else if (level <= 10) knownSpells = 7;
      else if (level <= 12) knownSpells = 8;
      else if (level <= 14) knownSpells = 9;
      else if (level <= 16) knownSpells = 10;
      else if (level <= 18) knownSpells = 11;
      else knownSpells = 12;
      
      // У колдунов другая логика максимального уровня заклинаний
      if (level < 3) maxSpellLevel = 1;
      else if (level < 5) maxSpellLevel = 2;
      else if (level < 7) maxSpellLevel = 3;
      else if (level < 9) maxSpellLevel = 4;
      else if (level < 11) maxSpellLevel = 5;
      else if (level < 13) maxSpellLevel = 5; // У колдунов максимум 5й уровень
      else if (level < 15) maxSpellLevel = 5;
      else if (level < 17) maxSpellLevel = 5;
      else maxSpellLevel = 5;
    }
    // Для чародеев и бардов
    else {
      if (level === 1) knownSpells = level + 1;
      else if (level <= 3) knownSpells = level + 2;
      else if (level <= 7) knownSpells = level + 3;
      else if (level <= 9) knownSpells = level + 4;
      else if (level <= 11) knownSpells = level + 5;
      else if (level <= 15) knownSpells = level + 6;
      else knownSpells = level + 7;
      
      maxSpellLevel = Math.ceil(level / 2);
    }
  } 
  else if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(classLower)) {
    // Полу-заклинатели: Паладин, Следопыт
    cantripsCount = 0; // Нет заговоров
    knownSpells = Math.max(0, Math.floor(level / 2) + abilityModifier); // половина уровня + модификатор
    maxSpellLevel = Math.ceil(level / 5);
    
    // Для следопытов есть заговоры с 2 уровня
    if (['следопыт', 'ranger'].includes(classLower)) {
      cantripsCount = level >= 2 ? 1 : 0;
    }
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};

/**
 * Вычисляет максимальный уровень заклинаний для класса и уровня
 */
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};

/**
 * Вычисляет количество известных заклинаний для класса и уровня
 */
export const calculateKnownSpells = (characterClass: string, level: number, abilityModifier: number = 0): number => {
  const { knownSpells } = calculateAvailableSpellsByClassAndLevel(characterClass, level, abilityModifier);
  return knownSpells;
};

/**
 * Фильтрует заклинания по классу и уровню
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  level: number
): SpellData[] => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  
  return spells.filter(spell => {
    // Проверка на соответствие классу
    const classMatches = isSpellAvailableForClass(spell, characterClass);
    
    // Проверка на соответствие уровню
    const levelMatches = spell.level <= maxSpellLevel;
    
    return classMatches && levelMatches;
  });
};

/**
 * Проверяет, доступно ли заклинание для данного класса
 */
export const isSpellAvailableForClass = (spell: SpellData, characterClass: string): boolean => {
  if (!characterClass || !spell.classes) return false;
  
  const characterClassLower = characterClass.toLowerCase();
  
  // Преобразуем classes к массиву для унификации дальнейшей обработки
  let spellClasses: string[] = [];
  if (typeof spell.classes === 'string') {
    spellClasses = [spell.classes.toLowerCase()];
  } else {
    spellClasses = spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '');
  }
  
  // Проверяем соответствие класса
  return spellClasses.some(cls => 
    cls === characterClassLower ||
    (characterClassLower === 'жрец' && cls === 'cleric') ||
    (characterClassLower === 'волшебник' && cls === 'wizard') ||
    (characterClassLower === 'друид' && cls === 'druid') ||
    (characterClassLower === 'бард' && cls === 'bard') ||
    (characterClassLower === 'колдун' && cls === 'warlock') ||
    (characterClassLower === 'чародей' && cls === 'sorcerer') ||
    (characterClassLower === 'паладин' && cls === 'paladin') ||
    (characterClassLower === 'следопыт' && cls === 'ranger')
  );
};

/**
 * Нормализует заклинания из персонажа в CharacterSpell[]
 */
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells) return [];
  
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание - строка, создаем минимальный объект заклинания
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0, // По умолчанию считаем заговором
        school: 'Универсальная',
        description: 'Нет описания'
      };
    }
    return spell;
  });
};

/**
 * Преобразует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) ? spell.description : [spell.description || 'Нет описания'],
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials || ''
  };
};

/**
 * Преобразует заклинания для хранения в состоянии
 */
export const convertSpellsForState = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};
