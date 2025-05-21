
import { Character } from '@/types/character';

export const normalizeCharacterData = (character: Character): Character => {
  // Create a copy to avoid mutating the original
  const normalized: Character = { ...character };

  // Ensure basic required fields
  if (!normalized.name) {
    normalized.name = 'Новый персонаж';
  }
  
  if (!normalized.level) {
    normalized.level = 1;
  }
  
  // Normalize abilities
  if (!normalized.abilities) {
    normalized.abilities = {
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
      charisma: 10
    };
  }
  
  // Set aliases if only one format exists
  if (normalized.abilities && !normalized.stats) {
    normalized.stats = {
      strength: normalized.abilities.STR,
      dexterity: normalized.abilities.DEX,
      constitution: normalized.abilities.CON,
      intelligence: normalized.abilities.INT,
      wisdom: normalized.abilities.WIS,
      charisma: normalized.abilities.CHA
    };
  }
  
  // Normalize proficiencies
  if (!normalized.proficiencies) {
    normalized.proficiencies = {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    };
  } else if (Array.isArray(normalized.proficiencies)) {
    // Convert array format to object format
    const profArray = normalized.proficiencies;
    normalized.proficiencies = {
      languages: profArray.filter(p => p.startsWith('language:')).map(p => p.replace('language:', '')),
      tools: profArray.filter(p => p.startsWith('tool:')).map(p => p.replace('tool:', '')),
      weapons: profArray.filter(p => p.startsWith('weapon:')).map(p => p.replace('weapon:', '')),
      armor: profArray.filter(p => p.startsWith('armor:')).map(p => p.replace('armor:', '')),
      skills: profArray.filter(p => p.startsWith('skill:')).map(p => p.replace('skill:', ''))
    };
  }
  
  // Normalize HP fields
  if (normalized.maxHp !== undefined && normalized.hitPoints === undefined) {
    normalized.hitPoints = {
      maximum: normalized.maxHp,
      current: normalized.currentHp || normalized.maxHp,
      temporary: normalized.tempHp || normalized.temporaryHp || 0
    };
  }
  
  // Normalize skills
  if (!normalized.skills) {
    normalized.skills = {};
  }
  
  // Normalize spells
  if (normalized.spells) {
    // Convert any string spells to CharacterSpell objects
    normalized.spells = normalized.spells.map(spell => {
      if (typeof spell === 'string') {
        return {
          name: spell,
          level: 0, // Default to cantrip
          prepared: true
        };
      }
      return spell;
    });
  } else {
    normalized.spells = [];
  }
  
  // Normalize equipment
  if (!normalized.equipment) {
    normalized.equipment = [];
  }
  
  // Ensure features is an array
  if (!normalized.features) {
    normalized.features = [];
  }
  
  return normalized;
};
