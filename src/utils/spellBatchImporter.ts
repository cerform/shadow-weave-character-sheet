
import { CharacterSpell } from '@/types/character';
import { extractSpellDetailsFromText, generateSpellId } from './spellHelpers';

/**
 * Import spells from text
 * Format should be blocks of text separated by double newlines
 */
export function importSpellsFromText(rawText: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] {
  // Split text by double newline to separate spell entries
  const spellBlocks = rawText.split(/\n\s*\n/)
    .filter(block => block.trim().length > 0);
  
  if (spellBlocks.length === 0) {
    return existingSpells;
  }
  
  const existingNames = new Set(existingSpells.map(spell => 
    typeof spell === 'string' ? spell : spell.name.toLowerCase()
  ));
  
  const newSpells: CharacterSpell[] = [];
  
  // Process each spell block
  spellBlocks.forEach(block => {
    const spellDetails = extractSpellDetailsFromText(block);
    
    // Skip if this spell already exists
    if (spellDetails.name && !existingNames.has(spellDetails.name.toLowerCase())) {
      // Create a valid CharacterSpell object
      const spell: CharacterSpell = {
        id: generateSpellId(spellDetails.name),
        name: spellDetails.name,
        level: spellDetails.level || 0,
        school: spellDetails.school || 'Универсальная',
        castingTime: spellDetails.castingTime || '1 действие',
        range: spellDetails.range || 'На себя',
        components: spellDetails.components || '',
        duration: spellDetails.duration || 'Мгновенная',
        description: spellDetails.description || '',
        prepared: false
      };
      
      newSpells.push(spell);
      existingNames.add(spell.name.toLowerCase());
    }
  });
  
  // Combine existing spells with new ones
  const combinedSpells = [...existingSpells, ...newSpells];
  
  // Sort by level and then by name
  return combinedSpells.sort((a, b) => {
    const levelA = typeof a === 'string' ? 0 : a.level || 0;
    const levelB = typeof b === 'string' ? 0 : b.level || 0;
    
    if (levelA !== levelB) return levelA - levelB;
    
    const nameA = typeof a === 'string' ? a : a.name;
    const nameB = typeof b === 'string' ? b : b.name;
    
    return nameA.localeCompare(nameB);
  });
}

/**
 * Process a batch of spells from text
 */
export function processSpellBatch(text: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] {
  return importSpellsFromText(text, existingSpells);
}

/**
 * Parse a single spell entry
 */
export function parseSpellEntry(text: string): CharacterSpell | null {
  const spellDetails = extractSpellDetailsFromText(text);
  
  if (!spellDetails.name) {
    return null;
  }
  
  return {
    id: generateSpellId(spellDetails.name),
    name: spellDetails.name,
    level: spellDetails.level || 0,
    school: spellDetails.school || 'Универсальная',
    castingTime: spellDetails.castingTime || '1 действие',
    range: spellDetails.range || 'На себя',
    components: spellDetails.components || '',
    duration: spellDetails.duration || 'Мгновенная',
    description: spellDetails.description || '',
    prepared: false
  };
}
