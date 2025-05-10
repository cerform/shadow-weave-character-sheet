
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Нормализация списка заклинаний
export const normalizeSpells = (character: any): CharacterSpell[] => {
  if (!character || !character.spells) return [];

  return character.spells.map((spell: any) => {
    if (typeof spell === 'string') {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'На себя',
        components: '',
        duration: 'Мгновенная',
        description: '',
        prepared: false,
      };
    }
    
    // Убедимся, что у заклинания есть id
    return {
      ...spell,
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  });
};

// Конвертирование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
  };
};

// Проверка возможности подготовить ещё заклинания
export const canPrepareMoreSpells = (
  character: any,
  currentPreparedCount: number = 0
): boolean => {
  if (!character || !character.spellcasting) return false;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  if (preparedLimit <= 0) return true; // Если лимита нет, можно готовить сколько угодно
  
  return currentPreparedCount < preparedLimit;
};

// Получает лимит подготовленных заклинаний
export const getPreparedSpellsLimit = (character: any): number => {
  if (!character) return 0;

  // Определяем базовую характеристику для заклинаний
  const className = character.class ? character.class.toLowerCase() : '';
  const level = character.level || 1;
  const abilities = character.abilities || {};
  
  // Определяем модификатор соответствующей характеристики
  let abilityModifier = 0;
  
  if (className.includes('волшебник') || className.includes('wizard')) {
    abilityModifier = getAbilityModifier(abilities.INT || abilities.intelligence || 10);
  } else if (className.includes('жрец') || className.includes('cleric') || 
             className.includes('друид') || className.includes('druid') || 
             className.includes('следопыт') || className.includes('ranger')) {
    abilityModifier = getAbilityModifier(abilities.WIS || abilities.wisdom || 10);
  } else if (className.includes('паладин') || className.includes('paladin')) {
    abilityModifier = getAbilityModifier(abilities.CHA || abilities.charisma || 10);
  } else {
    return 0; // Класс не требует подготовки заклинаний
  }
  
  // Жрецы, друиды и волшебники: уровень + модификатор
  return level + abilityModifier;
};

// Вычисление модификатора характеристики
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Конвертация списка заклинаний для состояния компонента
export const convertSpellsForState = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.map(spell => ({
    ...spell,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
};

// Проверка, добавлено ли заклинание
export const isSpellAdded = (spellId: string, spells: CharacterSpell[]): boolean => {
  return spells.some(spell => spell.id === spellId);
};

// Получение активной школы магии
export const getActiveSchool = (school: string): string => {
  const schoolsMap: Record<string, string> = {
    'вызов': 'conjuration',
    'воплощение': 'evocation',
    'иллюзия': 'illusion',
    'некромантия': 'necromancy',
    'ограждение': 'abjuration',
    'очарование': 'enchantment',
    'преобразование': 'transmutation',
    'прорицание': 'divination',
    'универсальная': 'universal'
  };
  
  return schoolsMap[school.toLowerCase()] || 'universal';
};

// Получение перевода школы магии
export const getSchoolTranslation = (school: string): string => {
  const schoolsMap: Record<string, string> = {
    'conjuration': 'Вызов',
    'evocation': 'Воплощение',
    'illusion': 'Иллюзия',
    'necromancy': 'Некромантия',
    'abjuration': 'Ограждение',
    'enchantment': 'Очарование',
    'transmutation': 'Преобразование',
    'divination': 'Прорицание',
    'universal': 'Универсальная'
  };
  
  return schoolsMap[school.toLowerCase()] || school;
};

// Функции для Tab SpellsTab
export const getDefaultCastingAbility = (characterClass: string = ''): string => {
  const classLower = characterClass.toLowerCase();
  
  if (classLower.includes('волшебник') || classLower.includes('wizard') ||
      classLower.includes('изобретатель') || classLower.includes('artificer')) {
    return 'intelligence';
  } else if (classLower.includes('жрец') || classLower.includes('cleric') ||
             classLower.includes('друид') || classLower.includes('druid') ||
             classLower.includes('следопыт') || classLower.includes('ranger')) {
    return 'wisdom';
  } else {
    return 'charisma'; // По умолчанию для бардов, чародеев, колдунов, паладинов
  }
};

export const calculateSpellcastingDC = (character: any): number => {
  if (!character) return 8;
  
  const profBonus = character.proficiencyBonus || 2;
  const characterClass = character.class ? character.class.toLowerCase() : '';
  const abilities = character.abilities || {};
  
  // Определяем модификатор заклинательной характеристики
  let abilityMod = 0;
  
  if (characterClass.includes('волшебник') || characterClass.includes('wizard') ||
      characterClass.includes('изобретатель') || characterClass.includes('artificer')) {
    abilityMod = getAbilityModifier(abilities.INT || abilities.intelligence || 10);
  } else if (characterClass.includes('жрец') || characterClass.includes('cleric') ||
             characterClass.includes('друид') || characterClass.includes('druid') ||
             characterClass.includes('следопыт') || characterClass.includes('ranger')) {
    abilityMod = getAbilityModifier(abilities.WIS || abilities.wisdom || 10);
  } else {
    abilityMod = getAbilityModifier(abilities.CHA || abilities.charisma || 10);
  }
  
  // Формула расчета СЛ заклинания: 8 + бонус мастерства + модификатор заклинательной характеристики
  return 8 + profBonus + abilityMod;
};

export const calculateSpellAttackBonus = (character: any): number => {
  if (!character) return 0;
  
  const profBonus = character.proficiencyBonus || 2;
  const characterClass = character.class ? character.class.toLowerCase() : '';
  const abilities = character.abilities || {};
  
  // Определяем модификатор заклинательной характеристики
  let abilityMod = 0;
  
  if (characterClass.includes('волшебник') || characterClass.includes('wizard') ||
      characterClass.includes('изобретатель') || characterClass.includes('artificer')) {
    abilityMod = getAbilityModifier(abilities.INT || abilities.intelligence || 10);
  } else if (characterClass.includes('жрец') || characterClass.includes('cleric') ||
             characterClass.includes('друид') || characterClass.includes('druid') ||
             characterClass.includes('следопыт') || characterClass.includes('ranger')) {
    abilityMod = getAbilityModifier(abilities.WIS || abilities.wisdom || 10);
  } else {
    abilityMod = getAbilityModifier(abilities.CHA || abilities.charisma || 10);
  }
  
  // Формула расчета бонуса атаки: бонус мастерства + модификатор заклинательной характеристики
  return profBonus + abilityMod;
};

// Функции для Character Spell Selection
export const getSpellcastingAbilityModifier = (character: any): number => {
  if (!character) return 0;
  
  const characterClass = character.class ? character.class.toLowerCase() : '';
  const abilities = character.abilities || {};
  
  // Определяем модификатор заклинательной характеристики
  if (characterClass.includes('волшебник') || characterClass.includes('wizard') ||
      characterClass.includes('изобретатель') || characterClass.includes('artificer')) {
    return getAbilityModifier(abilities.INT || abilities.intelligence || 10);
  } else if (characterClass.includes('жрец') || characterClass.includes('cleric') ||
             characterClass.includes('друид') || characterClass.includes('druid') ||
             characterClass.includes('следопыт') || characterClass.includes('ranger')) {
    return getAbilityModifier(abilities.WIS || abilities.wisdom || 10);
  } else {
    return getAbilityModifier(abilities.CHA || abilities.charisma || 10);
  }
};

export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  level: number,
  abilityModifier: number = 0
) => {
  // По умолчанию
  let result = {
    maxSpellLevel: 0,
    cantripsCount: 0,
    knownSpells: 0
  };
  
  const classLower = characterClass.toLowerCase();
  
  // Определяем максимальный уровень заклинаний в зависимости от уровня персонажа
  let maxSpellLevel = 0;
  if (level >= 17) maxSpellLevel = 9;
  else if (level >= 15) maxSpellLevel = 8;
  else if (level >= 13) maxSpellLevel = 7;
  else if (level >= 11) maxSpellLevel = 6;
  else if (level >= 9) maxSpellLevel = 5;
  else if (level >= 7) maxSpellLevel = 4;
  else if (level >= 5) maxSpellLevel = 3;
  else if (level >= 3) maxSpellLevel = 2;
  else if (level >= 1) maxSpellLevel = 1;
  
  // Базовые значения по классам
  if (classLower.includes('жрец') || classLower.includes('cleric') || 
      classLower.includes('друид') || classLower.includes('druid')) {
    result = {
      maxSpellLevel,
      cantripsCount: level >= 10 ? 5 : level >= 4 ? 4 : 3,
      knownSpells: level + Math.max(0, abilityModifier)  // Уровень + модификатор мудрости
    };
  } else if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    result = {
      maxSpellLevel,
      cantripsCount: level >= 10 ? 5 : level >= 4 ? 4 : 3,
      knownSpells: 6 + (level * 2)  // Начинаются с 6, +2 за каждый уровень
    };
  } else if (classLower.includes('бард') || classLower.includes('bard')) {
    result = {
      maxSpellLevel,
      cantripsCount: level >= 10 ? 4 : 2,
      knownSpells: Math.max(4, level + 3)  // Начинаются с 4, далее уровень + 3
    };
  } else if (classLower.includes('колдун') || classLower.includes('warlock')) {
    // Колдуны имеют меньше слотов, но они восстанавливаются на коротком отдыхе
    result = {
      maxSpellLevel: Math.min(5, Math.ceil(level / 2)),  // Максимум 5-й уровень
      cantripsCount: level >= 10 ? 4 : 2,
      knownSpells: Math.min(15, level + 1)  // Максимум 15 заклинаний
    };
  } else if (classLower.includes('чародей') || classLower.includes('sorcerer')) {
    result = {
      maxSpellLevel,
      cantripsCount: level >= 10 ? 6 : level >= 4 ? 5 : 4,
      knownSpells: level + 1  // Уровень + 1
    };
  } else if (classLower.includes('паладин') || classLower.includes('paladin')) {
    result = {
      maxSpellLevel: Math.min(5, Math.ceil(level / 2) - 1),  // Максимум 5-й уровень, начинают с 1-го уровня на 2-м уровне персонажа
      cantripsCount: 0,  // Паладины не знают заговоров
      knownSpells: Math.max(0, Math.floor(level / 2) + abilityModifier)  // Половина уровня (округление вниз) + модификатор харизмы
    };
  } else if (classLower.includes('следопыт') || classLower.includes('ranger')) {
    result = {
      maxSpellLevel: Math.min(5, Math.ceil(level / 2) - 1),  // Максимум 5-й уровень, начинают с 1-го уровня на 2-м уровне персонажа
      cantripsCount: 0,  // Следопыты не знают заговоров (в базовых правилах)
      knownSpells: Math.max(0, Math.floor(level / 2) + 1)  // Половина уровня (округление вниз) + 1
    };
  } else if (classLower.includes('изобретатель') || classLower.includes('artificer')) {
    result = {
      maxSpellLevel: Math.min(5, Math.ceil(level / 2) - 1),  // Максимум 5-й уровень
      cantripsCount: level >= 10 ? 4 : level >= 4 ? 3 : 2,
      knownSpells: level + abilityModifier  // Уровень + модификатор интеллекта
    };
  }
  
  return result;
};

export const filterSpellsByClassAndLevel = (
  spells: SpellData[],
  characterClass: string,
  maxSpellLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  const classLower = characterClass.toLowerCase();
  
  // Сопоставление классов D&D с их английскими названиями
  const classMapping: Record<string, string[]> = {
    'жрец': ['cleric'],
    'волшебник': ['wizard'],
    'бард': ['bard'],
    'друид': ['druid'],
    'колдун': ['warlock'],
    'чародей': ['sorcerer'],
    'паладин': ['paladin'],
    'следопыт': ['ranger'],
    'изобретатель': ['artificer']
  };
  
  // Получаем английские названия класса
  const classNames = classMapping[classLower] || [classLower];
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) {
      return false;
    }
    
    // Проверяем, подходит ли заклинание для данного класса
    if (spell.classes) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      return spellClasses.some(spellClass => {
        const spellClassLower = spellClass.toLowerCase();
        return classNames.some(className => spellClassLower.includes(className));
      });
    }
    
    return false;
  });
};

// Получение максимального уровня заклинаний для персонажа
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const classLower = characterClass.toLowerCase();
  
  // Полные заклинатели (жрец, друид, волшебник, бард, чародей)
  if (classLower.includes('жрец') || classLower.includes('cleric') ||
      classLower.includes('друид') || classLower.includes('druid') ||
      classLower.includes('волшебник') || classLower.includes('wizard') ||
      classLower.includes('бард') || classLower.includes('bard') ||
      classLower.includes('чародей') || classLower.includes('sorcerer')) {
    if (level >= 17) return 9;
    else if (level >= 15) return 8;
    else if (level >= 13) return 7;
    else if (level >= 11) return 6;
    else if (level >= 9) return 5;
    else if (level >= 7) return 4;
    else if (level >= 5) return 3;
    else if (level >= 3) return 2;
    else if (level >= 1) return 1;
    return 0;
  }
  
  // Половинные заклинатели (паладин, следопыт, изобретатель)
  if (classLower.includes('паладин') || classLower.includes('paladin') ||
      classLower.includes('следопыт') || classLower.includes('ranger') ||
      classLower.includes('изобретатель') || classLower.includes('artificer')) {
    if (level >= 17) return 5;
    else if (level >= 13) return 4;
    else if (level >= 9) return 3;
    else if (level >= 5) return 2;
    else if (level >= 2) return 1;
    return 0;
  }
  
  // Колдуны (особые)
  if (classLower.includes('колдун') || classLower.includes('warlock')) {
    if (level >= 17) return 5; // Мистические таинства для заклинаний 6-9 уровня
    else if (level >= 11) return 5;
    else if (level >= 9) return 5;
    else if (level >= 7) return 4;
    else if (level >= 5) return 3;
    else if (level >= 3) return 2;
    else if (level >= 1) return 1;
    return 0;
  }
  
  return 0; // Не заклинатель
};
