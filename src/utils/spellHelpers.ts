
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

// Нормализует смешанный массив заклинаний (строки и объекты) в массив объектов CharacterSpell
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  if (!Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0
      };
    }
    return spell;
  });
};

// Преобразует CharacterSpell в SpellData
export const convertToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => ({
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Воплощение',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials || ''
  }));
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

// Добавляем недостающие функции, импортированные в spellUtils.ts

// Функция для проверки, можно ли подготовить еще заклинания
export const canPrepareMoreSpells = (character: any): boolean => {
  if (!character || !character.spells) return true;
  
  const preparedCount = character.spells
    .filter((spell: any) => typeof spell !== 'string' && spell.prepared && spell.level > 0)
    .length;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  
  return preparedCount < preparedLimit;
};

// Получение лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: any): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character.class?.toLowerCase() || '';
  
  // Базовый модификатор способности
  let abilityMod = 0;
  
  if (['жрец', 'друид', 'клерик', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10;
    abilityMod = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10;
    abilityMod = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Харизма
    const charisma = character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10;
    abilityMod = Math.floor((charisma - 10) / 2);
  }
  
  // Базовый расчет: уровень класса + модификатор способности
  let preparedLimit = Math.max(1, character.level + abilityMod);
  
  // Корректировки для конкретных классов
  if (['паладин', 'paladin', 'рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    preparedLimit = Math.max(1, Math.floor(character.level / 2) + abilityMod);
  }
  
  return preparedLimit;
};

// Функция для получения заклинательной способности персонажа
export const getSpellcastingAbility = (character: any): string => {
  if (!character) return 'Харизма';
  
  const classLower = character?.class?.toLowerCase() || '';
  
  if (['жрец', 'друид', 'клерик', 'cleric', 'druid'].includes(classLower)) {
    return 'Мудрость';
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    return 'Интеллект';
  } else {
    // Бард, Чародей, Колдун, Паладин
    return 'Харизма';
  }
};

// Группировка заклинаний по уровням
export const groupSpellsByLevel = (spells: any[]): Record<number, any[]> => {
  if (!Array.isArray(spells)) return {};
  
  const grouped: Record<number, any[]> = {};
  
  spells.forEach(spell => {
    if (typeof spell === 'string') {
      // По умолчанию считаем строковые заклинания заговорами
      const level = 0;
      grouped[level] = [...(grouped[level] || []), { name: spell, level: 0 }];
    } else {
      const level = spell.level || 0;
      grouped[level] = [...(grouped[level] || []), spell];
    }
  });
  
  return grouped;
};

// Получение подготовленных заклинаний
export const getPreparedSpells = (spells: any[]): any[] => {
  if (!Array.isArray(spells)) return [];
  
  return spells.filter(spell => {
    if (typeof spell === 'string') return true;
    return spell.prepared === true;
  });
};

// Конвертация заклинаний персонажа в формат SpellData
export const convertCharacterSpellsToSpellData = (spells: any[]): SpellData[] => {
  if (!Array.isArray(spells)) return [];
  
  return spells.map(spell => {
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
        classes: [],
        ritual: false,
        concentration: false,
        verbal: true,
        somatic: true,
        material: false,
        materials: '',
        source: 'PHB'
      };
    }
    
    // Если это уже SpellData или CharacterSpell
    return {
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: spell.name,
      level: spell.level || 0,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'На себя',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      classes: spell.classes || [],
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      materials: spell.materials || '',
      source: spell.source || 'PHB',
      prepared: !!spell.prepared
    };
  });
};
