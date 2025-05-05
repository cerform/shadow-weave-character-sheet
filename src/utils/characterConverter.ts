
import { Character } from '@/types/character';

/**
 * Преобразует объект Character в другой объект Character с дополнительными вычисляемыми полями
 */
export const convertToCharacter = (sheet: Character): Character => {
  // Расчет максимального HP на основе класса и уровня
  const calculateMaxHp = (): number => {
    // Базовое значение в зависимости от класса
    const baseHpByClass: {[key: string]: number} = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Жрец": 8,
      "Друид": 8,
      "Волшебник": 6,
      "Чародей": 6,
      "Колдун": 8
    };
    
    // Убедимся, что у нас есть класс перед вычислением HP
    const characterClass = sheet.class || "Воин"; // По умолчанию "Воин", если класс не указан
    const baseHp = baseHpByClass[characterClass] || 8; // По умолчанию 8, если класс не найден
    
    // Получаем значение телосложения
    const constitution = sheet.abilities?.constitution || sheet.abilities?.CON || sheet.constitution || 10;
    const constitutionMod = Math.floor((constitution - 10) / 2);
    
    // HP первого уровня = максимум хитов кости + модификатор телосложения
    let maxHp = baseHp + constitutionMod;
    
    // Для каждого уровня выше первого добавляем среднее значение кости хитов + модификатор телосложения
    if (sheet.level > 1) {
      maxHp += ((baseHp / 2 + 1) + constitutionMod) * (sheet.level - 1);
    }
    
    return Math.max(1, Math.round(maxHp)); // Минимум 1 HP
  };
  
  // Вычисляем максимальные хиты
  const maxHp = sheet.maxHp || calculateMaxHp();
  
  // Преобразуем структуру заклинаний
  const spellsArray = sheet.spells || [];
  
  // Определяем слоты заклинаний в зависимости от класса и уровня
  const spellSlots: Record<number, { max: number; used: number }> = sheet.spellSlots || {};
  
  // Определяем класс персонажа, обеспечивая непустое значение
  const characterClass = sheet.class || "";
  
  // Заполняем слоты заклинаний для заклинателей, если они не определены
  if (Object.keys(spellSlots).length === 0 && ["Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун"].includes(characterClass)) {
    // Упрощённая логика слотов заклинаний
    const level = sheet.level;
    
    if (level >= 1) spellSlots[1] = { max: Math.min(4, level), used: 0 };
    if (level >= 3) spellSlots[2] = { max: Math.min(3, level - 2), used: 0 };
    if (level >= 5) spellSlots[3] = { max: Math.min(3, level - 4), used: 0 };
    if (level >= 7) spellSlots[4] = { max: Math.min(3, level - 6), used: 0 };
    if (level >= 9) spellSlots[5] = { max: Math.min(2, level - 8), used: 0 };
    if (level >= 11) spellSlots[6] = { max: Math.min(1, level - 10), used: 0 };
    if (level >= 13) spellSlots[7] = { max: Math.min(1, level - 12), used: 0 };
    if (level >= 15) spellSlots[8] = { max: Math.min(1, level - 14), used: 0 };
    if (level >= 17) spellSlots[9] = { max: Math.min(1, level - 16), used: 0 };
  } 
  // Для полузаклинателей (паладины, следопыты)
  else if (Object.keys(spellSlots).length === 0 && ["Паладин", "Следопыт"].includes(characterClass)) {
    const level = sheet.level;
    
    if (level >= 2) spellSlots[1] = { max: Math.min(3, level - 1), used: 0 };
    if (level >= 5) spellSlots[2] = { max: Math.min(2, level - 4), used: 0 };
    if (level >= 9) spellSlots[3] = { max: Math.min(2, level - 8), used: 0 };
    if (level >= 13) spellSlots[4] = { max: Math.min(1, level - 12), used: 0 };
    if (level >= 17) spellSlots[5] = { max: 1, used: 0 };
  }
  
  // Очки колдовства для чародеев
  let sorceryPoints = sheet.sorceryPoints;
  if (!sorceryPoints && characterClass === "Чародей" && sheet.level > 1) {
    sorceryPoints = {
      max: sheet.level,
      current: sheet.level
    };
  }
  
  // Правильно обрабатываем proficiencies
  const proficiencies: string[] = [];
  
  // Извлекаем языки из структуры proficiencies, если они там есть
  let languages: string[] = sheet.languages || [];
  
  // Если у нас есть структура proficiencies в формате объекта
  if (sheet.proficiencies) {
    if (Array.isArray(sheet.proficiencies)) {
      // Если proficiencies уже массив строк, используем его как есть
      proficiencies.push(...sheet.proficiencies);
    } else {
      // Если proficiencies - объект, извлекаем массивы из его свойств
      const profObj = sheet.proficiencies as { armor?: string[], weapons?: string[], tools?: string[], languages?: string[] };
      
      if (profObj.armor && Array.isArray(profObj.armor)) {
        proficiencies.push(...profObj.armor.map(item => `Доспехи: ${item}`));
      }
      
      if (profObj.weapons && Array.isArray(profObj.weapons)) {
        proficiencies.push(...profObj.weapons.map(item => `Оружие: ${item}`));
      }
      
      if (profObj.tools && Array.isArray(profObj.tools)) {
        proficiencies.push(...profObj.tools.map(item => `Инструменты: ${item}`));
      }
      
      if (profObj.languages && Array.isArray(profObj.languages)) {
        languages = [...languages, ...profObj.languages];
      }
    }
  }
  
  // Заполняем заклинательную способность, если она не определена
  let spellcasting = sheet.spellcasting || {};
  if (Object.keys(spellcasting).length === 0 && isMagicClass(characterClass)) {
    const abilityByClass: { [key: string]: string } = {
      "Бард": "CHA",
      "Волшебник": "INT",
      "Жрец": "WIS",
      "Друид": "WIS",
      "Чародей": "CHA",
      "Колдун": "CHA",
      "Паладин": "CHA",
      "Следопыт": "WIS",
    };
    
    const ability = abilityByClass[characterClass] || "";
    const abilityScore = getAbilityScore(sheet, ability);
    const profBonus = getProficiencyBonus(sheet.level || 1);
    
    spellcasting = {
      ability,
      saveDC: abilityScore ? 8 + profBonus + Math.floor((abilityScore - 10) / 2) : 0,
      attackBonus: abilityScore ? profBonus + Math.floor((abilityScore - 10) / 2) : 0
    };
  }

  // Создаем объект с характеристиками, гарантируя, что у нас есть все необходимые поля
  const abilities = {
    STR: sheet.abilities?.STR || sheet.strength || 10,
    DEX: sheet.abilities?.DEX || sheet.dexterity || 10,
    CON: sheet.abilities?.CON || sheet.constitution || 10,
    INT: sheet.abilities?.INT || sheet.intelligence || 10,
    WIS: sheet.abilities?.WIS || sheet.wisdom || 10,
    CHA: sheet.abilities?.CHA || sheet.charisma || 10,
    strength: sheet.abilities?.strength || sheet.strength || 10,
    dexterity: sheet.abilities?.dexterity || sheet.dexterity || 10,
    constitution: sheet.abilities?.constitution || sheet.constitution || 10,
    intelligence: sheet.abilities?.intelligence || sheet.intelligence || 10,
    wisdom: sheet.abilities?.wisdom || sheet.wisdom || 10,
    charisma: sheet.abilities?.charisma || sheet.charisma || 10
  };

  // Вычисляем бонус мастерства
  const proficiencyBonus = sheet.proficiencyBonus || getProficiencyBonus(sheet.level || 1);
  
  // Создаем объект персонажа с уточненными полями
  return {
    id: sheet.id || "",
    userId: sheet.userId,
    name: sheet.name || "Безымянный",
    race: sheet.race || "",
    subrace: sheet.subrace,
    class: sheet.class || "",
    level: sheet.level || 1,
    background: sheet.background || "",
    alignment: sheet.alignment || "",
    experience: sheet.experience || 0,
    strength: abilities.STR,
    dexterity: abilities.DEX,
    constitution: abilities.CON,
    intelligence: abilities.INT,
    wisdom: abilities.WIS,
    charisma: abilities.CHA,
    maxHp,
    currentHp: sheet.currentHp !== undefined ? sheet.currentHp : maxHp,
    temporaryHp: sheet.temporaryHp || 0,
    armorClass: sheet.armorClass || 10 + Math.floor((abilities.DEX - 10) / 2),
    initiative: sheet.initiative || Math.floor((abilities.DEX - 10) / 2),
    speed: sheet.speed || 30,
    proficiencyBonus,
    abilities,
    spells: spellsArray,
    spellSlots,
    spellcasting,
    sorceryPoints,
    gender: sheet.gender || "",
    equipment: sheet.equipment || [],
    languages: languages,
    proficiencies: proficiencies,
    savingThrows: sheet.savingThrows || {},
    skills: sheet.skills || {},
    gold: sheet.gold || 0,
    hitDice: sheet.hitDice || { 
      total: sheet.level || 1, 
      used: 0, 
      dieType: getHitDiceByClass(characterClass), 
      value: `${sheet.level || 1}${getHitDiceByClass(characterClass)}` 
    },
    backstory: sheet.backstory || "",
    deathSaves: sheet.deathSaves || { successes: 0, failures: 0 },
    personalityTraits: sheet.personalityTraits || "",
    ideals: sheet.ideals || "",
    bonds: sheet.bonds || "",
    flaws: sheet.flaws || "",
    appearance: sheet.appearance || "",
    notes: sheet.notes || "",
    features: sheet.features || [],
    resources: sheet.resources || {},
    createdAt: sheet.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Функция для получения модификатора из значения характеристики
 */
export const getModifierFromAbilityScore = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

/**
 * Вспомогательная функция для проверки, является ли класс магическим
 */
function isMagicClass(className: string): boolean {
  const magicClasses = [
    "Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун",
    "Паладин", "Следопыт"
  ];
  return magicClasses.includes(className);
}

/**
 * Функция для получения значения характеристики
 */
function getAbilityScore(character: Character, abilityShortName: string): number {
  if (!character.abilities) return 10;
  
  switch (abilityShortName) {
    case "STR": return character.abilities.STR || character.abilities.strength || 10;
    case "DEX": return character.abilities.DEX || character.abilities.dexterity || 10;
    case "CON": return character.abilities.CON || character.abilities.constitution || 10;
    case "INT": return character.abilities.INT || character.abilities.intelligence || 10;
    case "WIS": return character.abilities.WIS || character.abilities.wisdom || 10;
    case "CHA": return character.abilities.CHA || character.abilities.charisma || 10;
    default: return 10;
  }
}

/**
 * Функция для расчета бонуса мастерства
 */
function getProficiencyBonus(level: number): number {
  return 2 + Math.floor((level - 1) / 4);
}

/**
 * Функция для получения типа кости хитов по классу
 */
function getHitDiceByClass(className: string): string {
  switch (className) {
    case "Варвар": return "d12";
    case "Воин":
    case "Паладин":
    case "Следопыт": return "d10";
    case "Бард":
    case "Жрец":
    case "Друид":
    case "Монах":
    case "Плут":
    case "Колдун": return "d8";
    case "Волшебник":
    case "Чародей": return "d6";
    default: return "d8"; // По умолчанию d8
  }
}
