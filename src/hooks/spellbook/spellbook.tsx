
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SpellData, SpellFilters } from '@/types/spells';
import { useSpellbook as useSpellbookHook } from './useSpellbook';

// Тип контекста книги заклинаний
type SpellbookContextType = ReturnType<typeof useSpellbookHook> & {
  // Можно добавить дополнительные свойства для контекста, если нужно
};

// Создаем контекст с безопасными дефолтными значениями
const SpellbookContext = createContext<SpellbookContextType | undefined>(undefined);

// Провайдер для книги заклинаний
export const SpellbookProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Используем хук для управления состоянием книги заклинаний
  const spellbookHook = useSpellbookHook();

  return (
    <SpellbookContext.Provider value={spellbookHook}>
      {children}
    </SpellbookContext.Provider>
  );
};

// Хук для использования контекста книги заклинаний
export const useSpellbook = () => {
  const context = useContext(SpellbookContext);
  
  if (context === undefined) {
    throw new Error('useSpellbook must be used within a SpellbookProvider');
  }
  
  return context;
};
