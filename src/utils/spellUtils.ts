
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Нормализует заклинания, преобразуя строки в объекты
 */
export const normalizeSpells = (spells: Array<CharacterSpell | string>): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // По умолчанию заговор
      };
    }
    return spell;
  });
};

/**
 * Конвертирует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school || "Универсальная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || ["Нет описания"],
    classes: spell.classes || [],
    source: spell.source || "Книга игрока",
    prepared: spell.prepared || false,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s/g, '-')}`
  };
};

/**
 * Конвертирует массив заклинаний CharacterSpell в массив SpellData
 */
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

/**
 * Вычисляет доступное количество подготовленных заклинаний
 * на основе класса и модификатора способности
 */
export const calculatePreparedSpellsLimit = (
  className: string, 
  level: number, 
  abilityModifier: number
): number => {
  // У разных классов разные формулы
  switch (className) {
    case "Жрец":
    case "Друид":
    case "Волшебник":
      return level + abilityModifier;
    case "Паладин":
    case "Следопыт":
      // Половина уровня (округление вниз) + модификатор способности
      return Math.floor(level / 2) + abilityModifier;
    // Варды, Чародеи и Колдуны не готовят заклинания
    case "Бард":
    case "Чародей":
    case "Колдун":
      return 0;
    default:
      return 0;
  }
};

/**
 * Рассчитывает количество известных заклинаний для класса
 */
export const calculateKnownSpells = (
  className: string, 
  level: number
): { cantrips: number; spells: number } => {
  // Количество заговоров и заклинаний по классу и уровню
  const spellCounts = {
    "Бард": {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spells: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
    },
    "Жрец": {
      cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      // Жрецы могут подготовить (уровень + модификатор мудрости) заклинаний
      spells: Array(20).fill(0)
    },
    "Друид": {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      // Друиды могут подготовить (уровень + модификатор мудрости) заклинаний
      spells: Array(20).fill(0)
    },
    "Паладин": {
      cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Паладины могут подготовить (уровень / 2 + модификатор харизмы) заклинаний
      spells: Array(20).fill(0)
    },
    "Следопыт": {
      cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      spells: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
    },
    "Чародей": {
      cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
      spells: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
    },
    "Колдун": {
      cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      spells: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
    },
    "Волшебник": {
      cantrips: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      // Волшебники могут подготовить (уровень + модификатор интеллекта) заклинаний
      spells: Array(20).fill(0)
    }
  };

  // Получаем количество заговоров и заклинаний для указанного класса и уровня
  const classData = spellCounts[className as keyof typeof spellCounts] || { cantrips: Array(20).fill(0), spells: Array(20).fill(0) };
  const levelIndex = Math.min(Math.max(level - 1, 0), 19); // Уровни от 1 до 20, индексы от 0 до 19
  
  const cantripCount = classData.cantrips[levelIndex];
  const spellCount = classData.spells[levelIndex];
  
  return {
    cantrips: cantripCount,
    spells: Math.max(spellCount, 0) // Не может быть отрицательным
  };
};

/**
 * Проверяет, можно ли заклинателю подготовить еще заклинания
 */
export const canPrepareMoreSpells = (
  character: { 
    class?: string; 
    level: number; 
    spells?: Array<CharacterSpell | string>; 
    abilities?: any 
  },
  spellcastingAbility: string
): boolean => {
  // Если класс не требует подготовки заклинаний, всегда true
  if (["Бард", "Чародей", "Колдун"].includes(character.class || "")) {
    return true;
  }
  
  // Получаем модификатор способности
  let abilityScore = 10;
  if (character.abilities) {
    switch (spellcastingAbility) {
      case "INT":
        abilityScore = character.abilities.INT || character.abilities.intelligence || 10;
        break;
      case "WIS":
        abilityScore = character.abilities.WIS || character.abilities.wisdom || 10;
        break;
      case "CHA":
        abilityScore = character.abilities.CHA || character.abilities.charisma || 10;
        break;
    }
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Количество заклинаний, которые можно подготовить
  const spellLimit = calculatePreparedSpellsLimit(
    character.class || "", 
    character.level, 
    abilityModifier
  );
  
  // Если лимит 0, класс не готовит заклинания
  if (spellLimit === 0) return true;
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedCount = character.spells?.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length || 0;
  
  return preparedCount < spellLimit;
};

/**
 * Получает максимальное количество подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (
  character: { 
    class?: string; 
    level: number; 
    abilities?: any; 
    spellcasting?: { ability?: string }
  }
): number => {
  if (!character.class) return 0;
  
  // Если класс не требует подготовки заклинаний
  if (["Бард", "Чародей", "Колдун"].includes(character.class)) {
    return 0; // Не ограничено
  }
  
  // Получаем способность для заклинаний
  let spellcastingAbility = character.spellcasting?.ability || getSpellcastingAbilityByClass(character.class);
  
  // Получаем значение характеристики
  let abilityScore = 10;
  if (character.abilities) {
    switch (spellcastingAbility) {
      case "INT":
        abilityScore = character.abilities.INT || character.abilities.intelligence || 10;
        break;
      case "WIS":
        abilityScore = character.abilities.WIS || character.abilities.wisdom || 10;
        break;
      case "CHA":
        abilityScore = character.abilities.CHA || character.abilities.charisma || 10;
        break;
    }
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Вычисляем лимит подготовленных заклинаний
  return calculatePreparedSpellsLimit(character.class, character.level, abilityModifier);
};

/**
 * Возвращает основную характеристику для заклинаний на основе класса
 */
function getSpellcastingAbilityByClass(className: string): string {
  switch (className) {
    case "Волшебник":
      return "INT";
    case "Жрец":
    case "Друид":
    case "Следопыт":
      return "WIS";
    case "Бард":
    case "Чародей":
    case "Колдун":
    case "Паладин":
      return "CHA";
    default:
      return "";
  }
}

/**
 * Получает максимальный уровень заклинаний для указанного уровня персонажа
 */
export const getMaxSpellLevel = (characterLevel: number): number => {
  // Таблица соответствия уровня персонажа и максимального уровня заклинаний
  const spellLevelByCharacterLevel = [
    /* 1 */ 1, /* 2 */ 1, /* 3 */ 2, /* 4 */ 2, /* 5 */ 3,
    /* 6 */ 3, /* 7 */ 4, /* 8 */ 4, /* 9 */ 5, /* 10 */ 5,
    /* 11 */ 6, /* 12 */ 6, /* 13 */ 7, /* 14 */ 7, /* 15 */ 8,
    /* 16 */ 8, /* 17 */ 9, /* 18 */ 9, /* 19 */ 9, /* 20 */ 9
  ];
  
  // Проверка валидности уровня персонажа
  if (characterLevel < 1) return 0;
  
  // Получение максимального уровня заклинаний
  const index = Math.min(characterLevel - 1, spellLevelByCharacterLevel.length - 1);
  return spellLevelByCharacterLevel[index];
};
