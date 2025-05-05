
import { CharacterSpell } from '@/types/character.d';
import { SpellData } from './types';

// We'll rename the imported function to avoid name conflicts
import { convertToSpellData as importedConvertToSpellData } from './types';

// Helper functions for filtering spells
export const filterSpellsBySearchTerm = (spells: CharacterSpell[], searchTerm: string): CharacterSpell[] => {
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  return spells.filter(spell => 
    spell.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    (spell.description && spell.description.toLowerCase().includes(lowerCaseSearchTerm))
  );
};

export const filterSpellsByLevel = (spells: CharacterSpell[], levels: number[]): CharacterSpell[] => {
  return spells.filter(spell => levels.includes(spell.level));
};

export const filterSpellsBySchool = (spells: CharacterSpell[], schools: string[]): CharacterSpell[] => {
  return spells.filter(spell => spell.school && schools.includes(spell.school));
};

export const filterSpellsByClass = (spells: CharacterSpell[], classes: string[]): CharacterSpell[] => {
  return spells.filter(spell => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(c => 
        classes.some(cls => c.toLowerCase().includes(cls.toLowerCase()))
      );
    }
    
    if (typeof spell.classes === 'string') {
      return classes.some(cls => spell.classes?.toLowerCase().includes(cls.toLowerCase()));
    }
    
    return false;
  });
};

// Type checking helpers
export const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Extract unique classes from spells
export const extractClasses = (spells: CharacterSpell[]): string[] => {
  const classSet = new Set<string>();
  
  spells.forEach(spell => {
    if (!spell.classes) return;
    
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(c => classSet.add(c));
    } else if (typeof spell.classes === 'string') {
      // Split by comma and trim
      spell.classes.split(',').forEach(c => classSet.add(c.trim()));
    }
  });
  
  return Array.from(classSet).sort();
};

// Format classes for display
export const formatClasses = (classes: string[] | string | undefined): string => {
  if (!classes) return 'Нет данных';
  
  if (Array.isArray(classes)) {
    return classes.join(', ');
  }
  
  return classes;
};

// Create our local version of convertToSpellData that ensures school is always present
export const convertToSpellData = (characterSpell: CharacterSpell): SpellData => {
  return {
    ...characterSpell,
    school: characterSpell.school || 'Неизвестная', // Provide a default value for required field
    prepared: characterSpell.prepared || false
  };
};

// Helper function to convert CharacterSpell array to SpellData array
export const convertCharacterSpellsToSpellData = (characterSpells: CharacterSpell[]): SpellData[] => {
  return characterSpells.map(spell => convertToSpellData(spell));
};
