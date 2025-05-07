
import { useContext } from 'react';
import { SpellbookContext, SpellbookContextType } from '@/contexts/SpellbookContext';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { UseSpellbookReturn } from './types';

// Direct use of the Spellbook context
export const useSpellbookContext = (): SpellbookContextType => {
  const context = useContext(SpellbookContext);
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};

// This is a custom hook that extends the base context with additional functionality
export const useSpellbook = (): SpellbookContextType => {
  return useSpellbookContext();
};
