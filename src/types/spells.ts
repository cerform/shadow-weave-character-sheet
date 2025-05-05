
export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
  classes?: string[] | string;
  source?: string;
}

// Helper function to convert SpellData to CharacterSpell
export const convertSpellDataToCharacterSpell = (spellData: SpellData) => {
  return {
    name: spellData.name,
    level: spellData.level,
    school: spellData.school,
    castingTime: spellData.castingTime,
    range: spellData.range,
    components: spellData.components,
    duration: spellData.duration,
    description: spellData.description,
    prepared: spellData.prepared || false,
    classes: spellData.classes || [],
    source: spellData.source || 'PHB'
  };
};

// Function to calculate how many spells a character can know based on class and level
export const calculateKnownSpells = (characterClass: string, level: number, abilityModifier: number) => {
  // Default values
  let cantrips = 0;
  let spells = 0;

  // Calculate known spells based on class
  switch (characterClass.toLowerCase()) {
    case 'бард':
    case 'bard':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = Math.min(level + abilityModifier, 22); // Max 22 spells at level 20
      break;
    case 'жрец':
    case 'cleric':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + abilityModifier;
      break;
    case 'друид':
    case 'druid':
      cantrips = level >= 4 ? 3 : 2;
      spells = level + abilityModifier;
      break;
    case 'паладин':
    case 'paladin':
      cantrips = 0;
      spells = Math.floor(level / 2) + abilityModifier;
      break;
    case 'следопыт':
    case 'ranger':
      cantrips = 0;
      spells = Math.floor(level / 2) + abilityModifier;
      break;
    case 'волшебник':
    case 'wizard':
      cantrips = level >= 10 ? 5 : (level >= 4 ? 4 : 3);
      spells = level + abilityModifier; // Base spells, without spellbook extras
      break;
    case 'чародей':
    case 'sorcerer':
      cantrips = level >= 10 ? 6 : (level >= 4 ? 5 : 4);
      spells = level + 1; // Sorcerers don't use ability mod for known spells
      break;
    case 'колдун':
    case 'warlock':
      cantrips = level >= 10 ? 4 : (level >= 4 ? 3 : 2);
      spells = level + 1; // Warlocks have fixed number of spells known
      break;
    default:
      cantrips = 0;
      spells = 0;
  }

  return {
    cantrips: Math.max(0, cantrips),
    spells: Math.max(0, spells)
  };
};
