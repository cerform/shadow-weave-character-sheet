
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';

// Calculate max spell level and known spells count based on class and character level
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass?: string, 
  level: number = 1,
  abilityModifier: number = 0
) => {
  if (!characterClass) {
    return { maxSpellLevel: 0, cantripsCount: 0, knownSpells: 0 };
  }

  const className = characterClass.toLowerCase();
  
  // Default values
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  
  // Calculate max spell level based on character level
  if (level >= 1) maxSpellLevel = 1;
  if (level >= 3) maxSpellLevel = 2;
  if (level >= 5) maxSpellLevel = 3;
  if (level >= 7) maxSpellLevel = 4;
  if (level >= 9) maxSpellLevel = 5;
  if (level >= 11) maxSpellLevel = 6;
  if (level >= 13) maxSpellLevel = 7;
  if (level >= 15) maxSpellLevel = 8;
  if (level >= 17) maxSpellLevel = 9;
  
  // Determine number of cantrips and spells known based on class
  switch (className) {
    case 'бард':
      cantripsCount = 2 + Math.floor(level / 10);
      knownSpells = level + Math.max(2, abilityModifier);
      break;
    case 'волшебник':
    case 'маг':
      cantripsCount = 3 + Math.floor(level / 10);
      // Wizards learn from their spellbook, minimum of level + INT modifier
      knownSpells = level * 2 + abilityModifier;
      break;
    case 'чародей':
      cantripsCount = 4 + Math.floor(level / 10);
      knownSpells = level + abilityModifier;
      break;
    case 'колдун':
      cantripsCount = 2 + Math.floor(level / 6);
      knownSpells = Math.min(level + 1, 15) + Math.floor(abilityModifier / 2);
      break;
    case 'жрец':
    case 'друид':
      cantripsCount = 3 + Math.floor(level / 10);
      // Clerics and druids prepare spells equal to level + wisdom modifier
      knownSpells = level + abilityModifier;
      break;
    case 'паладин':
      // Paladins start at level 2
      maxSpellLevel = level <= 1 ? 0 : Math.min(Math.ceil((level - 1) / 4), 5);
      cantripsCount = 0; // Paladins don't get cantrips
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
      break;
    case 'следопыт':
      // Rangers start at level 2
      maxSpellLevel = level <= 1 ? 0 : Math.min(Math.ceil((level - 1) / 4), 5);
      cantripsCount = 0; // Rangers traditionally don't get cantrips
      knownSpells = Math.max(1, Math.floor(level / 2) + abilityModifier);
      break;
    default:
      // For non-spellcasting classes or unknown classes
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  // Make sure values are never negative
  cantripsCount = Math.max(0, cantripsCount);
  knownSpells = Math.max(0, knownSpells);
  
  return { maxSpellLevel, cantripsCount, knownSpells };
};

// Convert spells from API or data format to CharacterSpell format
export const convertSpellsForState = (spells: SpellData[]): CharacterSpell[] => {
  return spells.map(spell => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: typeof spell.description === 'string' ? [spell.description] : spell.description || ['Нет описания'],
    classes: typeof spell.classes === 'string' ? [spell.classes] : spell.classes || [],
    prepared: false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  }));
};
