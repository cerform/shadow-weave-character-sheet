
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';

// Хук для использования контекста заклинаний с проверкой
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};
