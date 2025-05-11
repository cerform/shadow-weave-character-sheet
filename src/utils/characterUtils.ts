import { v4 as uuidv4 } from 'uuid';
import { Character, AbilityScores, HitPointEvent } from '@/types/character';
import { ABILITY_SCORE_CAPS, SKILL_LIST, SKILL_MAP, Skill } from '@/types/constants';
import { calculateProficiencyBonus } from './levelUtils';

/**
 * Creates a default character with initial values.
 * @returns {Character} A default character object.
 */
export const createDefaultCharacter = (): Character => ({
  id: uuidv4(),
  name: 'Новый персонаж',
  race: 'Человек',
  class: 'Воин',
  level: 1,
  background: 'Герой',
  alignment: 'Законопослушный Добрый',
  experience: 0,
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
  },
  hitPoints: {
    maxHp: 10,
    currentHp: 10,
    tempHp: 0,
    hitDice: {
      total: 1,
      remaining: 1,
      dieType: 'd10',
    },
    deathSaves: {
      successes: 0,
      failures: 0,
    },
  },
  armorClass: 10,
  initiative: 0,
  speed: 30,
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    savingThrows: [],
    skills: [],
    languages: [],
  },
  equipment: {
    armor: [],
    weapons: [],
    tools: [],
    gear: [],
    money: {
      cp: 0,
      sp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
    },
  },
  features: [],
  spells: [],
  spellcasting: {
    ability: 'intelligence',
    dc: 10,
    attack: 0,
    preparedSpellsLimit: 0,
  },
  personalityTraits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  appearance: '',
  backstory: '',
  image: '',
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  xp: 0,
  spellSlots: {},
});

/**
 * Calculate ability modifier from score
 * @param {number} abilityScore - The ability score value
 * @returns {number} The modifier value as a number
 */
export function getNumericModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Calculate ability modifier from score
 * @param {number} abilityScore - The ability score value
 * @returns {number} The calculated ability modifier
 */
export const calculateAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Get ability modifier with + sign for display
 * @param {number} abilityScore - The ability score value
 * @returns {string} The modifier with + or - sign as string
 */
export const getModifierString = (abilityScore: number): string => {
  const modifier = calculateAbilityModifier(abilityScore);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Aliases for backward compatibility
export const getAbilityModifier = getNumericModifier;
export const getModifierFromAbilityScore = getModifierString;

/**
 * Calculates the saving throw bonus for a given ability.
 * @param {number} abilityScore - The ability score.
 * @param {boolean} isProficient - Whether the character is proficient in the saving throw.
 * @param {number} proficiencyBonus - The character's proficiency bonus.
 * @returns {number} The saving throw bonus.
 */
export const calculateSavingThrowBonus = (
  abilityScore: number,
  isProficient: boolean,
  proficiencyBonus: number
): number => {
  const abilityModifier = calculateAbilityModifier(abilityScore);
  return abilityModifier + (isProficient ? proficiencyBonus : 0);
};

/**
 * Calculates the skill check bonus for a given skill.
 * @param {number} abilityScore - The ability score.
 * @param {boolean} isProficient - Whether the character is proficient in the skill.
 * @param {number} proficiencyBonus - The character's proficiency bonus.
 * @param {boolean} hasExpertise - Whether the character has expertise in the skill.
 * @returns {number} The skill check bonus.
 */
export const calculateSkillCheckBonus = (
  abilityScore: number,
  isProficient: boolean,
  proficiencyBonus: number,
  hasExpertise: boolean
): number => {
  const abilityModifier = calculateAbilityModifier(abilityScore);
  let bonus = abilityModifier;

  if (isProficient) {
    bonus += proficiencyBonus;
  }

  if (hasExpertise) {
    bonus += proficiencyBonus; // Expertise doubles the proficiency bonus
  }

  return bonus;
};

/**
 * Calculates the stat bonuses based on the character's race.
 * @param {Partial<Character>} character - The character object.
 * @returns {Partial<AbilityScores> | null} The stat bonuses based on the character's race.
 */
export const calculateStatBonuses = (character: Partial<Character>): Partial<AbilityScores> | null => {
  switch (character.race) {
    case 'Человек':
      return {
        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        charisma: 1,
        STR: 1,
        DEX: 1,
        CON: 1,
        INT: 1,
        WIS: 1,
        CHA: 1,
      };
    case 'Эльф':
      return {
        dexterity: 2,
        DEX: 2,
      };
    case 'Дварф':
      return {
        constitution: 2,
        CON: 2,
      };
    // Add more races here
    default:
      return null;
  }
};

/**
 * Calculates the initiative bonus for a given character.
 * @param {Character} character - The character object.
 * @returns {number} The initiative bonus.
 */
export const calculateInitiative = (character: Character): number => {
  return calculateAbilityModifier(character.abilities.dexterity);
};

/**
 * Calculates the armor class for a given character.
 * @param {Character} character - The character object.
 * @returns {number} The armor class.
 */
export const calculateArmorClass = (character: Character): number => {
  // This is a placeholder, implement the actual calculation based on armor, shield, and other modifiers
  return 10 + calculateAbilityModifier(character.abilities.dexterity);
};

/**
 * Calculates the maximum hit points for a given character.
 * @param {Character} character - The character object.
 * @returns {number} The maximum hit points.
 */
export const calculateMaxHP = (character: Character): number => {
  // This is a placeholder, implement the actual calculation based on class and level
  return 10 + calculateAbilityModifier(character.abilities.constitution) * character.level;
};

/**
 * Calculates the skill proficiency for a given character.
 * @param {Character} character - The character object.
 * @param {Skill} skill - The skill object.
 * @returns {boolean} Whether the character is proficient in the skill.
 */
export const isSkillProficient = (character: Character, skill: Skill): boolean => {
  return character.proficiencies.skills.includes(skill.name);
};

/**
 * Calculates the saving throw proficiency for a given character.
 * @param {Character} character - The character object.
 * @param {string} ability - The ability name.
 * @returns {boolean} Whether the character is proficient in the saving throw.
 */
export const isSavingThrowProficient = (character: Character, ability: string): boolean => {
  return character.proficiencies.savingThrows.includes(ability);
};

/**
 * Adds a hit point event to the character's hit point history.
 * @param {Character} character - The character object.
 * @param {HitPointEvent} event - The hit point event.
 * @returns {Character} The updated character object.
 */
export const addHitPointEvent = (character: Character, event: HitPointEvent): Character => {
  // This is a placeholder, implement the actual logic to add the event to the character's hit point history
  return character;
};

/**
 * Removes a hit point event from the character's hit point history.
 * @param {Character} character - The character object.
 * @param {string} eventId - The ID of the hit point event to remove.
 * @returns {Character} The updated character object.
 */
export const removeHitPointEvent = (character: Character, eventId: string): Character => {
  // This is a placeholder, implement the actual logic to remove the event from the character's hit point history
  return character;
};

/**
 * Updates a hit point event in the character's hit point history.
 * @param {Character} character - The character object.
 * @param {HitPointEvent} event - The updated hit point event.
 * @returns {Character} The updated character object.
 */
export const updateHitPointEvent = (character: Character, event: HitPointEvent): Character => {
  // This is a placeholder, implement the actual logic to update the event in the character's hit point history
  return character;
};

/**
 * Calculates the total weight of the items in the character's inventory.
 * @param {Character} character - The character object.
 * @returns {number} The total weight of the items in the character's inventory.
 */
export const calculateInventoryWeight = (character: Character): number => {
  // This is a placeholder, implement the actual calculation based on the weight of each item in the character's inventory
  return 0;
};

/**
 * Calculates the carrying capacity of the character.
 * @param {Character} character - The character object.
 * @returns {number} The carrying capacity of the character.
 */
export const calculateCarryingCapacity = (character: Character): number => {
  return character.abilities.strength * 15; // Base carrying capacity
};

/**
 * Checks if the character is encumbered.
 * @param {Character} character - The character object.
 * @returns {boolean} Whether the character is encumbered.
 */
export const isEncumbered = (character: Character): boolean => {
  const inventoryWeight = calculateInventoryWeight(character);
  const carryingCapacity = calculateCarryingCapacity(character);
  return inventoryWeight > carryingCapacity;
};

/**
 * Checks if the character is heavily encumbered.
 * @param {Character} character - The character object.
 * @returns {boolean} Whether the character is heavily encumbered.
 */
export const isHeavilyEncumbered = (character: Character): boolean => {
  const inventoryWeight = calculateInventoryWeight(character);
  const carryingCapacity = calculateCarryingCapacity(character);
  return inventoryWeight > (carryingCapacity * 2);
};

/**
 * Checks if the character is over their maximum carrying capacity.
 * @param {Character} character - The character object.
 * @returns {boolean} Whether the character is over their maximum carrying capacity.
 */
export const isOverMaximumCapacity = (character: Character): boolean => {
  const inventoryWeight = calculateInventoryWeight(character);
  const carryingCapacity = calculateCarryingCapacity(character);
  return inventoryWeight > (carryingCapacity * 3);
};

/**
 * Gets the skill object from the skill name.
 * @param {string} skillName - The name of the skill.
 * @returns {Skill | undefined} The skill object.
 */
export const getSkill = (skillName: string): Skill | undefined => {
  return SKILL_LIST.find((skill) => skill.name === skillName);
};

/**
 * Gets the ability name from the skill name.
 * @param {string} skillName - The name of the skill.
 * @returns {string | undefined} The ability name.
 */
export const getAbilityForSkill = (skillName: string): string | undefined => {
  return SKILL_MAP[skillName];
};

/**
 * Calculates the passive perception for a given character.
 * @param {Character} character - The character object.
 * @returns {number} The passive perception.
 */
export const calculatePassivePerception = (character: Character): number => {
  const wisdomModifier = calculateAbilityModifier(character.abilities.wisdom);
  const perceptionSkill = getSkill('Внимательность');
  const proficiencyBonus = calculateProficiencyBonus(character.level);
  let passivePerception = 10 + wisdomModifier;

  if (perceptionSkill) {
    const isProficient = isSkillProficient(character, perceptionSkill);
    passivePerception += isProficient ? proficiencyBonus : 0;
  }

  return passivePerception;
};

/**
 * Convert a partial character object to a full character with all required properties
 */
export const convertToCharacter = (partialCharacter: Partial<Character>): Character => {
  // Start with a default character
  const defaultChar = createDefaultCharacter();
  
  // Merge the partial character with the default one
  return {
    ...defaultChar,
    ...partialCharacter,
    // Ensure nested objects are properly merged
    abilities: {
      ...defaultChar.abilities,
      ...(partialCharacter.abilities || {}),
      // Ensure both naming conventions are maintained
      STR: partialCharacter.abilities?.STR || partialCharacter.abilities?.strength || defaultChar.abilities.STR,
      DEX: partialCharacter.abilities?.DEX || partialCharacter.abilities?.dexterity || defaultChar.abilities.DEX,
      CON: partialCharacter.abilities?.CON || partialCharacter.abilities?.constitution || defaultChar.abilities.CON,
      INT: partialCharacter.abilities?.INT || partialCharacter.abilities?.intelligence || defaultChar.abilities.INT,
      WIS: partialCharacter.abilities?.WIS || partialCharacter.abilities?.wisdom || defaultChar.abilities.WIS,
      CHA: partialCharacter.abilities?.CHA || partialCharacter.abilities?.charisma || defaultChar.abilities.CHA,
      strength: partialCharacter.abilities?.STR || partialCharacter.abilities?.strength || defaultChar.abilities.strength,
      dexterity: partialCharacter.abilities?.DEX || partialCharacter.abilities?.dexterity || defaultChar.abilities.dexterity,
      constitution: partialCharacter.abilities?.CON || partialCharacter.abilities?.constitution || defaultChar.abilities.constitution,
      intelligence: partialCharacter.abilities?.INT || partialCharacter.abilities?.intelligence || defaultChar.abilities.intelligence,
      wisdom: partialCharacter.abilities?.WIS || partialCharacter.abilities?.wisdom || defaultChar.abilities.wisdom,
      charisma: partialCharacter.abilities?.CHA || partialCharacter.abilities?.charisma || defaultChar.abilities.charisma
    },
    hitPoints: {
      ...defaultChar.hitPoints,
      ...(partialCharacter.hitPoints || {})
    },
    proficiencies: {
      ...defaultChar.proficiencies,
      ...(partialCharacter.proficiencies || {})
    },
    equipment: {
      ...defaultChar.equipment,
      ...(partialCharacter.equipment || {})
    },
    features: [
      ...defaultChar.features,
      ...(partialCharacter.features || [])
    ],
    spellcasting: {
      ...defaultChar.spellcasting,
      ...(partialCharacter.spellcasting || {})
    }
  };
};
