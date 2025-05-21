
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells'; 
import { parseComponents } from '@/utils/spellProcessors';

// Helper function to parse spell text into CharacterSpell objects
export const parseSpellText = (text: string): CharacterSpell[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const spells: CharacterSpell[] = [];
  let currentSpell: Partial<CharacterSpell> = {};
  
  for (const line of lines) {
    // Check if this is a new spell name line
    if (line.match(/^[A-Za-zА-Яа-я\s]+$/)) {
      // Save the previous spell if it exists
      if (currentSpell.name) {
        spells.push(currentSpell as CharacterSpell);
      }
      
      // Start a new spell
      currentSpell = {
        name: line.trim(),
        id: `spell-${line.trim().toLowerCase().replace(/\s+/g, '-')}`,
        prepared: true
      };
    }
    // Level and school line (e.g., "1st-level Evocation")
    else if (line.match(/(\d)(?:st|nd|rd|th)?(?:-| )level/i)) {
      const levelMatch = line.match(/(\d)/);
      if (levelMatch) {
        currentSpell.level = parseInt(levelMatch[1], 10);
      }
      
      // Extract school
      const schoolMatch = line.match(/level\s+([A-Za-zА-Яа-я]+)/i);
      if (schoolMatch) {
        currentSpell.school = schoolMatch[1];
      }
    }
    // Cantrip line
    else if (line.toLowerCase().includes('cantrip')) {
      currentSpell.level = 0;
      const schoolMatch = line.match(/([A-Za-zА-Яа-я]+)\s+cantrip/i);
      if (schoolMatch) {
        currentSpell.school = schoolMatch[1];
      }
    }
    // Casting time
    else if (line.toLowerCase().includes('casting time:')) {
      const castingMatch = line.match(/casting time:\s*(.+)/i);
      if (castingMatch) {
        currentSpell.castingTime = castingMatch[1].trim();
      }
    }
    // Range
    else if (line.toLowerCase().includes('range:')) {
      const rangeMatch = line.match(/range:\s*(.+)/i);
      if (rangeMatch) {
        currentSpell.range = rangeMatch[1].trim();
      }
    }
    // Components
    else if (line.toLowerCase().includes('components:')) {
      const componentsMatch = line.match(/components:\s*(.+)/i);
      if (componentsMatch) {
        currentSpell.components = componentsMatch[1].trim();
        // Parse components if needed
        const parsed = parseComponents(currentSpell.components);
        currentSpell.verbal = parsed.verbal;
        currentSpell.somatic = parsed.somatic;
        currentSpell.material = parsed.material;
        currentSpell.materials = parsed.materials;
      }
    }
    // Duration
    else if (line.toLowerCase().includes('duration:')) {
      const durationMatch = line.match(/duration:\s*(.+)/i);
      if (durationMatch) {
        const duration = durationMatch[1].trim();
        currentSpell.duration = duration;
        currentSpell.concentration = duration.toLowerCase().includes('concentration');
      }
    }
    // Classes
    else if (line.toLowerCase().includes('classes:') || line.toLowerCase().includes('class:')) {
      const classesMatch = line.match(/class(?:es)?:\s*(.+)/i);
      if (classesMatch) {
        currentSpell.classes = classesMatch[1].trim().split(/,\s*/);
      }
    }
    // Everything else is part of the description
    else {
      if (!currentSpell.description) {
        currentSpell.description = line.trim();
      } else if (typeof currentSpell.description === 'string') {
        currentSpell.description += '\n' + line.trim();
      }
    }
  }
  
  // Add the last spell if it exists
  if (currentSpell.name) {
    spells.push(currentSpell as CharacterSpell);
  }
  
  return spells;
};

// Convert CharacterSpell[] to SpellData[]
export const convertToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => ({
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    prepared: spell.prepared || false
  }));
};
