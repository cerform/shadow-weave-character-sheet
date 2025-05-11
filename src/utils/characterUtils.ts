import { Character } from '@/types/character';

/**
 * Calculate stat modifiers
 */
export const getModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Get modifier string with "+" sign if positive
 */
export const getModifierString = (abilityScore: number): string => {
  const mod = getModifier(abilityScore);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

/**
 * Get numeric modifier value
 */
export const getNumericModifier = (abilityScore: number): number => {
  return getModifier(abilityScore);
};

/**
 * Get ability modifier based on ability name
 */
export const getAbilityModifier = (character: Character, abilityName: string): number => {
  if (!character || !character.abilities) return 0;
  
  const abilityNameLower = abilityName.toLowerCase();
  let abilityScore = 10;
  
  if (abilityNameLower === 'strength' || abilityNameLower === 'str') {
    abilityScore = character.abilities.strength || character.abilities.STR || 10;
  } else if (abilityNameLower === 'dexterity' || abilityNameLower === 'dex') {
    abilityScore = character.abilities.dexterity || character.abilities.DEX || 10;
  } else if (abilityNameLower === 'constitution' || abilityNameLower === 'con') {
    abilityScore = character.abilities.constitution || character.abilities.CON || 10;
  } else if (abilityNameLower === 'intelligence' || abilityNameLower === 'int') {
    abilityScore = character.abilities.intelligence || character.abilities.INT || 10;
  } else if (abilityNameLower === 'wisdom' || abilityNameLower === 'wis') {
    abilityScore = character.abilities.wisdom || character.abilities.WIS || 10;
  } else if (abilityNameLower === 'charisma' || abilityNameLower === 'cha') {
    abilityScore = character.abilities.charisma || character.abilities.CHA || 10;
  }
  
  return getModifier(abilityScore);
};

/**
 * Calculate modifier from ability score
 */
export const getModifierFromAbilityScore = (abilityScore: number): number => {
  return getModifier(abilityScore);
};

/**
 * Calculate ability modifier (alias for clarity)
 */
export const calculateAbilityModifier = (abilityScore: number): number => {
  return getModifier(abilityScore);
};

/**
 * Calculate proficiency bonus based on level
 */
export const getProficiencyBonus = (level: number): number => {
  return Math.ceil(1 + level / 4);
};

/**
 * Calculate saving throw bonus
 */
export const calculateSavingThrowBonus = (abilityScore: number, proficiency: boolean, level: number): number => {
  let bonus = getModifier(abilityScore);
  if (proficiency) {
    bonus += getProficiencyBonus(level);
  }
  return bonus;
};

/**
 * Calculate skill bonus
 */
export const calculateSkillBonus = (abilityScore: number, proficiency: boolean, expertise: boolean, level: number): number => {
  let bonus = getModifier(abilityScore);
  if (proficiency) {
    bonus += getProficiencyBonus(level);
  }
  if (expertise) {
    bonus += getProficiencyBonus(level);
  }
  return bonus;
};

/**
 * Calculate armor class
 */
export const calculateArmorClass = (character: Character): number => {
  let armorClass = 10;
  
  // Base AC calculation
  if (character.abilities) {
    armorClass += getModifier(character.abilities.dexterity || character.dexterity || 10);
    
    // Check if character has equipment with armor
    if (character.equipment) {
      // Handle both object and array formats
      if (Array.isArray(character.equipment)) {
        // Check if any item is armor
        const armorItem = character.equipment.find(item => item.type === 'armor');
        if (armorItem) {
          // Here we would add logic to calculate AC based on armor type
          armorClass += 2; // Example value, should be based on armor type
        }
      } else {
        // Handle object format
        if (character.equipment.armor) {
          // Here we would add logic for armor AC bonus
          armorClass += 2; // Example value, should be based on armor type
        }
      }
    }
  }
  
  return armorClass;
};

/**
 * Calculate initiative
 */
export const calculateInitiative = (character: Character): number => {
  let initiative = 0;
  
  if (character.abilities) {
    initiative += getModifier(character.abilities.dexterity || character.dexterity || 10);
  }
  
  return initiative;
};

/**
 * Calculate max HP
 */
export const calculateMaxHP = (character: Character): number => {
  let maxHP = 0;
  
  if (character.abilities) {
    maxHP += getModifier(character.abilities.constitution || character.constitution || 10) + 
             (character.level || 1) * 5; // Example: 5 HP per level
  }
  
  return maxHP;
};

/**
 * Calculate carrying capacity
 */
export const calculateCarryingCapacity = (strengthScore: number): number => {
  return strengthScore * 15; // Example: base formula
};

/**
 * Calculate encumbered limit
 */
export const calculateEncumberedLimit = (strengthScore: number): number => {
  return strengthScore * 5; // Example: base formula
};

/**
 * Calculate heavily encumbered limit
 */
export const calculateHeavilyEncumberedLimit = (strengthScore: number): number => {
  return strengthScore * 10; // Example: base formula
};

/**
 * Calculate push, drag, and lift capacity
 */
export const calculatePushDragLiftCapacity = (strengthScore: number): number => {
  return strengthScore * 30; // Example: base formula
};

/**
 * Get size modifier
 */
export const getSizeModifier = (size: string): number => {
  switch (size) {
    case 'Tiny': return 2;
    case 'Small': return 1;
    case 'Medium': return 0;
    case 'Large': return -1;
    case 'Huge': return -2;
    case 'Gargantuan': return -4;
    default: return 0;
  }
};

/**
 * Get speed based on race
 */
export const getRaceSpeed = (race: string): number => {
  switch (race) {
    case 'Dwarf': return 25;
    case 'Elf': return 30;
    case 'Halfling': return 25;
    case 'Human': return 30;
    case 'Dragonborn': return 30;
    case 'Gnome': return 25;
    case 'Half-Elf': return 30;
    case 'Half-Orc': return 30;
    case 'Tiefling': return 30;
    default: return 30;
  }
};

/**
 * Get racial traits
 */
export const getRacialTraits = (race: string): string[] => {
  switch (race) {
    case 'Dwarf': return ['Darkvision', 'Dwarven Resilience'];
    case 'Elf': return ['Darkvision', 'Fey Ancestry'];
    case 'Halfling': return ['Lucky', 'Brave'];
    case 'Human': return ['Extra Language'];
    case 'Dragonborn': return ['Draconic Ancestry', 'Breath Weapon'];
    case 'Gnome': return ['Darkvision', 'Gnome Cunning'];
    case 'Half-Elf': return ['Fey Ancestry', 'Skill Versatility'];
    case 'Half-Orc': return ['Darkvision', 'Relentless Endurance'];
    case 'Tiefling': return ['Darkvision', 'Hellish Resistance'];
    default: return [];
  }
};

/**
 * Get class features
 */
export const getClassFeatures = (className: string, level: number): string[] => {
  switch (className) {
    case 'Fighter':
      if (level >= 1) return ['Fighting Style', 'Second Wind'];
      break;
    case 'Wizard':
      if (level >= 1) return ['Spellcasting', 'Arcane Recovery'];
      break;
    default: return [];
  }
  return [];
};

/**
 * Get alignment description
 */
export const getAlignmentDescription = (alignment: string): string => {
  switch (alignment) {
    case 'Lawful Good': return 'Creatures act as a good person is expected to act. They combine a commitment to oppose evil with a discipline to stand against it.';
    case 'Neutral Good': return 'Creatures do the best that a good person can do. They are devoted to helping others.';
    case 'Chaotic Good': return 'Creatures act as their conscience directs them, with little regard for what others expect. They make their own way, but are kind and benevolent.';
    case 'Lawful Neutral': return 'Creatures act in accordance with law, tradition, or personal codes.';
    case 'Neutral': return 'Creatures are those who follow their instincts without strong feelings for or against lawfulness or goodness.';
    case 'Chaotic Neutral': return 'Creatures follow their whims. They are individualists first and last. They value their own liberty but don\'t strive to protect others\' freedom.';
    case 'Lawful Evil': return 'Creatures methodically take what they want, within the limits of a code of tradition, loyalty, or order.';
    case 'Neutral Evil': return 'Creatures do whatever they can get away with, without compassion or qualms.';
    case 'Chaotic Evil': return 'Creatures act with arbitrary violence, spurred by their greed, hatred, or bloodlust.';
    default: return '';
  }
};

/**
 * Get damage types
 */
export const getDamageTypes = (): string[] => {
  return ['Acid', 'Bludgeoning', 'Cold', 'Fire', 'Force', 'Lightning', 'Necrotic', 'Piercing', 'Poison', 'Psychic', 'Radiant', 'Slashing', 'Thunder'];
};

/**
 * Get condition types
 */
export const getConditionTypes = (): string[] => {
  return ['Blinded', 'Charmed', 'Deafened', 'Exhaustion', 'Frightened', 'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious'];
};

/**
 * Get weapon properties
 */
export const getWeaponProperties = (): string[] => {
  return ['Ammunition', 'Finesse', 'Heavy', 'Light', 'Loading', 'Reach', 'Special', 'Thrown', 'Two-Handed', 'Versatile'];
};

/**
 * Get armor types
 */
export const getArmorTypes = (): string[] => {
  return ['Light', 'Medium', 'Heavy', 'Shield'];
};

/**
 * Get tool types
 */
export const getToolTypes = (): string[] => {
  return ['Artisan\'s Tools', 'Gaming Set', 'Musical Instrument'];
};

/**
 * Get language types
 */
export const getLanguageTypes = (): string[] => {
  return ['Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon'];
};

/**
 * Get skill types
 */
export const getSkillTypes = (): string[] => {
  return ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];
};

/**
 * Get saving throw types
 */
export const getSavingThrowTypes = (): string[] => {
  return ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
};

/**
 * Get alignment types
 */
export const getAlignmentTypes = (): string[] => {
  return ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
};

/**
 * Get race types
 */
export const getRaceTypes = (): string[] => {
  return ['Dwarf', 'Elf', 'Halfling', 'Human', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'];
};

/**
 * Get class types
 */
export const getClassTypes = (): string[] => {
  return ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'];
};

/**
 * Create default character
 */
export const createDefaultCharacter = (): Character => {
  return {
    id: '',
    name: '',
    race: '',
    class: '',
    background: '',
    alignment: 'Neutral',
    level: 1,
    xp: 0,
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
      charisma: 10,
    },
    savingThrows: {
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
    },
    skills: {},
    hp: 10,
    maxHp: 10,
    temporaryHp: 0,
    tempHp: 0,
    ac: 10,
    armorClass: 10,
    proficiencyBonus: 2,
    speed: 30,
    initiative: 0,
    inspiration: false,
    hitDice: {
      total: 1,
      used: 0,
      dieType: 'd8',
    },
    resources: {},
    deathSaves: {
      successes: 0,
      failures: 0,
    },
    spellcasting: {
      ability: 'intelligence',
      dc: 10,
      attack: 0,
      preparedSpellsLimit: 0,
    },
    spellSlots: {},
    spells: [],
    equipment: {
      weapons: [],
      armor: '',
      items: [],
      gold: 0,
    },
    proficiencies: {
      languages: ['Common'],
      tools: [],
      weapons: [],
      armor: [],
      skills: [],
    },
    features: [],
    notes: '',
    savingThrowProficiencies: [],
    skillProficiencies: [],
    expertise: [],
    skillBonuses: {},
  };
};

/**
 * Convert to character
 */
export const convertToCharacter = (partialChar: Partial<Character>): Character => {
  const defaultCharacter = createDefaultCharacter();
  return {
    ...defaultCharacter,
    ...partialChar,
    abilities: {
      ...defaultCharacter.abilities,
      ...(partialChar.abilities || {}),
    },
    savingThrows: {
      ...defaultCharacter.savingThrows,
      ...(partialChar.savingThrows || {}),
    },
    proficiencies: {
      ...defaultCharacter.proficiencies,
      ...(partialChar.proficiencies || {}),
    },
  } as Character;
};

/**
 * Calculate stat bonuses based on race
 */
export const calculateStatBonuses = (character: Character): { race: string; abilities: { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number; strength: number; dexterity: number; constitution: number; intelligence: number; wisdom: number; charisma: number; } | null; } | null => {
  if (!character || !character.race) return null;

  let abilities = {
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

  switch (character.race.toLowerCase()) {
    case 'dwarf':
      abilities = { ...abilities, CON: 2, constitution: 2 };
      break;
    case 'elf':
      abilities = { ...abilities, DEX: 2, dexterity: 2 };
      break;
    case 'halfling':
      abilities = { ...abilities, DEX: 2, dexterity: 2 };
      break;
    case 'human':
      abilities = {
        STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1,
        strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1
      };
      break;
    case 'dragonborn':
      abilities = { ...abilities, STR: 2, CHA: 1, strength: 2, charisma: 1 };
      break;
    case 'gnome':
      abilities = { ...abilities, INT: 2, intelligence: 2 };
      break;
    case 'half-elf':
      abilities = { ...abilities, CHA: 2, charisma: 2 };
      break;
    case 'half-orc':
      abilities = { ...abilities, STR: 2, CON: 1, strength: 2, constitution: 1 };
      break;
    case 'tiefling':
      abilities = { ...abilities, INT: 1, CHA: 2, intelligence: 1, charisma: 2 };
      break;
    default:
      return null;
  }

  return { race: character.race, abilities };
};

const safeSpreader = (obj: any): Record<string, any> => {
  if (obj && typeof obj === 'object') {
    return { ...obj };
  }
  return {};
};
