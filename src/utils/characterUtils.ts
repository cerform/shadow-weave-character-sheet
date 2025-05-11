
import { Character } from "@/types/character";
import { generateRandomStats } from './characterGenerator';
import { v4 as uuidv4 } from 'uuid';
import { diceRollSimulator } from './diceRollUtils';

/**
 * Функция создания базового персонажа
 */
export function createBaseCharacter(name: string = "Новый персонаж"): Character {
  const baseStats = generateRandomStats();
  
  // Глубокое клонирование объекта baseStats для abilities и savingThrows
  const abilities = {
    STR: baseStats.strength,
    DEX: baseStats.dexterity,
    CON: baseStats.constitution,
    INT: baseStats.intelligence,
    WIS: baseStats.wisdom,
    CHA: baseStats.charisma,
    strength: baseStats.strength,
    dexterity: baseStats.dexterity,
    constitution: baseStats.constitution,
    intelligence: baseStats.intelligence,
    wisdom: baseStats.wisdom,
    charisma: baseStats.charisma,
  };
  
  const savingThrows = {
    STR: 0,
    DEX: 0,
    CON: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  };

  return {
    id: uuidv4(),
    name,
    race: "",
    class: "",
    background: "",
    alignment: "Нейтральный",
    level: 1,
    xp: 0,
    abilities,
    savingThrows,
    skills: {},
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    tempHp: 0,
    ac: 10,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: "d8",
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    spellcasting: {
      ability: "",
      dc: 10,
      attack: 0,
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: "",
      items: [],
      gold: 0,
    },
    proficiencies: {
      languages: ["Common"],
      tools: [],
      weapons: [],
      armor: [],
      skills: [],
    },
    features: [],
    notes: "",
    personality: {
      traits: "",
      ideals: "",
      bonds: "",
      flaws: ""
    },
    image: "" // Добавляем пустое поле изображения
  };
}

// Alias for createBaseCharacter for backward compatibility
export const createDefaultCharacter = createBaseCharacter;

/**
 * Расчет модификатора характеристики
 */
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Aliases for backward compatibility
export const getModifier = (score: number): string => {
  const mod = calculateAbilityModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const getModifierString = getModifier;

export const getNumericModifier = calculateAbilityModifier;

export const getAbilityModifier = calculateAbilityModifier;

export const getModifierFromAbilityScore = calculateAbilityModifier;

/**
 * Получение значения спасброска
 */
export const getSavingThrowValue = (
  character: Character, 
  ability: keyof Character["savingThrows"]
): number => {
  const isProficient = character.savingThrowProficiencies?.includes(ability as string) || false;
  const abilityScore = character.abilities[ability];
  const modifier = calculateAbilityModifier(abilityScore);
  
  return isProficient 
    ? modifier + character.proficiencyBonus 
    : modifier;
};

/**
 * Расчет бонуса навыка
 */
export const calculateSkillBonus = (
  character: Character, 
  skill: string,
  abilityKey: keyof Character["abilities"]
): number => {
  const skillInfo = character.skills[skill];
  const isProficient = skillInfo?.proficient || false;
  const hasExpertise = skillInfo?.expertise || false;
  
  const abilityModifier = calculateAbilityModifier(character.abilities[abilityKey]);
  let bonus = abilityModifier;
  
  if (isProficient) {
    bonus += character.proficiencyBonus;
  }
  
  if (hasExpertise) {
    bonus += character.proficiencyBonus;
  }
  
  return bonus;
};

/**
 * Функция создания случайного персонажа
 */
export const createRandomCharacter = (): Character => {
  const races = ["Человек", "Эльф", "Дварф", "Полуорк", "Гном", "Полурослик", "Тифлинг"];
  const classes = ["Воин", "Маг", "Плут", "Жрец", "Варвар", "Бард", "Монах"];
  const backgrounds = ["Благородный", "Солдат", "Мудрец", "Преступник", "Чужеземец", "Моряк"];
  const alignments = ["Законно-добрый", "Нейтрально-добрый", "Хаотично-добрый", "Законно-нейтральный", "Нейтральный", "Хаотично-нейтральный", "Законно-злой", "Нейтрально-злой", "Хаотично-злой"];
  
  const randomRace = races[Math.floor(Math.random() * races.length)];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const randomAlignment = alignments[Math.floor(Math.random() * alignments.length)];
  
  const character = createBaseCharacter(`${randomRace} ${randomClass}`);
  
  character.race = randomRace;
  character.class = randomClass;
  character.background = randomBackground;
  character.alignment = randomAlignment;
  
  // Генерируем случайные значения для hp, ac, скорости
  character.hp = diceRollSimulator(8, 1) + calculateAbilityModifier(character.abilities.CON);
  character.maxHp = character.hp;
  character.ac = 10 + calculateAbilityModifier(character.abilities.DEX);
  character.initiative = calculateAbilityModifier(character.abilities.DEX);
  
  // Добавляем случайные владения
  const randomSkills = ["Атлетика", "Акробатика", "Выживание", "Запугивание", "История", "Восприятие"];
  const randomLanguages = ["Эльфийский", "Дварфийский", "Гномский", "Драконий"];
  
  // Выбираем 2 случайных навыка
  for (let i = 0; i < 2; i++) {
    const randomSkill = randomSkills[Math.floor(Math.random() * randomSkills.length)];
    if (!character.skills[randomSkill]) {
      character.skills[randomSkill] = {
        proficient: true,
        expertise: false,
        value: character.proficiencyBonus
      };
    }
  }
  
  // Добавляем случайный язык
  character.proficiencies.languages.push(
    randomLanguages[Math.floor(Math.random() * randomLanguages.length)]
  );
  
  // Добавляем случайное снаряжение
  const equipment = character.equipment as { weapons: string[], armor: string, items: string[], gold: number };
  equipment.weapons.push(randomClass === "Маг" ? "Посох" : "Кинжал");
  equipment.items.push("Рюкзак", "Рацион", "Веревка");
  equipment.gold = Math.floor(Math.random() * 50) + 10;
  
  // Добавляем personality трейты
  character.personality = {
    traits: "Я всегда стараюсь помогать нуждающимся.",
    ideals: "Свобода. Каждый должен быть свободен делать свой выбор.",
    bonds: "Я защищаю тех, кто не может защитить себя.",
    flaws: "Я слишком доверчив."
  };
  
  return character;
};

/**
 * Обновление персонажа частичным объектом
 */
export const updateCharacter = (
  character: Character, 
  updates: Partial<Character>
): Character => {
  // Начинаем с копирования текущего персонажа
  const updatedCharacter = { ...character };
  
  // Обновляем все переданные поля
  Object.entries(updates).forEach(([key, value]) => {
    // Если передан объект и в текущем персонаже уже есть такой объект, 
    // то сливаем их, а не заменяем полностью
    if (
      typeof value === 'object' && 
      value !== null && 
      !Array.isArray(value) && 
      updatedCharacter[key as keyof Character] &&
      typeof updatedCharacter[key as keyof Character] === 'object'
    ) {
      // @ts-ignore - мы уже проверили типы выше
      updatedCharacter[key as keyof Character] = {
        ...updatedCharacter[key as keyof Character],
        ...value
      };
    } else {
      // @ts-ignore - прямое присвоение
      updatedCharacter[key] = value;
    }
  });
  
  return updatedCharacter;
};

// Функция получения текущего уровня по опыту
export function getLevelByXP(xp: number): number {
  const xpLevels = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  
  let level = 1;
  for (let i = 0; i < xpLevels.length; i++) {
    if (xp >= xpLevels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  return Math.min(level, 20);
}

// Additional functions for backward compatibility
export const convertToCharacter = (data: any): Character => {
  return { ...createDefaultCharacter(), ...data };
};

export const calculateInitiative = (character: Character): number => {
  return calculateAbilityModifier(character.abilities.DEX);
};

export const calculateArmorClass = (character: Character): number => {
  // Basic AC calculation: 10 + DEX modifier
  return 10 + calculateAbilityModifier(character.abilities.DEX);
};

export const calculateMaxHP = (character: Character): number => {
  // Basic HP calculation: class hit die + CON modifier per level
  const conModifier = calculateAbilityModifier(character.abilities.CON);
  const hitDieValue = parseInt(character.hitDice.dieType.substring(1), 10);
  
  // First level gives maximum hit die value + CON modifier
  let maxHp = hitDieValue + conModifier;
  
  // Additional levels
  if (character.level > 1) {
    // Average roll for additional levels: (hit die / 2) + 1 + CON modifier
    const averageRoll = Math.floor(hitDieValue / 2) + 1;
    maxHp += (averageRoll + conModifier) * (character.level - 1);
  }
  
  return maxHp;
};

// Function to calculate bonuses from stats, race, etc.
export const calculateStatBonuses = (character: Character): Character => {
  // This is just a basic implementation
  const updatedCharacter = { ...character };
  
  // Update derived statistics
  updatedCharacter.initiative = calculateInitiative(updatedCharacter);
  updatedCharacter.ac = calculateArmorClass(updatedCharacter);
  
  return updatedCharacter;
};
