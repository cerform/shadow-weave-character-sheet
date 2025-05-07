
import React, { useEffect } from 'react';
import { SpellbookProvider, useSpellbook } from '@/contexts/SpellbookContext';
import { getAllSpells } from '@/data/spells/index';

interface SpellProviderProps {
  children: React.ReactNode;
}

// Компонент-обертка для инициализации заклинаний
const SpellProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { spells, setSpells, setFilteredSpells, setIsLoading } = useSpellbook();
  
  useEffect(() => {
    const loadSpells = async () => {
      setIsLoading(true);
      try {
        // Получаем все заклинания из файлов
        const allSpells = getAllSpells();
        console.log('Загружено заклинаний:', allSpells.length);
        
        // Устанавливаем заклинания в контекст
        setSpells(allSpells);
        setFilteredSpells(allSpells);
      } catch (error) {
        console.error('Ошибка загрузки заклинаний:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Если заклинания еще не загружены, загружаем их
    if (spells.length === 0) {
      loadSpells();
    }
  }, [spells.length, setSpells, setFilteredSpells, setIsLoading]);
  
  return <>{children}</>;
};

const SpellProvider: React.FC<SpellProviderProps> = ({ children }) => {
  return (
    <SpellbookProvider>
      <SpellProviderContent>
        {children}
      </SpellProviderContent>
    </SpellbookProvider>
  );
};

export default SpellProvider;
