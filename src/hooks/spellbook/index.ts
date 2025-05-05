
// Re-export everything from the module
export * from './filterUtils';
export * from './types';
export * from './importUtils';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { SpellData } from './types';
import { CharacterSpell } from '@/types/character.d';
import { 
  getAllLevels, 
  getAllSchools, 
  getAllClasses, 
  getBadgeColorByLevel,
  getSchoolBadgeColor,
  formatClassesString,
  filterSpellsBySearchTerm,
  filterSpellsByLevel,
  filterSpellsBySchool,
  filterSpellsByClass
} from './filterUtils';
import { importSpellsFromText } from './importUtils';
import { convertToSpellData, convertToCharacterSpell } from './types';

// Export everything from this module
export {
  getAllLevels,
  getAllSchools,
  getAllClasses,
  getBadgeColorByLevel,
  getSchoolBadgeColor,
  formatClassesString,
  filterSpellsBySearchTerm,
  filterSpellsByLevel,
  filterSpellsBySchool,
  filterSpellsByClass,
  importSpellsFromText,
  convertToSpellData,
  convertToCharacterSpell
};
