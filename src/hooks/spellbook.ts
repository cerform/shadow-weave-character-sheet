
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';

// Немного расширяем хук, добавляя проверку существования контекста
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};
