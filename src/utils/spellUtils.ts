
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Функция для нормализации заклинаний персонажа
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character || !character.spells) return [];
  
  // Если массив заклинаний не существует, возвращаем пустой массив
  if (!Array.isArray(character.spells)) return [];
  
  // Преобразуем простые строки в объекты заклинаний
  return character.spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // По умолчанию считаем заговором
        school: 'Универсальная',
        prepared: true
      };
    }
    return spell;
  });
};

// Функция для преобразования CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id?.toString() || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};

// Расчет доступных заклинаний по классу и уровню
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number,
  modifier: number = 0
): { cantripsCount: number; knownSpells: number; maxSpellLevel: number; slotsPerLevel: Record<number, number> } => {
  const classLower = characterClass.toLowerCase();
  
  // Базовые значения по умолчанию
  let result = {
    cantripsCount: 0,
    knownSpells: 0,
    maxSpellLevel: 0,
    slotsPerLevel: {} as Record<number, number>
  };
  
  try {
    // Жрец (Cleric)
    if (['жрец', 'cleric'].includes(classLower)) {
      result.cantripsCount = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      result.knownSpells = level + Math.max(1, modifier); // Уровень + модификатор мудрости
      result.maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    }
    // Друид (Druid)
    else if (['друид', 'druid'].includes(classLower)) {
      result.cantripsCount = level >= 4 ? (level >= 10 ? 5 : 4) : 2;
      result.knownSpells = level + Math.max(1, modifier); // Уровень + модификатор мудрости
      result.maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    }
    // Волшебник (Wizard)
    else if (['волшебник', 'wizard'].includes(classLower)) {
      result.cantripsCount = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      result.knownSpells = 6 + (level - 1) * 2; // Начинает с 6, добавляет 2 за уровень
      result.maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    }
    // Бард (Bard)
    else if (['бард', 'bard'].includes(classLower)) {
      result.cantripsCount = level >= 10 ? 4 : 2;
      result.knownSpells = level + 3; // Level + 3
      result.maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    }
    // Колдун (Warlock)
    else if (['колдун', 'warlock'].includes(classLower)) {
      result.cantripsCount = level >= 10 ? 4 : 2;
      result.knownSpells = level + 1;
      result.maxSpellLevel = Math.min(5, Math.ceil(level / 2));
    }
    // Чародей (Sorcerer)
    else if (['чародей', 'sorcerer'].includes(classLower)) {
      result.cantripsCount = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
      result.knownSpells = level + 1;
      result.maxSpellLevel = Math.min(9, Math.ceil(level / 2));
    }
    // Паладин (Paladin)
    else if (['паладин', 'paladin'].includes(classLower)) {
      result.cantripsCount = 0; // Паладины не используют заговоры
      result.knownSpells = Math.floor(level / 2) + Math.max(1, modifier); // Половина уровня + модификатор харизмы
      result.maxSpellLevel = Math.min(5, Math.ceil(level / 4)); // Паладины используют заклинания до 5 уровня
    }
    // Следопыт (Ranger)
    else if (['следопыт', 'ranger'].includes(classLower)) {
      result.cantripsCount = 0; // Следопыты не используют заговоры в базовых правилах
      result.knownSpells = Math.floor(level / 2) + Math.max(1, modifier); // Половина уровня + модификатор мудрости
      result.maxSpellLevel = Math.min(5, Math.ceil(level / 4)); // Следопыты используют заклинания до 5 уровня
    }
    // Все остальные классы не имеют доступа к заклинаниям (в базовых правилах)
    else {
      result.cantripsCount = 0;
      result.knownSpells = 0;
      result.maxSpellLevel = 0;
    }
  } catch (error) {
    console.error('Error in calculateAvailableSpellsByClassAndLevel:', error);
    // В случае ошибки возвращаем дефолтные значения
  }
  
  // Если класс не магический, возвращаем нулевые значения
  return result;
};

// Получить максимальный уровень заклинаний для класса и уровня
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};

// Проверка, может ли персонаж подготовить больше заклинаний
export const canPrepareMoreSpells = (character: Character | null): boolean => {
  if (!character) return false;
  
  const prepLimit = getPreparedSpellsLimit(character);
  const preparedCount = (character.spells || [])
    .filter(s => typeof s !== 'string' && s.prepared && s.level > 0)
    .length;
    
  return preparedCount < prepLimit;
};

// Получение лимита подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character | null): number => {
  if (!character || !character.class || !character.level) return 0;
  
  // Проверяем, является ли класс таким, который должен готовить заклинания
  const isPrepCaster = ['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin'].includes(character.class.toLowerCase());
  
  if (!isPrepCaster) return 0;
  
  // Получаем модификатор основной характеристики
  let modifier = 0;
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(character.class.toLowerCase())) {
    // Мудрость для жрецов и друидов
    modifier = Math.floor((character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10) - 10) / 2;
  } else if (['волшебник', 'wizard'].includes(character.class.toLowerCase())) {
    // Интеллект для волшебников
    modifier = Math.floor((character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10) - 10) / 2;
  } else if (['паладин', 'paladin'].includes(character.class.toLowerCase())) {
    // Харизма для паладинов
    modifier = Math.floor((character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10) - 10) / 2;
  }
  
  // Жрецы и друиды: уровень + модификатор основной характеристики
  if (['жрец', 'друид', 'cleric', 'druid'].includes(character.class.toLowerCase())) {
    return character.level + Math.max(1, modifier);
  }
  
  // Волшебники: уровень + модификатор интеллекта (минимум 1)
  if (['волшебник', 'wizard'].includes(character.class.toLowerCase())) {
    return character.level + Math.max(1, modifier);
  }
  
  // Паладины: половина уровня + модификатор харизмы (минимум 1)
  if (['паладин', 'paladin'].includes(character.class.toLowerCase())) {
    return Math.floor(character.level / 2) + Math.max(1, modifier);
  }
  
  return 0;
};
