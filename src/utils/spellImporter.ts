import { CharacterSpell } from '@/types/character';
import { parseComponents } from './spellProcessors';

/**
 * Функция для разбора компонентов заклинания
 */
function parseSpellComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} {
  return parseComponents(componentString);
}

/**
 * Parses a spell entry from the raw text format
 * Format: [level] name components
 * Example: [0] Брызги кислоты ВС.
 */
export const parseSpellEntry = (entry: string): {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
  };
} | null => {
  // Match pattern like [0] Name ABC
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([\w\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  return {
    name,
    level,
    components: parseSpellComponents(componentCode)
  };
};

/**
 * Batch process multiple spell entries from raw text
 */
export const processSpellEntries = (rawText: string): Array<{
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
  };
}> => {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  const results = [];
  
  for (const line of lines) {
    const parsed = parseSpellEntry(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
};

/**
 * Updates existing spell collection with component information from parsed entries
 */
export const updateSpellsWithComponents = (
  spells: CharacterSpell[], 
  parsedEntries: Array<{
    name: string;
    level: number;
    components: {
      verbal: boolean;
      somatic: boolean;
      material: boolean;
      ritual: boolean;
    };
  }>
): CharacterSpell[] => {
  const updatedSpells = [...spells];
  
  parsedEntries.forEach(entry => {
    const existingSpellIndex = updatedSpells.findIndex(s => s.name === entry.name && s.level === entry.level);
    
    if (existingSpellIndex >= 0) {
      // Update existing spell
      updatedSpells[existingSpellIndex] = {
        ...updatedSpells[existingSpellIndex],
        verbal: entry.components.verbal,
        somatic: entry.components.somatic,
        material: entry.components.material,
        ritual: entry.components.ritual
      };
    } else {
      // Could add new spell with basic info, but would need descriptions
      console.log(`Spell not found: ${entry.name} (level ${entry.level})`);
    }
  });
  
  return updatedSpells;
};
