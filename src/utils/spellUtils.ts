
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

// Calculate spell DC based on character stats
export function calculateSpellSaveDC(character: Character): number {
  if (!character) return 10;
  
  const spellcastingAbility = getDefaultCastingAbility(character.class);
  let abilityMod = 0;
  
  // Determine ability modifier based on spellcasting ability
  switch (spellcastingAbility) {
    case "intelligence":
      abilityMod = Math.floor((character.abilities?.INT || 10) - 10) / 2;
      break;
    case "wisdom":
      abilityMod = Math.floor((character.abilities?.WIS || 10) - 10) / 2;
      break;
    case "charisma":
      abilityMod = Math.floor((character.abilities?.CHA || 10) - 10) / 2;
      break;
  }
  
  const profBonus = character.proficiencyBonus || 2;
  return 8 + profBonus + abilityMod;
}

// Calculate spell attack bonus based on character stats
export function calculateSpellAttackBonus(character: Character): number {
  if (!character) return 0;
  
  const spellcastingAbility = getDefaultCastingAbility(character.class);
  let abilityMod = 0;
  
  // Determine ability modifier based on spellcasting ability
  switch (spellcastingAbility) {
    case "intelligence":
      abilityMod = Math.floor((character.abilities?.INT || 10) - 10) / 2;
      break;
    case "wisdom":
      abilityMod = Math.floor((character.abilities?.WIS || 10) - 10) / 2;
      break;
    case "charisma":
      abilityMod = Math.floor((character.abilities?.CHA || 10) - 10) / 2;
      break;
  }
  
  const profBonus = character.proficiencyBonus || 2;
  return profBonus + abilityMod;
}

// Get default spellcasting ability based on class
export function getDefaultCastingAbility(characterClass: string): "intelligence" | "wisdom" | "charisma" {
  if (!characterClass) return "charisma"; // Default
  
  const classLower = characterClass.toLowerCase();
  
  if (classLower.includes("волшебник") || classLower.includes("wizard") || 
      classLower.includes("artificer") || classLower.includes("изобретатель")) {
    return "intelligence";
  }
  
  if (classLower.includes("жрец") || classLower.includes("cleric") || 
      classLower.includes("друид") || classLower.includes("druid") || 
      classLower.includes("следопыт") || classLower.includes("ranger") ||
      classLower.includes("monk") || classLower.includes("монах")) {
    return "wisdom";
  }
  
  // Default: Bard, Paladin, Sorcerer, Warlock
  return "charisma";
}

// Calculate available spells based on class and level
export function calculateAvailableSpellsByClassAndLevel(
  characterClass: string,
  level: number,
  abilityModifier: number = 0
): {
  maxSpellLevel: number;
  cantripsCount: number;
  knownSpells: number;
} {
  const classLower = characterClass.toLowerCase();
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Calculate max spell level
  if (level >= 1) {
    maxSpellLevel = Math.min(9, Math.ceil(level / 2)); // Simplified formula
  }
  
  // Calculate cantrips count and known spells based on class
  switch (classLower) {
    case "bard":
    case "бард":
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = Math.min(22, 4 + Math.max(0, level - 1));
      break;
      
    case "cleric":
    case "жрец":
    case "druid":
    case "друид":
      cantripsCount = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      knownSpells = level + Math.max(0, abilityModifier); // Level + Wisdom mod
      break;
      
    case "paladin":
    case "паладин":
      cantripsCount = 0; // Paladins don't get cantrips
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier); // Half level + Cha mod
      break;
      
    case "ranger":
    case "следопыт":
      cantripsCount = 0; // Rangers don't get cantrips normally
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier); // Half level + Wis mod
      break;
      
    case "sorcerer":
    case "чародей":
      cantripsCount = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
      knownSpells = level + 1;
      break;
      
    case "warlock":
    case "колдун":
      cantripsCount = level >= 10 ? 4 : 2;
      knownSpells = level + 1 + Math.floor(level / 2);
      break;
      
    case "wizard":
    case "волшебник":
      cantripsCount = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      knownSpells = 6 + (level * 2); // Start with 6, add 2 per level
      break;
      
    default:
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells };
}

// Filter spells by class and level
export function filterSpellsByClassAndLevel(
  spells: SpellData[],
  characterClass: string,
  maxSpellLevel: number
): SpellData[] {
  if (!spells || !spells.length) return [];
  
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Filter by spell level
    if (spell.level > maxSpellLevel) return false;
    
    // Filter by class
    if (!spell.classes) return false;
    
    const spellClasses = typeof spell.classes === "string" ? 
      [spell.classes.toLowerCase()] : 
      spell.classes.map(cls => cls.toLowerCase());
    
    return spellClasses.some(cls => cls.includes(classLower) || classLower.includes(cls));
  });
}

// Get spellcasting ability modifier for a character
export function getSpellcastingAbilityModifier(character: Character): number {
  if (!character) return 0;
  
  const spellcastingAbility = getDefaultCastingAbility(character.class || "");
  
  switch (spellcastingAbility) {
    case "intelligence":
      return Math.floor((character.abilities?.INT || character.intelligence || 10) - 10) / 2;
    case "wisdom":
      return Math.floor((character.abilities?.WIS || character.wisdom || 10) - 10) / 2;
    case "charisma":
      return Math.floor((character.abilities?.CHA || character.charisma || 10) - 10) / 2;
    default:
      return 0;
  }
}

// Normalize spells to ensure consistent format
export function normalizeSpells(spells: (CharacterSpell | string)[]): CharacterSpell[] {
  if (!spells) return [];
  
  return spells.map(spell => {
    if (typeof spell === "string") {
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, "-")}`,
        name: spell,
        level: 0, // Default to cantrip
        school: "Универсальная",
        castingTime: "1 действие",
        range: "На себя",
        components: "",
        duration: "Мгновенная", 
        description: ""
      };
    }
    
    // Ensure spell has all required fields
    return {
      id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: spell.name,
      level: spell.level || 0,
      school: spell.school || "Универсальная",
      castingTime: spell.castingTime || "1 действие",
      range: spell.range || "На себя",
      components: spell.components || "",
      duration: spell.duration || "Мгновенная",
      description: spell.description || "",
      prepared: spell.prepared || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      classes: spell.classes || []
    };
  });
}

// Add convertToSpellData function
export function convertToSpellData(spell: CharacterSpell | string): SpellData {
  if (typeof spell === "string") {
    return {
      id: `spell-${spell.toLowerCase().replace(/\s+/g, "-")}`,
      name: spell,
      level: 0,
      school: "Универсальная",
      castingTime: "1 действие",
      range: "На себя",
      components: "",
      duration: "Мгновенная",
      description: ""
    };
  }
  
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || "Универсальная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "",
    classes: spell.classes || [],
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    prepared: spell.prepared,
    materials: spell.materials,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    source: spell.source
  };
}

// Check if character can prepare more spells
export function canPrepareMoreSpells(character: Character): boolean {
  if (!character) return false;
  
  // Get spellcasting ability modifier
  const abilityMod = getSpellcastingAbilityModifier(character);
  
  // Get level
  const level = character.level || 1;
  
  // Calculate maximum prepared spells (common formula: level + ability modifier)
  const maxPrepared = level + abilityMod;
  
  // Count currently prepared spells
  const currentPrepared = (character.spells || []).filter(spell => {
    if (typeof spell === "string") return false;
    return !!spell.prepared;
  }).length;
  
  return currentPrepared < maxPrepared;
}
