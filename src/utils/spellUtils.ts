
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getNumericModifier } from '@/utils/characterUtils';

/**
 * Calculate available spells by class and level
 */
export function calculateAvailableSpellsByClassAndLevel(className: string, level: number): number[] {
  // Заговоры (cantrips) доступны для всех магических классов
  const spellLevels = [0];
  
  if (level >= 1) {
    spellLevels.push(1);
  }
  
  if (level >= 3) {
    spellLevels.push(2);
  }
  
  if (level >= 5) {
    spellLevels.push(3);
  }
  
  if (level >= 7) {
    spellLevels.push(4);
  }
  
  if (level >= 9) {
    spellLevels.push(5);
  }
  
  if (level >= 11) {
    spellLevels.push(6);
  }
  
  if (level >= 13) {
    spellLevels.push(7);
  }
  
  if (level >= 15) {
    spellLevels.push(8);
  }
  
  if (level >= 17) {
    spellLevels.push(9);
  }
  
  return spellLevels;
}

/**
 * Filter spells by class and level
 */
export function filterSpellsByClassAndLevel(spells: SpellData[], className: string, level: number): SpellData[] {
  const availableLevels = calculateAvailableSpellsByClassAndLevel(className, level);
  return spells.filter(spell => {
    // Check if spell level is available
    if (!availableLevels.includes(spell.level)) {
      return false;
    }
    
    // Check if spell is available for the character's class
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    return spellClasses.some(c => 
      c.toLowerCase() === className.toLowerCase() || 
      c.toLowerCase().includes(className.toLowerCase())
    );
  });
}

/**
 * Get the maximum spell level available for a character
 */
export function getMaxSpellLevel(character: Character): number {
  const { level } = character;
  
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  if (level <= 14) return 7;
  if (level <= 16) return 8;
  return 9;
}

/**
 * Get the spellcasting ability modifier for a class
 */
export function getSpellcastingAbilityModifier(character: Character): number {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  
  // Интеллект для волшебников
  if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    return getNumericModifier(character.abilities?.INT || 10);
  }
  
  // Мудрость для жрецов, друидов и следопытов
  if (classLower.includes('жрец') || classLower.includes('cleric') || 
      classLower.includes('друид') || classLower.includes('druid') ||
      classLower.includes('следопыт') || classLower.includes('ranger')) {
    return getNumericModifier(character.abilities?.WIS || 10);
  }
  
  // Харизма для бардов, чародеев, колдунов и паладинов
  return getNumericModifier(character.abilities?.CHA || 10);
}

/**
 * Normalize spells to ensure they're all objects
 */
export function normalizeSpells(spells: (CharacterSpell | string)[]): CharacterSpell[] {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Convert string to basic spell object
      return {
        id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
        name: spell,
        level: 0,
        school: 'Универсальная'
      };
    }
    return spell;
  });
}

/**
 * Convert character spell to spell data
 */
export function convertToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    ritual: spell.ritual,
    concentration: spell.concentration,
    prepared: spell.prepared
  };
}

/**
 * Get the default casting ability for a class
 */
export function getDefaultCastingAbility(className: string): string {
  const classLower = className.toLowerCase();
  
  if (classLower.includes('волшебник') || classLower.includes('wizard')) {
    return 'intelligence';
  }
  
  if (classLower.includes('жрец') || classLower.includes('cleric') || 
      classLower.includes('друид') || classLower.includes('druid') ||
      classLower.includes('следопыт') || classLower.includes('ranger')) {
    return 'wisdom';
  }
  
  return 'charisma';
}

/**
 * Calculate spell save DC
 */
export function calculateSpellSaveDC(character: Character): number {
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return 8 + profBonus + abilityMod;
}

/**
 * Calculate spell attack bonus
 */
export function calculateSpellAttackBonus(character: Character): number {
  const abilityMod = getSpellcastingAbilityModifier(character);
  const profBonus = character.proficiencyBonus || 2;
  
  return profBonus + abilityMod;
}

/**
 * Check if character can prepare more spells
 */
export function canPrepareMoreSpells(character: Character, preparedCount: number): boolean {
  if (!character.class) return false;
  
  // Default formula: level + ability modifier
  const abilityMod = getSpellcastingAbilityModifier(character);
  const maxPrepared = character.level + abilityMod;
  
  return preparedCount < maxPrepared;
}

