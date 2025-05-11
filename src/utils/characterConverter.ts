
import { Character } from '@/types/character';

/**
 * Функция для преобразования данных персонажа в стандартный формат
 * и устранения ошибок совместимости
 */
export const convertToCharacter = (data: any): Character => {
  // Если данных нет, возвращаем пустой объект
  if (!data) {
    console.error('convertToCharacter: Получен пустой объект');
    return {
      id: '',
      name: 'Ошибка загрузки',
      race: '',
      class: '',
      background: '',
      alignment: '',
      level: 1,
      xp: 0,
      abilities: {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
      },
      savingThrows: {
        STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
        strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
      },
      hp: 10,
      temporaryHp: 0,
      maxHp: 10,
      ac: 10,
      skills: {},
      hitDice: {
        total: 1,
        used: 0,
        dieType: 'd8'
      },
      resources: {},
      deathSaves: {
        successes: 0,
        failures: 0
      },
      equipment: {
        weapons: [],
        armor: '',
        items: [],
        gold: 0
      },
      proficiencies: {
        languages: [],
        tools: [],
        weapons: [],
        armor: [],
        skills: []
      },
      spells: [],
      features: [],
      spellcasting: {
        ability: '',
        dc: 0,
        attack: 0
      },
      notes: '',
      inspiration: false,
      // Добавляем обязательные поля
      savingThrowProficiencies: [],
      skillProficiencies: [],
      expertise: [],
      skillBonuses: {},
      spellSlots: {}, // Добавлено spellSlots
      speed: 30,
      initiative: 0,
      proficiencyBonus: 2
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
  character.background = character.background || '';
  character.alignment = character.alignment || '';
  character.level = character.level || 1;
  character.xp = character.xp || character.experience || 0;
  
  // Исправляем базовые характеристики
  if (!character.abilities) {
    character.abilities = {
      STR: character.strength || character.stats?.strength || 10, 
      DEX: character.dexterity || character.stats?.dexterity || 10, 
      CON: character.constitution || character.stats?.constitution || 10, 
      INT: character.intelligence || character.stats?.intelligence || 10, 
      WIS: character.wisdom || character.stats?.wisdom || 10, 
      CHA: character.charisma || character.stats?.charisma || 10,
      strength: character.strength || character.stats?.strength || 10,
      dexterity: character.dexterity || character.stats?.dexterity || 10,
      constitution: character.constitution || character.stats?.constitution || 10,
      intelligence: character.intelligence || character.stats?.intelligence || 10,
      wisdom: character.wisdom || character.stats?.wisdom || 10,
      charisma: character.charisma || character.stats?.charisma || 10
    };
  }
  
  // Исправляем savingThrows
  if (!character.savingThrows) {
    character.savingThrows = {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
    };
  }
  
  // Исправляем HP
  character.maxHp = character.maxHp || character.hitPoints?.max || 10;
  character.hp = character.hp || character.currentHp || character.hitPoints?.current || character.maxHp;
  character.temporaryHp = character.temporaryHp || character.tempHp || character.hitPoints?.temporary || 0;
  
  // Восстанавливаем дополнительные поля, если они отсутствуют
  character.backstory = character.backstory || '';
  character.userId = character.userId || '';
  character.createdAt = character.createdAt || new Date().toISOString();
  character.updatedAt = character.updatedAt || new Date().toISOString();
  
  // Добавляем модификатор владения (proficiency bonus)
  character.proficiencyBonus = character.proficiencyBonus || Math.ceil(1 + (character.level / 4));
  
  // Добавляем класс брони, если отсутствует
  character.ac = character.ac || character.armorClass || 10 + Math.floor((character.dexterity - 10) / 2);
  
  // Обрабатываем заклинания
  if (!character.spells) {
    character.spells = [];
  }
  
  // Инициализируем скиллы, если они отсутствуют
  if (!character.skills) {
    character.skills = {};
  }
  
  // Инициализируем ячейки заклинаний, если они отсутствуют
  if (!character.spellSlots) {
    character.spellSlots = calculateSpellSlots(character.class, character.level);
  }
  
  // Инициализируем параметры заклинателя
  if (!character.spellcasting) {
    character.spellcasting = calculateSpellcastingParams(character);
  }
  
  // Инициализируем бросок хит-дайсов
  if (!character.hitDice) {
    character.hitDice = {
      total: character.level || 1,
      used: 0,
      dieType: 'd8'
    };
  }
  
  // Инициализируем ресурсы
  if (!character.resources) {
    character.resources = {};
  }
  
  // Инициализируем броски на смерть
  if (!character.deathSaves) {
    character.deathSaves = {
      successes: 0,
      failures: 0
    };
  }
  
  // Инициализируем экипировку
  if (!character.equipment) {
    character.equipment = {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    };
  }
  
  // Инициализируем владения
  if (!character.proficiencies) {
    character.proficiencies = {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    };
  }
  
  // Инициализируем особенности
  if (!character.features) {
    character.features = [];
  }
  
  // Инициализируем заметки
  character.notes = character.notes || '';
  
  // Инициализируем вдохновение
  character.inspiration = character.inspiration || false;
  
  // Инициализируем значение скорости
  character.speed = character.speed || 30;
  
  // Инициализируем значение инициативы
  character.initiative = character.initiative || 0;
  
  // Дополнительные поля для соответствия типу Character
  character.savingThrowProficiencies = character.savingThrowProficiencies || [];
  character.skillProficiencies = character.skillProficiencies || [];
  character.expertise = character.expertise || [];
  character.skillBonuses = character.skillBonuses || {};
  
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
    background: '',
    alignment: '',
    level: 1,
    xp: 0,
    abilities: {
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
    },
    savingThrows: {
      STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0,
      strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0
    },
    maxHp: 10,
    hp: 10,
    temporaryHp: 0,
    backstory: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    proficiencyBonus: 2,
    ac: 10,
    skills: {},
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8'
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0
    },
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0
    },
    proficiencies: {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    },
    spells: [],
    features: [],
    spellcasting: {
      ability: '',
      dc: 0,
      attack: 0
    },
    notes: '',
    inspiration: false,
    // Дополнительные поля для соответствия типу Character
    savingThrowProficiencies: [],
    skillProficiencies: [],
    expertise: [],
    skillBonuses: {},
    spellSlots: {}, // Добавлено spellSlots
    speed: 30,
    initiative: 0
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
  if (spellAbility === 'INT') abilityScore = character.intelligence || character.abilities?.INT || 10;
  else if (spellAbility === 'WIS') abilityScore = character.wisdom || character.abilities?.WIS || 10;
  else if (spellAbility === 'CHA') abilityScore = character.charisma || character.abilities?.CHA || 10;
  
  // Вычисляем модификатор
  const abilityMod = Math.floor((abilityScore - 10) / 2);
  
  // Вычисляем бонус мастерства
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
