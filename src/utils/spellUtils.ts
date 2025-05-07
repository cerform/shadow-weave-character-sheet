
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Преобразование списка заклинаний персонажа в единый формат
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) {
    return [];
  }

  // Преобразуем все заклинания в объекты CharacterSpell
  return character.spells.map((spell): CharacterSpell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        prepared: false,
        level: 0, // По умолчанию заговор
      };
    }
    return {
      id: spell.id || '',
      name: spell.name || '',
      prepared: !!spell.prepared,
      level: spell.level || 0,
      school: spell.school || '',
      castingTime: spell.castingTime || '',
      range: spell.range || '',
      description: spell.description || '',
    };
  });
};

// Получение максимального уровня заклинаний для класса и уровня персонажа
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  // Таблица максимальных уровней заклинаний в зависимости от класса и уровня
  const maxSpellLevelsByClass: Record<string, number[]> = {
    wizard: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    cleric: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    druid: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    bard: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    sorcerer: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    warlock: [0,1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5],
    paladin: [0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5],
    ranger: [0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5],
    artificer: [0,1,1,2,2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5],
    // Русские названия классов
    волшебник: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    жрец: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    друид: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    бард: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    чародей: [0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,9],
    колдун: [0,1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5],
    паладин: [0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5],
    следопыт: [0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5],
    изобретатель: [0,1,1,2,2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5],
  };

  // Безопасное получение уровня с нижним регистром
  const classLower = characterClass.toLowerCase();
  const validLevel = Math.min(Math.max(1, level), 20);
  
  // Если класс неизвестен, возвращаем 0 (только заговоры)
  if (!maxSpellLevelsByClass[classLower]) {
    return 0;
  }
  
  return maxSpellLevelsByClass[classLower][validLevel];
};

export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  spellcastingModifier = 0
) => {
  // Получаем максимальный доступный уровень заклинаний
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  
  // Начальные значения для всех классов
  let cantripsKnown = 0;
  let spellsKnown = 0;
  let spellsPrepared = 0;
  let hasSpellbook = false;
  
  const classLower = characterClass.toLowerCase();
  
  // Определяем количество заклинаний в зависимости от класса
  switch (classLower) {
    case 'wizard':
    case 'волшебник':
      cantripsKnown = 3 + Math.floor((level - 1) / 9);
      spellsPrepared = level + spellcastingModifier;
      hasSpellbook = true;
      break;
      
    case 'cleric':
    case 'druid':
    case 'жрец':
    case 'друид':
      cantripsKnown = 3 + Math.floor((level - 1) / 9);
      spellsPrepared = level + spellcastingModifier;
      break;
      
    case 'bard':
    case 'бард':
      cantripsKnown = 2 + Math.floor((level - 1) / 9);
      if (level === 1) spellsKnown = 4;
      else spellsKnown = 4 + Math.floor((level - 1) * 3 / 2);
      break;
      
    case 'sorcerer':
    case 'чародей':
      cantripsKnown = 4 + Math.floor((level - 1) / 5);
      if (level === 1) spellsKnown = 2;
      else spellsKnown = 2 + (level - 1);
      break;
      
    case 'warlock':
    case 'колдун':
      cantripsKnown = 2 + Math.floor((level - 1) / 9);
      if (level === 1) spellsKnown = 2;
      else spellsKnown = 2 + Math.floor((level + 1) / 2);
      break;
      
    case 'paladin':
    case 'паладин':
      if (level >= 2) {
        spellsPrepared = Math.floor(level / 2) + spellcastingModifier;
      }
      break;
      
    case 'ranger':
    case 'следопыт':
      if (level === 2) spellsKnown = 2;
      else if (level >= 3) spellsKnown = 3 + (level - 3);
      break;
      
    case 'artificer':
    case 'изобретатель':
      cantripsKnown = 2 + (level >= 10 ? 1 : 0);
      spellsPrepared = Math.ceil(level / 2) + spellcastingModifier;
      break;
  }
  
  return {
    maxSpellLevel,
    cantripsKnown,
    spellsKnown,
    spellsPrepared,
    hasSpellbook
  };
};
