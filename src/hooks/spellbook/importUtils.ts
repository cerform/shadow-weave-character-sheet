
import { SpellData } from '@/types/spells';
import { parseComponents } from '@/utils/spellProcessors';

/**
 * Converts spell data from an imported format to the application format
 */
export const convertImportedSpell = (importedSpell: any): SpellData | null => {
  // Basic validation
  if (!importedSpell.name || typeof importedSpell.level !== 'number') {
    console.error('Invalid spell data:', importedSpell);
    return null;
  }

  // Create a spell with required fields
  const spell: SpellData = {
    id: importedSpell.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: importedSpell.name,
    level: importedSpell.level,
    school: importedSpell.school || 'Универсальная',
    castingTime: importedSpell.castingTime || '1 действие',
    range: importedSpell.range || 'На себя',
    components: importedSpell.components || '',
    duration: importedSpell.duration || 'Мгновенная',
    description: importedSpell.description || '',
  };

  // Optional fields
  if (importedSpell.classes) {
    spell.classes = importedSpell.classes;
  }

  if (importedSpell.source) {
    spell.source = importedSpell.source;
  }

  // Component flags
  if (importedSpell.components) {
    const components = parseComponents(importedSpell.components);
    spell.verbal = components.verbal;
    spell.somatic = components.somatic;
    spell.material = components.material;
    spell.ritual = components.ritual;
  }

  // Handle components separately from raw string
  if (importedSpell.verbal !== undefined) spell.verbal = importedSpell.verbal;
  if (importedSpell.somatic !== undefined) spell.somatic = importedSpell.somatic;
  if (importedSpell.material !== undefined) spell.material = importedSpell.material;
  if (importedSpell.ritual !== undefined) spell.ritual = importedSpell.ritual;
  if (importedSpell.concentration !== undefined) spell.concentration = importedSpell.concentration;
  
  // Handle material component description
  if (importedSpell.materials !== undefined) {
    spell.materials = importedSpell.materials;
  }
  
  // Handle higher level description
  if (importedSpell.higherLevels) {
    spell.higherLevels = importedSpell.higherLevels;
  } else if (importedSpell.higherLevel) {
    spell.higherLevels = importedSpell.higherLevel;
  }

  return spell;
};

/**
 * Processes an array of imported spell data
 */
export const processImportedSpells = (importedData: any): SpellData[] => {
  // Check if the data is an array
  if (!Array.isArray(importedData)) {
    if (typeof importedData === 'object' && importedData !== null) {
      // If it's an object, try to extract any array properties
      for (const key in importedData) {
        if (Array.isArray(importedData[key])) {
          importedData = importedData[key];
          break;
        }
      }
    }
    
    // If still not an array, wrap it in an array if it's an object
    if (!Array.isArray(importedData) && typeof importedData === 'object') {
      importedData = [importedData];
    } else if (!Array.isArray(importedData)) {
      console.error('Invalid import data format:', importedData);
      return [];
    }
  }
  
  // Process each spell
  const processedSpells = importedData
    .map(spell => convertImportedSpell(spell))
    .filter((spell): spell is SpellData => spell !== null);
  
  return processedSpells;
};

/**
 * Parse JSON from a string with error handling
 */
export const safeParseJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

/**
 * Validate spell data structure
 */
export const validateSpellData = (spell: any): boolean => {
  return (
    spell && 
    typeof spell === 'object' && 
    typeof spell.name === 'string' && 
    (typeof spell.level === 'number' || typeof spell.level === 'string')
  );
};
