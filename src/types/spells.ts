
import { CharacterSpell } from './character';

export interface SpellData {
  id?: string | number;
  name: string;
  name_en?: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  source?: string;
  // Added all necessary spell properties
  isRitual?: boolean;
  isConcentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
  ritual?: boolean;
  concentration?: boolean;
}

export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    ...spell,
    name: spell.name,
    level: spell.level,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false, 
    material: spell.material || false,
    ritual: spell.ritual || spell.isRitual || false,
    concentration: spell.concentration || spell.isConcentration || false,
    higherLevels: spell.higherLevels || spell.higherLevel || "",
    id: spell.id
  };
};

export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};

// Функция для расчета известных заклинаний
export const calculateKnownSpells = (characterClass: string, level: number, abilityModifier: number): { cantrips: number; spells: number } => {
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
