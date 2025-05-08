
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Получить максимальный уровень заклинаний, доступный персонажу
export const getMaxSpellLevel = (character: Character): number => {
  if (!character || !character.level) return 0;
  
  // Стандартные правила для максимального уровня заклинаний
  if (character.level >= 17) return 9;
  if (character.level >= 15) return 8;
  if (character.level >= 13) return 7;
  if (character.level >= 11) return 6;
  if (character.level >= 9) return 5;
  if (character.level >= 7) return 4;
  if (character.level >= 5) return 3;
  if (character.level >= 3) return 2;
  if (character.level >= 1) return 1;
  
  return 0;
};

// Расчет лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const className = character.class?.toLowerCase();
  const level = character.level || 1;
  
  // Получаем модификатор основной характеристики заклинаний
  const getSpellMod = () => {
    const abilities = character.abilities || {
      strength: character.strength || 10,
      dexterity: character.dexterity || 10,
      constitution: character.constitution || 10, 
      intelligence: character.intelligence || 10,
      wisdom: character.wisdom || 10,
      charisma: character.charisma || 10
    };
    
    if (['жрец', 'друид', 'следопыт', 'cleric', 'druid', 'ranger'].includes(className || '')) {
      return Math.floor((abilities.wisdom - 10) / 2);
    } else if (['волшебник', 'wizard', 'artificer'].includes(className || '')) {
      return Math.floor((abilities.intelligence - 10) / 2);
    } else {
      return Math.floor((abilities.charisma - 10) / 2);
    }
  };
  
  const spellMod = getSpellMod();
  
  // Расчет по классам
  if (['жрец', 'друид', 'cleric', 'druid'].includes(className || '')) {
    return level + spellMod;
  } else if (['паладин', 'следопыт', 'paladin', 'ranger'].includes(className || '')) {
    return Math.floor(level / 2) + spellMod;
  } else if (['волшебник', 'wizard'].includes(className || '')) {
    return level + spellMod;
  }
  
  // Для других классов (бард, чародей, колдун) нет лимита на подготовку, они знают заклинания напрямую
  return 0;
};

// Проверка возможности подготовки дополнительных заклинаний
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character || !character.spells) return true;
  
  const limit = getPreparedSpellsLimit(character);
  if (limit <= 0) return true; // Для классов без лимита подготовки
  
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Не считаем заговоры
  }).length;
  
  return preparedCount < limit;
};

// Нормализация списка заклинаний
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0, // по умолчанию - заговор
        description: 'Нет описания',
        school: 'Универсальная'
      };
    }
    return spell;
  });
};

// Конвертация CharacterSpell в SpellData
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
    description: typeof spell.description === 'string' ? [spell.description] : (spell.description || ['Нет описания']),
    classes: typeof spell.classes === 'string' ? [spell.classes] : (spell.classes || []),
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  };
};

// Calculate max spell level and known spells count based on class and character level
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass?: string, 
  level: number = 1,
  abilityModifier: number = 0
) => {
  if (!characterClass) {
    return { maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 };
  }

  const className = characterClass.toLowerCase();
  
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Calculate max spell level based on character level
  if (level >= 1) maxSpellLevel = 1;
  if (level >= 3) maxSpellLevel = 2;
  if (level >= 5) maxSpellLevel = 3;
  if (level >= 7) maxSpellLevel = 4;
  if (level >= 9) maxSpellLevel = 5;
  if (level >= 11) maxSpellLevel = 6;
  if (level >= 13) maxSpellLevel = 7;
  if (level >= 15) maxSpellLevel = 8;
  if (level >= 17) maxSpellLevel = 9;
  
  // Determine number of cantrips and spells known based on class
  switch (className) {
    case 'бард':
      cantripsCount = 2 + Math.floor(level / 10);
      knownSpells = level + Math.max(2, abilityModifier);
      break;
    case 'волшебник':
    case 'маг':
      cantripsCount = 3 + Math.floor(level / 10);
      // Wizards learn from their spellbook, minimum of level + INT modifier
      knownSpells = level * 2 + abilityModifier;
      break;
    case 'чародей':
      cantripsCount = 4 + Math.floor(level / 10);
      knownSpells = level + abilityModifier;
      break;
    case 'колдун':
      cantripsCount = 2 + Math.floor(level / 6);
      knownSpells = Math.min(level + 1, 15) + Math.floor(abilityModifier / 2);
      break;
    case 'жрец':
    case 'друид':
      cantripsCount = 3 + Math.floor(level / 10);
      // Clerics and druids prepare spells equal to level + wisdom modifier
      knownSpells = level + abilityModifier;
      break;
    case 'паладин':
      // Paladins start at level 2
      maxSpellLevel = level <= 1 ? 0 : Math.min(Math.ceil((level - 1) / 4), 5);
      cantripsCount = 0; // Paladins don't get cantrips
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
      break;
    case 'следопыт':
      // Rangers start at level 2
      maxSpellLevel = level <= 1 ? 0 : Math.min(Math.ceil((level - 1) / 4), 5);
      cantripsCount = 0; // Rangers traditionally don't get cantrips
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
      break;
    default:
      // For non-spellcasting classes or unknown classes
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  // Make sure values are never negative
  cantripsCount = Math.max(0, cantripsCount);
  knownSpells = Math.max(0, knownSpells);
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Обновляем типы заклинаний, чтобы решить проблему с преобразованием string в string[]
export const safelyConvertSpellDescription = (description: string | string[] | undefined): string[] => {
  if (!description) return ['Нет описания'];
  if (typeof description === 'string') return [description];
  return description;
};

export const safelyConvertSpellClasses = (classes: string | string[] | undefined): string[] => {
  if (!classes) return [];
  if (typeof classes === 'string') return [classes];
  return classes;
};
