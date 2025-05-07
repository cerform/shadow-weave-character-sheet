
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';

export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};
