
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

// Нормализует массив заклинаний в единый формат
export const normalizeSpells = (spells: any[] | null | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, создаем минимальный объект
      return {
        name: spell,
        level: 0, // Уровень неизвестен
      };
    } else {
      // Нормализуем объект заклинания
      return {
        id: spell.id || undefined,
        name: spell.name || "Неизвестное заклинание",
        level: typeof spell.level === 'number' ? spell.level : 0,
        school: spell.school || undefined,
        castingTime: spell.castingTime || undefined,
        range: spell.range || undefined,
        components: spell.components || undefined,
        duration: spell.duration || undefined,
        description: spell.description || undefined,
        classes: Array.isArray(spell.classes) ? spell.classes : [],
        ritual: Boolean(spell.ritual),
        concentration: Boolean(spell.concentration),
        verbal: Boolean(spell.verbal),
        somatic: Boolean(spell.somatic),
        material: Boolean(spell.material),
        prepared: Boolean(spell.prepared),
        materials: spell.materials || undefined,
        higherLevel: spell.higherLevel || spell.higherLevels || undefined,
        higherLevels: spell.higherLevels || spell.higherLevel || undefined,
        source: spell.source || undefined
      };
    }
  });
};

// Проверяет, является ли объект CharacterSpell, а не строкой
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

// Получает уровень заклинания
export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (isCharacterSpellObject(spell)) {
    return spell.level || 0;
  }
  return 0; // Строки по умолчанию считаем заговорами
};

// Проверяет, подготовлено ли заклинание
export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (isCharacterSpellObject(spell)) {
    return Boolean(spell.prepared);
  }
  return true; // Строки по умолчанию считаем подготовленными
};

// Возвращает отображаемое название уровня заклинания
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0:
      return "Заговор";
    case 1:
      return "1-й уровень";
    case 2:
      return "2-й уровень";
    case 3:
      return "3-й уровень";
    case 4:
      return "4-й уровень";
    case 5:
      return "5-й уровень";
    case 6:
      return "6-й уровень";
    case 7:
      return "7-й уровень";
    case 8:
      return "8-й уровень";
    case 9:
      return "9-й уровень";
    default:
      return `${level}-й уровень`;
  }
};

// Группирует заклинания по уровням
export const groupSpellsByLevel = (spells: CharacterSpell[]): Record<number, CharacterSpell[]> => {
  const grouped: Record<number, CharacterSpell[]> = {};
  
  spells.forEach(spell => {
    const level = spell.level || 0;
    if (!grouped[level]) {
      grouped[level] = [];
    }
    grouped[level].push(spell);
  });
  
  // Сортируем заклинания по имени внутри каждого уровня
  Object.keys(grouped).forEach(levelStr => {
    const level = Number(levelStr);
    grouped[level].sort((a, b) => {
      return (a.name || '').localeCompare(b.name || '');
    });
  });
  
  return grouped;
};

// Фильтрует заклинания по подготовленным
export const getPreparedSpells = (spells: CharacterSpell[]): CharacterSpell[] => {
  return spells.filter(spell => spell.prepared);
};

// Получает ключевую характеристику для заклинаний на основе класса
export const getSpellcastingAbility = (characterClass: string): string => {
  // Привести к нижнему регистру для облегчения сравнения
  const className = characterClass.toLowerCase();
  
  if (
    className === 'волшебник' || 
    className === 'wizard' || 
    className === 'artificer' || 
    className === 'изобретатель'
  ) {
    return 'intelligence';
  } else if (
    className === 'жрец' || 
    className === 'cleric' || 
    className === 'друид' || 
    className === 'druid' || 
    className === 'ranger' || 
    className === 'следопыт'
  ) {
    return 'wisdom';
  } else if (
    className === 'бард' || 
    className === 'bard' || 
    className === 'warlock' || 
    className === 'колдун' || 
    className === 'чародей' || 
    className === 'sorcerer' || 
    className === 'paladin' || 
    className === 'паладин'
  ) {
    return 'charisma';
  }
  
  return 'intelligence'; // По умолчанию
};

// Новые функции, необходимые для импорта
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character) return false;
  
  const preparedLimit = getPreparedSpellsLimit(character);
  if (preparedLimit === 0) return true; // Если нет ограничений на подготовку
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedCount = character.spells?.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length || 0;
  
  return preparedCount < preparedLimit;
};

// Получение максимально возможного количества подготовленных заклинаний
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character) return 0;
  
  const className = (character.class || '').toLowerCase();
  
  // Классы, которые должны готовить заклинания
  if (
    className === 'жрец' || 
    className === 'cleric' || 
    className === 'друид' || 
    className === 'druid'
  ) {
    // Модификатор мудрости + уровень класса
    const wisdomMod = Math.floor((character.wisdom || character.stats?.wisdom || 10) - 10) / 2;
    return Math.max(1, Math.floor(character.level) + Math.floor(wisdomMod));
  } else if (
    className === 'волшебник' || 
    className === 'wizard'
  ) {
    // Модификатор интеллекта + уровень класса
    const intMod = Math.floor((character.intelligence || character.stats?.intelligence || 10) - 10) / 2;
    return Math.max(1, Math.floor(character.level) + Math.floor(intMod));
  } else if (
    className === 'паладин' || 
    className === 'paladin'
  ) {
    // Модификатор харизмы + половина уровня паладина (округленная вверх)
    const charMod = Math.floor((character.charisma || character.stats?.charisma || 10) - 10) / 2;
    return Math.max(1, Math.floor(character.level / 2) + Math.floor(charMod));
  } else if (
    className === 'следопыт' || 
    className === 'ranger'
  ) {
    // Модификатор мудрости + половина уровня следопыта (округленная вверх)
    const wisMod = Math.floor((character.wisdom || character.stats?.wisdom || 10) - 10) / 2;
    return Math.max(1, Math.floor(character.level / 2) + Math.floor(wisMod));
  }
  
  // Другие классы не готовят заклинания
  return 0;
};

// Преобразование объектов заклинаний между форматами
export const convertToSpellData = (spell: any): SpellData => {
  return {
    id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name || "Неизвестное заклинание",
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: Array.isArray(spell.classes) ? spell.classes : [spell.classes || ''],
    ritual: Boolean(spell.ritual),
    concentration: Boolean(spell.concentration),
    verbal: Boolean(spell.verbal),
    somatic: Boolean(spell.somatic),
    material: Boolean(spell.material),
    materials: spell.materials || '',
    prepared: Boolean(spell.prepared),
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    higherLevels: spell.higherLevels || spell.higherLevel || '',
    source: spell.source || ''
  };
};

// Преобразование массива заклинаний персонажа в формат SpellData
export const convertCharacterSpellsToSpellData = (characterSpells: CharacterSpell[]): SpellData[] => {
  if (!characterSpells || !Array.isArray(characterSpells)) return [];
  
  return characterSpells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, создаем минимальный объект
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
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
        verbal: false,
        somatic: false,
        material: false,
        materials: '',
        prepared: true,
        higherLevel: '',
        higherLevels: '',
        source: ''
      };
    } else {
      // Если это объект заклинания, преобразуем его в формат SpellData
      return convertToSpellData(spell);
    }
  });
};
