
import { SpellData, SpellFilter } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpells, filterSpells } from '@/data/spells';
import { useContext } from 'react';
import { SpellbookContext, useSpellbook as useContextSpellbook } from '@/contexts/SpellbookContext';

// Re-export the useSpellbook hook from SpellbookContext
export { useSpellbook } from '@/contexts/SpellbookContext';

// This function remains for backward compatibility
export function useSpellbookManager() {
  // Use basic functionality from the context
  const context = useContextSpellbook();

  return {
    spells: context.spells,
    filteredSpells: context.filteredSpells,
    filter: context.filters,
    setFilter: context.setFilters,
    loading: context.loading
  };
}

export default useSpellbookManager;
