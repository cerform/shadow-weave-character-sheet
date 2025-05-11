
import { v4 as uuidv4 } from 'uuid';
import { CharacterSpell } from '@/types/character';

export interface ImportedSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  concentration?: boolean;
  ritual?: boolean;
  classes?: string[];
  source?: string;
}

/**
 * Parse spell text and extract properties
 */
export function parseSpellText(text: string): Partial<ImportedSpell> {
  const spell: Partial<ImportedSpell> = {
    id: uuidv4(),
    classes: []
  };
  
  // Try to parse the spell name from the first line
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return {};
  }
  
  // First line should be spell name
  spell.name = lines[0];
  
  // Try to identify level and school
  const levelSchoolRegex = /(\d)(st|nd|rd|th)\s+level\s+(\w+)/i;
  const cantriplevelRegex = /(\w+)\s+cantrip/i;
  
  for (let i = 1; i < Math.min(5, lines.length); i++) {
    // Check for level and school
    const levelMatch = lines[i].match(levelSchoolRegex);
    const cantripMatch = lines[i].match(cantriplevelRegex);
    
    if (levelMatch) {
      spell.level = parseInt(levelMatch[1], 10);
      spell.school = levelMatch[3];
      continue;
    }
    
    if (cantripMatch) {
      spell.level = 0;
      spell.school = cantripMatch[1];
      continue;
    }
    
    // Check for casting time
    if (lines[i].toLowerCase().includes('casting time:')) {
      spell.castingTime = lines[i].split(':')[1]?.trim();
      continue;
    }
    
    // Check for range
    if (lines[i].toLowerCase().includes('range:')) {
      spell.range = lines[i].split(':')[1]?.trim();
      continue;
    }
    
    // Check for components
    if (lines[i].toLowerCase().includes('components:')) {
      const componentsText = lines[i].split(':')[1]?.trim();
      spell.components = componentsText;
      spell.verbal = componentsText.includes('V');
      spell.somatic = componentsText.includes('S');
      spell.material = componentsText.includes('M');
      continue;
    }
    
    // Check for duration
    if (lines[i].toLowerCase().includes('duration:')) {
      const durationText = lines[i].split(':')[1]?.trim();
      spell.duration = durationText;
      spell.concentration = durationText.toLowerCase().includes('concentration');
      continue;
    }
  }
  
  // Join remaining lines as description
  const descriptionStartIndex = Math.min(6, lines.length);
  if (descriptionStartIndex < lines.length) {
    spell.description = lines.slice(descriptionStartIndex).join('\n');
  }
  
  return spell;
}

/**
 * Import spells from text
 */
export function importSpellsFromText(text: string): CharacterSpell[] {
  // Split the text by double newlines to separate spells
  const spellTexts = text.split('\n\n\n').filter(t => t.trim().length > 0);
  
  // Parse each spell text
  return spellTexts.map(spellText => {
    const parsedSpell = parseSpellText(spellText);
    return {
      id: parsedSpell.id || uuidv4(),
      name: parsedSpell.name || 'Неизвестное заклинание',
      level: parsedSpell.level || 0,
      school: parsedSpell.school || 'Универсальная',
      castingTime: parsedSpell.castingTime || '1 действие',
      range: parsedSpell.range || 'На себя',
      components: parsedSpell.components || '',
      duration: parsedSpell.duration || 'Мгновенная',
      description: parsedSpell.description || '',
      verbal: parsedSpell.verbal || false,
      somatic: parsedSpell.somatic || false,
      material: parsedSpell.material || false,
      concentration: parsedSpell.concentration || false,
      ritual: parsedSpell.ritual || false,
      classes: parsedSpell.classes || [],
      source: parsedSpell.source || 'Импортировано'
    };
  });
}

