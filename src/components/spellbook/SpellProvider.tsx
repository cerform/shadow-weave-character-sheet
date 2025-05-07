
import React from 'react';
import { SpellbookProvider } from '@/contexts/SpellbookContext';

interface SpellProviderProps {
  children: React.ReactNode;
}

// Этот компонент будет использоваться как поставщик контекста заклинаний
const SpellProvider: React.FC<SpellProviderProps> = ({ children }) => {
  return <SpellbookProvider>{children}</SpellbookProvider>;
};

export default SpellProvider;
