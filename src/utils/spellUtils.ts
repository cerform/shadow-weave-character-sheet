
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Normalize spells to ensure consistent data format
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) {
    return [];
  }
  
  return spells.map(spell => {
    // If spell is already a CharacterSpell object
    if (typeof spell === 'object' && spell !== null) {
      return {
        name: spell.name || '',
        level: spell.level || 0,
        school: spell.school || 'Transmutation',
        castingTime: spell.castingTime || '1 действие',
        range: spell.range || 'На себя',
        components: spell.components || 'В, С',
        duration: spell.duration || 'Мгновенная',
        description: spell.description || '',
        classes: spell.classes || [],
        source: spell.source || 'PHB'
      };
    }
    // If spell is just a string (name reference)
    else if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0,
        school: 'Transmutation',
        castingTime: '1 действие',
        range: 'На себя',
        components: 'В, С',
        duration: 'Мгновенная',
        description: '',
        classes: [],
        source: 'PHB'
      };
    }
    
    return {
      name: 'Неизвестное заклинание',
      level: 0,
      school: 'Transmutation',
      castingTime: '1 действие',
      range: 'На себя',
      components: 'В, С',
      duration: 'Мгновенная',
      description: '',
      classes: [],
      source: 'PHB'
    };
  });
};

// Convert CharacterSpell to SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Transmutation',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    source: spell.source || 'PHB'
  };
};

// Convert an array of CharacterSpell to SpellData
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(convertToSpellData);
};

// Calculate maximum spell level based on character level and class
export const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
  // Default values for most spellcasting classes
  if (["Волшебник", "Жрец", "Друид", "Бард", "Чародей"].includes(characterClass)) {
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    if (characterLevel >= 1) return 1;
  }
  
  // Half-casters
  if (["Паладин", "Следопыт"].includes(characterClass)) {
    if (characterLevel >= 17) return 5;
    if (characterLevel >= 13) return 4;
    if (characterLevel >= 9) return 3;
    if (characterLevel >= 5) return 2;
    if (characterLevel >= 2) return 1;
    return 0;
  }
  
  // Third-casters and special cases
  if (["Воин", "Плут"].includes(characterClass)) {
    if (characterLevel >= 19) return 4;
    if (characterLevel >= 13) return 3;
    if (characterLevel >= 7) return 2;
    if (characterLevel >= 3) return 1;
    return 0;
  }
  
  return 0;
};

// Calculate number of known spells for a class and level
export const calculateKnownSpells = (characterClass: string, characterLevel: number, abilityModifier = 0): { cantrips: number; spells: number } => {
  let cantrips = 0;
  let spells = 0;
  
  switch (characterClass) {
    case "Бард":
      cantrips = characterLevel >= 10 ? 4 : characterLevel >= 4 ? 3 : 2;
      spells = characterLevel + 3; // Bards know level + 3 spells
      break;
    case "Волшебник":
      cantrips = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
      spells = 6 + (characterLevel * 2); // Wizards can learn 2 spells per level, starting with 6
      break;
    case "Жрец":
    case "Друид":
      cantrips = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
      spells = characterLevel + abilityModifier; // Clerics/Druids prepare level + modifier
      break;
    case "Чародей":
      cantrips = characterLevel >= 10 ? 6 : characterLevel >= 4 ? 5 : 4;
      spells = characterLevel + 1; // Sorcerers know level + 1 spells
      break;
    case "Колдун":
      cantrips = characterLevel >= 10 ? 4 : characterLevel >= 4 ? 3 : 2;
      spells = characterLevel + 1; // Warlocks know level + 1 spells
      break;
    case "Паладин":
    case "Следопыт":
      cantrips = 0; // These classes don't get cantrips by default
      spells = Math.floor(characterLevel / 2) + abilityModifier; // Half-casters prepare half level + modifier
      break;
    default:
      cantrips = 0;
      spells = 0;
  }
  
  return { cantrips, spells };
};

// Get spell level as a string (for display)
export const getSpellLevel = (level: number): string => {
  if (level === 0) return "Заговор";
  return `${level}-й уровень`;
};
