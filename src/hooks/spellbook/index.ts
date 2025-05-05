
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
  filterSpellsBySearchTerm as filterBySearchTerm,
  filterSpellsByLevel as filterByLevel,
  filterSpellsBySchool as filterBySchool,
  filterSpellsByClass as filterByClass
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
  filterBySearchTerm as filterSpellsBySearchTerm,
  filterByLevel as filterSpellsByLevel,
  filterBySchool as filterSpellsBySchool,
  filterByClass as filterSpellsByClass,
  importSpellsFromText,
  convertToSpellData,
  convertToCharacterSpell
};
