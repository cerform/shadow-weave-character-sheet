
// Экспортируем все хуки и утилиты для спеллбука
export * from './useSpellbook';
export * from './filterUtils';
export * from './types';

import { useContext } from 'react';
import { SpellbookContext, SpellbookContextType } from '@/contexts/SpellbookContext';

export const useSpellbookContext = (): SpellbookContextType => {
  const context = useContext(SpellbookContext);
  if (!context) {
    throw new Error("useSpellbookContext must be used within a SpellbookProvider");
  }
  return context;
};

// Экспортируем вспомогательные функции из типов
export { 
  convertCharacterSpellToSpellData, 
  convertSpellArray, 
  convertSpellDataToCharacterSpell 
} from '@/types/spells';

// Export this function explicitly
export const useSpellbook = (): SpellbookContextType => {
  return useSpellbookContext();
};

