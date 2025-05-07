
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

// Импортируем и реэкспортируем другие утилиты
export * from './filterUtils';
export * from './importUtils';
export * from './themeUtils';
export * from './types';
