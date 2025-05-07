
import { useContext } from 'react';
import { SpellbookContext, useSpellbook as contextUseSpellbook } from '@/contexts/SpellbookContext';

// Экспортируем функцию для получения контекста
export const useSpellbook = contextUseSpellbook;

export default useSpellbook;
