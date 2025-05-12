
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Получает уровень заклинания (число)
export const getSpellLevel = (spell: CharacterSpell | SpellData | string): number => {
  if (typeof spell === 'string') {
    // Если это строка, мы не можем определить уровень
    return 0;
  }
  
  return 'level' in spell ? spell.level : 0;
};

// Проверяет, подготовлено ли заклинание
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') {
    // Строки-заклинания считаем всегда подготовленными
    return true;
  }
  
  return spell.prepared === true;
};

// Проверяет, является ли объект объектом CharacterSpell
export const isCharacterSpellObject = (spell: CharacterSpell | SpellData | string): spell is CharacterSpell => {
  return typeof spell !== 'string' && 'prepared' in spell;
};

// Получает название уровня заклинания
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0: return 'Заговор';
    case 1: return '1-й уровень';
    case 2: return '2-й уровень';
    case 3: return '3-й уровень';
    case 4: return '4-й уровень';
    case 5: return '5-й уровень';
    case 6: return '6-й уровень';
    case 7: return '7-й уровень';
    case 8: return '8-й уровень';
    case 9: return '9-й уровень';
    default: return `${level}-й уровень`;
  }
};

// Функция для преобразования строки или объекта в объект CharacterSpell
export const toCharacterSpell = (spell: string | SpellData | CharacterSpell): CharacterSpell => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0
    };
  }
  
  if ('prepared' in spell) {
    // Уже CharacterSpell
    return spell;
  }
  
  // Преобразуем из SpellData
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: false
  };
};

// Функция для фильтрации заклинаний по уровню
export const filterSpellsByLevel = (spells: (CharacterSpell | string)[], level: number): (CharacterSpell | string)[] => {
  return spells.filter(spell => {
    if (typeof spell === 'string') {
      // Строки по умолчанию считаем заговорами (уровень 0)
      return level === 0;
    }
    return spell.level === level;
  });
};

// Получаем максимальный уровень заклинаний для класса и уровня персонажа
export const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
  const classLower = characterClass.toLowerCase();
  
  if (['волшебник', 'маг', 'wizard', 'жрец', 'cleric', 'бард', 'bard', 'друид', 'druid'].includes(classLower)) {
    return Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['колдун', 'чародей', 'warlock', 'sorcerer'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 2));
  } else if (['паладин', 'paladin', 'рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 4));
  }
  
  return 0;
};
