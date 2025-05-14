
// Правильно экспортируем провайдер и хук из соответствующего местоположения
import { useSpellbook, SpellbookProvider } from './spellbook';
import type { SpellbookContextType } from './types'; 

export { useSpellbook, SpellbookProvider, type SpellbookContextType };
