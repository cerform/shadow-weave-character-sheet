
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';

export const useSpellbook = () => useContext(SpellbookContext);
