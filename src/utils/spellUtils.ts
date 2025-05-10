
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Получение базовой характеристики заклинаний для класса
export const getDefaultCastingAbility = (characterClass: string): string => {
  const classLower = characterClass ? characterClass.toLowerCase() : '';
  
  // Классы, использующие Интеллект
  if (['волшебник', 'wizard', 'изобретатель', 'artificer'].includes(classLower)) {
    return 'intelligence';
  }
  // Классы, использующие Мудрость
  else if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(classLower)) {
    return 'wisdom';
  }
  // Классы, использующие Харизму
  else if (['бард', 'bard', 'колдун', 'warlock', 'чародей', 'sorcerer', 'паладин', 'paladin'].includes(classLower)) {
    return 'charisma';
  }
  
  return 'intelligence'; // По умолчанию
};

// Расчет DC спасброска от заклинаний
export const calculateSpellcastingDC = (character: Character): number => {
  if (!character || !character.spellcasting) return 8;
  
  // Если DC уже рассчитан, используем его
  if (character.spellcasting.dc) {
    return character.spellcasting.dc;
  }
  
  // Получаем базовую характеристику для заклинаний
  const ability = character.spellcasting.ability || getDefaultCastingAbility(character.class);
  
  // Получаем модификатор характеристики
  let abilityMod = 0;
  if (ability === 'intelligence' && character.abilities) {
    abilityMod = Math.floor((character.abilities.INT || character.intelligence || 10) - 10) / 2;
  } else if (ability === 'wisdom' && character.abilities) {
    abilityMod = Math.floor((character.abilities.WIS || character.wisdom || 10) - 10) / 2;
  } else if (ability === 'charisma' && character.abilities) {
    abilityMod = Math.floor((character.abilities.CHA || character.charisma || 10) - 10) / 2;
  }
  
  // Бонус мастерства
  const profBonus = character.proficiencyBonus || Math.ceil(character.level / 4) + 1;
  
  // DC = 8 + модификатор характеристики + бонус мастерства
  return 8 + abilityMod + profBonus;
};

// Расчет бонуса атаки заклинаниями
export const calculateSpellAttackBonus = (character: Character): number => {
  if (!character || !character.spellcasting) return 0;
  
  // Если бонус атаки уже рассчитан, используем его
  if (character.spellcasting.attack) {
    return character.spellcasting.attack;
  }
  
  // Получаем базовую характеристику для заклинаний
  const ability = character.spellcasting.ability || getDefaultCastingAbility(character.class);
  
  // Получаем модификатор характеристики
  let abilityMod = 0;
  if (ability === 'intelligence' && character.abilities) {
    abilityMod = Math.floor((character.abilities.INT || character.intelligence || 10) - 10) / 2;
  } else if (ability === 'wisdom' && character.abilities) {
    abilityMod = Math.floor((character.abilities.WIS || character.wisdom || 10) - 10) / 2;
  } else if (ability === 'charisma' && character.abilities) {
    abilityMod = Math.floor((character.abilities.CHA || character.charisma || 10) - 10) / 2;
  }
  
  // Бонус мастерства
  const profBonus = character.proficiencyBonus || Math.ceil(character.level / 4) + 1;
  
  // Бонус атаки = модификатор характеристики + бонус мастерства
  return abilityMod + profBonus;
};

// Проверка, подготовлено ли достаточно заклинаний
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character) return false;
  
  const limit = getPreparedSpellsLimit(character);
  const currentPrepared = (character.spells || []).filter(s => {
    if (typeof s === 'string') return false;
    return s.prepared && s.level > 0;
  }).length;
  
  return currentPrepared < limit;
};

// Получение лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  let modifier = 0;
  
  // Определяем характеристику для заклинаний
  if (['волшебник', 'wizard', 'изобретатель', 'artificer'].includes(classLower)) {
    modifier = Math.floor((character.abilities?.INT || character.intelligence || 10) - 10) / 2;
  } else if (['жрец', 'cleric', 'друид', 'druid'].includes(classLower)) {
    modifier = Math.floor((character.abilities?.WIS || character.wisdom || 10) - 10) / 2;
  } else if (['паладин', 'paladin'].includes(classLower)) {
    modifier = Math.floor((character.abilities?.CHA || character.charisma || 10) - 10) / 2;
  } else {
    return 999; // Для классов без подготовки заклинаний (бард, колдун, чародей)
  }
  
  return Math.max(1, modifier + character.level);
};

// Проверка, добавлено ли заклинание персонажу
export const isSpellAdded = (character: Character, spellName: string): boolean => {
  if (!character || !character.spells) return false;
  
  return character.spells.some(spell => {
    if (typeof spell === 'string') {
      return spell === spellName;
    }
    return spell.name === spellName;
  });
};

// Получение модификатора базовой характеристики для заклинаний
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character) return 0;
  
  const ability = character.spellcasting?.ability || getDefaultCastingAbility(character.class);
  
  if (ability === 'intelligence') {
    return Math.floor((character.abilities?.INT || character.intelligence || 10) - 10) / 2;
  } else if (ability === 'wisdom') {
    return Math.floor((character.abilities?.WIS || character.wisdom || 10) - 10) / 2;
  } else if (ability === 'charisma') {
    return Math.floor((character.abilities?.CHA || character.charisma || 10) - 10) / 2;
  }
  
  return 0;
};

// Фильтрация заклинаний по классу и уровню
export const filterSpellsByClassAndLevel = (
  spells: SpellData[], 
  characterClass: string, 
  level: number
): SpellData[] => {
  const maxSpellLevel = getMaxSpellLevel(characterClass, level);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) return false;
    
    // Проверяем, что заклинание доступно классу персонажа
    if (!spell.classes) return false;
    
    let spellClasses: string[] = [];
    if (typeof spell.classes === 'string') {
      spellClasses = [spell.classes.toLowerCase()];
    } else {
      spellClasses = spell.classes.map(c => typeof c === 'string' ? c.toLowerCase() : '');
    }
    
    // Сопоставляем названия классов на английском и русском
    const classMapping: Record<string, string[]> = {
      'bard': ['бард', 'bard'],
      'cleric': ['жрец', 'cleric'],
      'druid': ['друид', 'druid'],
      'paladin': ['паладин', 'paladin'],
      'ranger': ['следопыт', 'ranger'],
      'sorcerer': ['чародей', 'sorcerer'],
      'warlock': ['колдун', 'warlock'],
      'wizard': ['волшебник', 'wizard']
    };
    
    // Проверяем, доступно ли заклинание для данного класса
    for (const [key, variants] of Object.entries(classMapping)) {
      if (variants.includes(classLower)) {
        return spellClasses.some(c => variants.includes(c) || c === key);
      }
    }
    
    return false;
  });
};

// Получение максимального уровня заклинаний
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const fullCasters = ['волшебник', 'wizard', 'жрец', 'cleric', 'друид', 'druid', 'чародей', 'sorcerer', 'бард', 'bard'];
  const halfCasters = ['паладин', 'paladin', 'следопыт', 'ranger'];
  
  const classLower = characterClass.toLowerCase();
  
  if (fullCasters.includes(classLower)) {
    if (level >= 17) return 9;
    if (level >= 15) return 8;
    if (level >= 13) return 7;
    if (level >= 11) return 6;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return 1;
  } 
  else if (halfCasters.includes(classLower)) {
    return Math.ceil(level / 2);
  }
  else if (classLower === 'колдун' || classLower === 'warlock') {
    if (level >= 17) return 5;
    if (level >= 11) return 5;
    if (level >= 9) return 5;
    if (level >= 7) return 4;
    if (level >= 5) return 3;
    if (level >= 3) return 2;
    return 1;
  }
  
  return 0;
};

// Расчет доступных заклинаний по классу и уровню
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  abilityModifier = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number; } => {
  const classLower = characterClass.toLowerCase();
  
  let cantripsCount = 0;
  let knownSpells = 0;
  const maxSpellLevel = getMaxSpellLevel(classLower, level);
  
  // Определяем количество заговоров и известных заклинаний
  if (['волшебник', 'wizard'].includes(classLower)) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = level * 2; // Волшебники записывают заклинания в книгу
  } 
  else if (['жрец', 'cleric', 'друид', 'druid'].includes(classLower)) {
    cantripsCount = level >= 10 ? 5 : level >= 4 ? 4 : 3;
    knownSpells = level + abilityModifier; // Жрецы и друиды знают все заклинания класса
  }
  else if (['бард', 'bard'].includes(classLower)) {
    cantripsCount = level >= 10 ? 4 : 2;
    // Барды: уровень 1 = 4 заклинания, уровень 2 = 5, ...
    if (level === 1) knownSpells = 4;
    else knownSpells = 3 + level;
  }
  else if (['колдун', 'warlock'].includes(classLower)) {
    cantripsCount = level >= 10 ? 4 : level >= 4 ? 3 : 2;
    // Колдуны: уровень 1 = 2 заклинания, уровень 2 = 3, ...
    knownSpells = 1 + level;
  }
  else if (['чародей', 'sorcerer'].includes(classLower)) {
    cantripsCount = level >= 10 ? 6 : level >= 4 ? 5 : 4;
    // Чародеи: уровень 1 = 2 заклинания, уровень 2 = 3, ...
    knownSpells = 1 + level;
  }
  else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(classLower)) {
    cantripsCount = 0; // Паладины и следопыты не знают заговоров
    knownSpells = Math.floor(level / 2) + 1 + abilityModifier;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Преобразование заклинаний для состояния
export const convertSpellsForState = (spells: any[]): SpellData[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: 'В',
        duration: 'Мгновенная',
        description: '',
        prepared: true
      };
    }
    
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toString().toLowerCase().replace(/\s+/g, '-')}`,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || 'В',
      duration: spell.duration || 'Мгновенная',
    };
  });
};

// Нормализация заклинаний
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    }
    
    return {
      ...spell,
      id: spell.id || `spell-${(spell.name || '').toString().toLowerCase().replace(/\s+/g, '-')}`,
      name: spell.name || 'Неизвестное заклинание',
      level: spell.level || 0,
      school: spell.school || 'Универсальная'
    };
  });
};

// Преобразование в SpellData
export const convertToSpellData = (spells: any[]): SpellData[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: 'В',
        duration: 'Мгновенная',
        description: '',
      };
    }
    
    return {
      id: spell.id || `spell-${(spell.name || '').toString().toLowerCase().replace(/\s+/g, '-')}`,
      name: spell.name || 'Неизвестное заклинание',
      level: spell.level || 0,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || 'В',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      prepared: spell.prepared || false,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      materials: spell.materials || '',
    };
  });
};

// Преобразование списка заклинаний
export const convertSpellList = (spells: any[]): SpellData[] => {
  return convertToSpellData(spells);
};
