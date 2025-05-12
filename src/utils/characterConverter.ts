import { Character } from '@/types/character';

/**
 * Функция для преобразования данных персонажа в стандартный формат
 * и устранения ошибок совместимости
 */
export const convertToCharacter = (data: any): Character => {
  // Если данных нет, возвращаем базовый объект персонажа
  if (!data) {
    console.error('convertToCharacter: Получен пустой объект');
    return {
      id: '',
      name: 'Ошибка загрузки',
      race: '',
      class: '',
      level: 1,
      background: '', // Добавляем обязательные свойства
      alignment: '',
      abilities: {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      proficiencies: {
        languages: [],
        tools: [],
        weapons: [],
        armor: [],
        skills: []
      },
      equipment: [],
      spells: [],
      features: [],
      savingThrows: {
        strength: false,
        dexterity: false,
        constitution: false,
        intelligence: false,
        wisdom: false,
        charisma: false
      },
      skills: {},
      hp: {
        current: 10,
        max: 10,
        temp: 0
      },
      experience: 0,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      maxHp: 10,
      currentHp: 10,
      proficiencyBonus: 2,
      armorClass: 10,
      initiative: 0,
      speed: 30,
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      backstory: '',
      updatedAt: new Date().toISOString(),
      gold: 0,
      hitDice: {
        total: 1,
        value: 'd8'
      },
      spellcasting: null
    };
  }
  
  // Копируем данные для безопасного изменения
  const character = { ...data };
  
  // Гарантируем, что ID существует
  character.id = character.id || '';
  
  // Проверяем и исправляем основные характеристики
  character.name = character.name || 'Безымянный герой';
  character.race = character.race || '';
  character.class = character.class || character.className || '';
  character.level = character.level || 1;
  character.experience = character.experience || 0;
  
  // Исправляем базовые характеристики
  character.strength = character.strength || character.stats?.strength || 10;
  character.dexterity = character.dexterity || character.stats?.dexterity || 10;
  character.constitution = character.constitution || character.stats?.constitution || 10;
  character.intelligence = character.intelligence || character.stats?.intelligence || 10;
  character.wisdom = character.wisdom || character.stats?.wisdom || 10;
  character.charisma = character.charisma || character.stats?.charisma || 10;
  
  // Исправляем HP
  character.maxHp = character.maxHp || 10;
  character.currentHp = character.currentHp !== undefined ? character.currentHp : character.maxHp;
  
  // Восстанавливаем дополнительные поля, если они отсутствуют
  character.backstory = character.backstory || '';
  character.userId = character.userId || '';
  character.createdAt = character.createdAt || new Date().toISOString();
  character.updatedAt = character.updatedAt || new Date().toISOString();
  
  // Добавляем модификатор владения (proficiency bonus)
  character.proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level / 4));
  
  // Добавляем класс брони, если отсутствует
  character.armorClass = character.armorClass || 10 + Math.floor((character.dexterity - 10) / 2);
  
  // Обрабатываем заклинания
  if (!character.spells) {
    character.spells = [];
  }
  
  // Инициализируем ячейки заклинаний, если они отсутствуют
  if (!character.spellSlots) {
    character.spellSlots = calculateSpellSlots(character.class, character.level);
  }
  
  // Инициализируем параметры заклинателя
  if (!character.spellcasting) {
    character.spellcasting = calculateSpellcastingParams(character);
  }
  
  return character as Character;
};

/**
 * Создаёт новый пустой персонаж
 */
export const createEmptyCharacter = (): Character => {
  return {
    id: '',
    name: 'Новый персонаж',
    race: '',
    class: '',
    level: 1,
    background: '', // Добавляем обязательные свойства
    alignment: '',
    abilities: {
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    equipment: [],
    spells: [],
    features: [],
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    skills: {},
    experience: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    maxHp: 10,
    currentHp: 10,
    hp: {
      current: 10,
      max: 10,
      temp: 0
    },
    gold: 0,
    backstory: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    proficiencyBonus: 2,
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitDice: {
      total: 1,
      value: 'd8'
    },
    spellSlots: {},
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    spellcasting: null
  };
};

/**
 * Рассчитывает количество ячеек заклинаний для класса и уровня
 */
function calculateSpellSlots(characterClass: string | undefined, level: number): Record<number, { max: number; used: number }> {
  const slots: Record<number, { max: number; used: number }> = {};
  
  if (!characterClass) return slots;
  
  const lowerClass = characterClass.toLowerCase();
  
  // Полные заклинатели (маг, жрец, друид, бард)
  if (['волшебник', 'wizard', 'жрец', 'cleric', 'друид', 'druid', 'бард', 'bard', 'чародей', 'sorcerer'].includes(lowerClass)) {
    if (level >= 1) {
      slots[1] = { max: level >= 3 ? 4 : level >= 2 ? 3 : 2, used: 0 };
    }
    if (level >= 3) {
      slots[2] = { max: level >= 4 ? 3 : 2, used: 0 };
    }
    if (level >= 5) {
      slots[3] = { max: level >= 6 ? 3 : 2, used: 0 };
    }
    if (level >= 7) {
      slots[4] = { max: level >= 8 ? 3 : 1, used: 0 };
    }
    if (level >= 9) {
      slots[5] = { max: level >= 10 ? 2 : 1, used: 0 };
    }
    if (level >= 11) {
      slots[6] = { max: 1, used: 0 };
    }
    if (level >= 13) {
      slots[7] = { max: 1, used: 0 };
    }
    if (level >= 15) {
      slots[8] = { max: 1, used: 0 };
    }
    if (level >= 17) {
      slots[9] = { max: 1, used: 0 };
    }
  }
  // Полузаклинатели (паладин, следопыт)
  else if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) {
    if (level >= 2) {
      slots[1] = { max: level >= 3 ? 3 : 2, used: 0 };
    }
    if (level >= 5) {
      slots[2] = { max: level >= 7 ? 3 : 2, used: 0 };
    }
    if (level >= 9) {
      slots[3] = { max: level >= 11 ? 3 : 2, used: 0 };
    }
    if (level >= 13) {
      slots[4] = { max: level >= 15 ? 2 : 1, used: 0 };
    }
    if (level >= 17) {
      slots[5] = { max: 1, used: 0 };
    }
  }
  // Колдун (особая система ячеек)
  else if (['колдун', 'warlock'].includes(lowerClass)) {
    const maxSlotLevel = Math.min(5, Math.ceil(level / 2));
    const slotsCount = level === 1 ? 1 : (level < 11 ? 2 : (level < 17 ? 3 : 4));
    
    if (level >= 1) {
      slots[maxSlotLevel] = { max: slotsCount, used: 0 };
    }
  }
  
  return slots;
}

/**
 * Рассчитывает параметры заклинательной способности персонажа
 */
function calculateSpellcastingParams(character: any) {
  if (!character.class) return { ability: 'INT', saveDC: 10, attackBonus: 0 };
  
  const lowerClass = character.class.toLowerCase();
  let spellAbility = 'INT'; // По умолчанию - интеллект
  
  // Определяем базовую характеристику для класса
  if (['жрец', 'cleric', 'друид', 'druid'].includes(lowerClass)) {
    spellAbility = 'WIS';
  } else if (['бард', 'bard', 'колдун', 'warlock', 'чародей', 'sorcerer', 'паладин', 'paladin'].includes(lowerClass)) {
    spellAbility = 'CHA';
  } else if (['следопыт', 'ranger'].includes(lowerClass)) {
    spellAbility = 'WIS';
  }
  
  // Получаем значение характеристики
  let abilityScore = 10;
  if (spellAbility === 'INT') abilityScore = character.intelligence || 10;
  else if (spellAbility === 'WIS') abilityScore = character.wisdom || 10;
  else if (spellAbility === 'CHA') abilityScore = character.charisma || 10;
  
  // Вычисляем модификатор
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  
  // Вычисляем бонус мастер��тва
  const proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level / 4));
  
  // Считаем СЛ спасброска и бонус атаки заклинанием
  const saveDC = 8 + proficiencyBonus + abilityMod;
  const attackBonus = proficiencyBonus + abilityMod;
  
  return {
    ability: spellAbility,
    saveDC,
    attackBonus,
    abilityModifier: abilityMod
  };
}
