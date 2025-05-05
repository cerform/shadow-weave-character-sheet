
import { CharacterSpell } from '@/types/character.d';
import { SpellData, convertToSpellData } from './types';

// Filter spells by search term
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  return spells.filter(spell => {
    return (
      spell.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      (spell.description && spell.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
  });
};

// Filter spells by level
export const filterSpellsByLevel = (spells: CharacterSpell[], levels: number[]): CharacterSpell[] => {
  return spells.filter(spell => levels.includes(spell.level));
};

// Filter spells by school
export const filterSpellsBySchool = (spells: CharacterSpell[], schools: string[]): CharacterSpell[] => {
  return spells.filter(spell => {
    if (!spell.school) return false;
    return schools.includes(spell.school);
  });
};

// Filter spells by class
export const filterSpellsByClass = (spells: CharacterSpell[], classes: string[]): CharacterSpell[] => {
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    // Handle array of classes
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => {
        return classes.some(className => spellClass.includes(className));
      });
    }
    
    // Handle string of classes
    if (typeof spell.classes === 'string') {
      return classes.some(className => spell.classes && spell.classes.includes(className));
    }
    
    return false;
  });
};

// Extract unique classes from spells
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classesSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(className => {
        classesSet.add(className);
      });
    } else if (typeof spell.classes === 'string') {
      // If it's a comma-separated string, split it
      spell.classes.split(',').map(c => c.trim()).forEach(className => {
        classesSet.add(className);
      });
    }
  });
  
  return Array.from(classesSet).sort();
};

// Format classes for display
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return '';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

// Type guards
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Convert CharacterSpell to SpellData
export const convertToSpellData = (characterSpell: CharacterSpell): SpellData => {
  return {
    ...characterSpell,
    school: characterSpell.school || 'Неизвестная', // Default value for required field
    prepared: characterSpell.prepared ?? false
  };
};

// Import spells from text
export const importSpellsFromText = (text: string): CharacterSpell[] => {
  // Simple parsing logic for demonstration
  const spellBlocks = text.split('---');
  
  return spellBlocks
    .filter(block => block.trim() !== '')
    .map((block, index) => {
      // Extract name pattern
      const nameMatch = block.match(/^(.+?)(\(.+?\))?\n/);
      const name = nameMatch ? nameMatch[1].trim() : `Заклинание ${index + 1}`;
      
      // Extract level pattern
      const levelMatch = block.match(/уровень (\d+)|заговор|cantrip/i);
      const level = levelMatch ? 
        levelMatch[0].toLowerCase().includes('заговор') || levelMatch[0].toLowerCase().includes('cantrip') ? 
          0 : parseInt(levelMatch[1]) : 0;
      
      // Extract school pattern
      const schoolMatch = block.match(/школа: (.+?)$/mi);
      const school = schoolMatch ? schoolMatch[1].trim() : 'Неизвестная';
      
      // Extract other details using simplified patterns
      const castingTimeMatch = block.match(/время накладывания: (.+?)$/mi);
      const rangeMatch = block.match(/дальность: (.+?)$/mi);
      const componentsMatch = block.match(/компоненты: (.+?)$/mi);
      const durationMatch = block.match(/длительность: (.+?)$/mi);
      const classesMatch = block.match(/классы: (.+?)$/mi);
      
      // Create a spell object from extracted data
      return {
        id: index,
        name,
        level,
        school,
        castingTime: castingTimeMatch ? castingTimeMatch[1].trim() : '',
        range: rangeMatch ? rangeMatch[1].trim() : '',
        components: componentsMatch ? componentsMatch[1].trim() : '',
        duration: durationMatch ? durationMatch[1].trim() : '',
        classes: classesMatch ? classesMatch[1].split(',').map(c => c.trim()) : [],
        description: block,
        ritual: block.toLowerCase().includes('ритуал'),
        concentration: block.toLowerCase().includes('концентрация'),
        prepared: false
      };
    });
};
