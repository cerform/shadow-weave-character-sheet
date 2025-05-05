
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

// Получить максимальный уровень заклинаний для заданного уровня персонажа
export const getMaxSpellLevel = (level: number): number => {
  if (level <= 0) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  if (level <= 14) return 7;
  if (level <= 16) return 8;
  return 9;
};

// Нормализация списка заклинаний (преобразование строковых и объектных представлений)
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

// Преобразование любого представления заклинания в SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Нет описания',
    };
  }
  
  return convertCharacterSpellToSpellData(spell);
};

// Преобразование массива заклинаний в массив SpellData
export const convertToSpellDataArray = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Расчёт известных заклинаний на основе класса, уровня и модификатора способности
export const calculateKnownSpells = (characterClass: string, level: number, abilityScores: any): { cantrips: number; spells: number } => {
  // Определяем основную характеристику заклинателя в зависимости от класса
  let spellAbility = 'intelligence';
  
  switch (characterClass.toLowerCase()) {
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      spellAbility = 'wisdom';
      break;
    case 'бард':
    case 'bard':
    case 'чародей':
    case 'sorcerer':
    case 'колдун':
    case 'warlock':
    case 'паладин':
    case 'paladin':
      spellAbility = 'charisma';
      break;
  }
  
  // Получаем значение соответствующей характеристики
  let abilityScore = 10;
  if (abilityScores) {
    if (abilityScores[spellAbility]) {
      abilityScore = abilityScores[spellAbility];
    } else if (spellAbility === 'intelligence' && abilityScores.INT) {
      abilityScore = abilityScores.INT;
    } else if (spellAbility === 'wisdom' && abilityScores.WIS) {
      abilityScore = abilityScores.WIS;
    } else if (spellAbility === 'charisma' && abilityScores.CHA) {
      abilityScore = abilityScores.CHA;
    }
  }
  
  // Расчет модификатора
  const mod = Math.floor((abilityScore - 10) / 2);
  
  // Возвращаем результат
  let cantrips = 0;
  let spells = 0;

  // Calculate known spells based on class
  switch (characterClass.toLowerCase()) {
    case 'бард':
    case 'bard':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = Math.min(level + mod, 22); // Max 22 spells at level 20
      break;
    case 'жрец':
    case 'cleric':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + mod;
      break;
    case 'друид':
    case 'druid':
      cantrips = level >= 4 ? 3 : 2;
      spells = level + mod;
      break;
    case 'паладин':
    case 'paladin':
      cantrips = 0;
      spells = Math.floor(level / 2) + mod;
      break;
    case 'следопыт':
    case 'ranger':
      cantrips = 0;
      spells = Math.floor(level / 2) + mod;
      break;
    case 'волшебник':
    case 'wizard':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + mod; // Base spells, without spellbook extras
      break;
    case 'чародей':
    case 'sorcerer':
      cantrips = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
      spells = level + 1; // Sorcerers don't use ability mod for known spells
      break;
    case 'колдун':
    case 'warlock':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = level + 1; // Warlocks have fixed number of spells known
      break;
    default:
      cantrips = 0;
      spells = 0;
  }

  return {
    cantrips: Math.max(0, cantrips),
    spells: Math.max(0, spells)
  };
};
