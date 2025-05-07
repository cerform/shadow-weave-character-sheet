
import { useContext } from 'react';
import { SpellbookContext, SpellbookContextType } from '@/contexts/SpellbookContext';

export const useSpellbook = (): SpellbookContextType => {
  const context = useContext(SpellbookContext);
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};
