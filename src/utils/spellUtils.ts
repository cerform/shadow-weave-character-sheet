
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Определяет базовую характеристику заклинаний для класса
export const getDefaultCastingAbility = (characterClass?: string): string => {
  if (!characterClass) return 'intelligence';
  
  const classLower = String(characterClass).toLowerCase();
  
  if (classLower.includes('колдун') || classLower.includes('warlock') || 
      classLower.includes('бард') || classLower.includes('bard') ||
      classLower.includes('чародей') || classLower.includes('sorcerer')) {
    return 'charisma';
  }
  else if (classLower.includes('жрец') || classLower.includes('cleric') || 
           classLower.includes('друид') || classLower.includes('druid') ||
           classLower.includes('следопыт') || classLower.includes('ranger')) {
    return 'wisdom';
  }
  else {
    return 'intelligence';
  }
};

// Высчитывает сложность заклинаний
export const calculateSpellcastingDC = (character: Character): number => {
  if (!character) return 10;
  
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return 8 + abilityMod + profBonus;
};

// Рассчитывает бонус атаки заклинанием
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character) return 0;
  
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return abilityMod + profBonus;
};

// Получает модификатор основной характеристики заклинаний
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character) return 0;
  
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  
  if (ability === 'charisma') {
    return Math.floor((character.abilities.CHA || character.abilities.charisma || 10) - 10) / 2;
  } else if (ability === 'wisdom') {
    return Math.floor((character.abilities.WIS || character.abilities.wisdom || 10) - 10) / 2;
  } else {
    return Math.floor((character.abilities.INT || character.abilities.intelligence || 10) - 10) / 2;
  }
};

// Конвертирование spells в CharacterSpell[]
export const normalizeSpells = (character: Character | null): CharacterSpell[] => {
  if (!character || !character.spells || !Array.isArray(character.spells)) {
    return [];
  }

  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${String(spell).toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        prepared: true
      };
    }
    
    // Ensure the spell has an id
    return {
      ...spell,
      id: spell.id || `spell-${String(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
      school: spell.school || 'Универсальная'
    };
  });
};

// Проверка, есть ли заклинание у персонажа
export const isSpellAdded = (character: Character, spellName: string): boolean => {
  if (!character.spells) return false;
  
  return character.spells.some(spell => {
    if (typeof spell === 'string') {
      return spell === spellName;
    }
    return spell.name === spellName;
  });
};

// Конвертирует CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${String(spell.name).toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ''
  };
};

// Конвертирует массив CharacterSpell в SpellData
export const convertCharacterSpellsToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(convertToSpellData);
};

// Получает лимит подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  const spellAbility = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  
  const abilityScore = spellAbility === 'wisdom' ? 
    character.abilities.WIS || character.abilities.wisdom : 
    spellAbility === 'charisma' ? 
      character.abilities.CHA || character.abilities.charisma : 
      character.abilities.INT || character.abilities.intelligence;
  
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const level = character.level || 1;
  
  return Math.max(1, abilityMod + level);
};

// Проверка, можно ли подготовить ещё заклинания
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spells) return true;
  
  const limit = getPreparedSpellsLimit(character);
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0;
  }).length;
  
  return preparedCount < limit;
};

// Расчет доступных заклинаний по классу и уровню
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number = 1,
  abilityModifier: number = 0
): { maxSpellLevel: number, cantripsCount: number, knownSpells: number } => {
  // Определяем базовые значения
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;

  // Определяем максимальный уровень заклинаний
  if (level >= 17) maxSpellLevel = 9;
  else if (level >= 15) maxSpellLevel = 8;
  else if (level >= 13) maxSpellLevel = 7;
  else if (level >= 11) maxSpellLevel = 6;
  else if (level >= 9) maxSpellLevel = 5;
  else if (level >= 7) maxSpellLevel = 4;
  else if (level >= 5) maxSpellLevel = 3;
  else if (level >= 3) maxSpellLevel = 2;
  else if (level >= 1) maxSpellLevel = 1;

  // Определяем количество заговоров и известных заклинаний для разных классов
  const classLower = characterClass.toLowerCase();
  
  if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = 6 + (level * 2); // Волшебники записывают в книгу, не считая свитки/сокровища
  } 
  else if (classLower.includes('бард') || classLower.includes('bard')) {
    cantripsCount = 2;
    if (level >= 10) cantripsCount = 4;
    knownSpells = level + 3; // Начиная с 4
  } 
  else if (classLower.includes('жрец') || classLower.includes('cleric') || 
           classLower.includes('друид') || classLower.includes('druid')) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = level + abilityModifier; // Базовая характеристика + уровень
  } 
  else if (classLower.includes('колдун') || classLower.includes('warlock')) {
    cantripsCount = level >= 10 ? 4 : 2;
    knownSpells = Math.min(15, level + 1); // Максимум 15
  } 
  else if (classLower.includes('чародей') || classLower.includes('sorcerer')) {
    cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
    knownSpells = level + 1; 
  }
  else if (classLower.includes('паладин') || classLower.includes('paladin')) {
    cantripsCount = 0; // Паладины не знают заговоров
    knownSpells = Math.floor(level / 2) + abilityModifier; // Половина уровня + харизма
  }
  else if (classLower.includes('следопыт') || classLower.includes('ranger')) {
    cantripsCount = 0; // Следопыты не знают заговоров по умолчанию
    knownSpells = Math.floor(level / 2) + abilityModifier; // Половина уровня + мудрость
  }

  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Получает максимальный уровень заклинаний
export const getMaxSpellLevel = (level: number): number => {
  if (level >= 17) return 9;
  if (level >= 15) return 8;
  if (level >= 13) return 7;
  if (level >= 11) return 6;
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
};

// Фильтрует заклинания по классу и уровню
export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  const maxSpellLevel = getMaxSpellLevel(characterLevel);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) return false;
    
    // Проверяем соответствие классу
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        return spell.classes.some(cls => 
          String(cls).toLowerCase().includes(classLower)
        );
      } else {
        return String(spell.classes).toLowerCase().includes(classLower);
      }
    }
    
    return false;
  });
};
