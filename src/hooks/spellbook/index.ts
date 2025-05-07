
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';
import { getSpellsByClass, getAllSpells } from '@/data/spells/index';

// Экспортируем хук для использования контекста
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};

// Экспортируем хук по умолчанию
export default useSpellbook;
