
import React from 'react';
import { SpellbookProvider } from '@/contexts/SpellbookContext';

interface SpellProviderProps {
  children: React.ReactNode;
}

const SpellProvider: React.FC<SpellProviderProps> = ({ children }) => {
  return <SpellbookProvider>{children}</SpellbookProvider>;
};

export default SpellProvider;
