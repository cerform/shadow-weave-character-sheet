
import { useContext } from 'react';
import { SpellbookContext } from '@/contexts/SpellbookContext';

// Экспортируем хук для использования контекста заклинаний
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  if (!context) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  return context;
};

// Реэкспортируем хук для обеспечения обратной совместимости
export { useSpellbook as default };

// Также экспортируем другие функции из модуля spellbook
// (добавьте здесь другие экспорты при необходимости)
