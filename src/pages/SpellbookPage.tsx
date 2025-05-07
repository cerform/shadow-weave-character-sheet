
import React, { useState } from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useMediaQuery } from '@/hooks/use-media-query';

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className={`mb-6 flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start ${isMobile ? 'space-y-4' : 'sm:items-center'}`}>
            <h1 
              className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold ${!isMobile && 'mb-4 sm:mb-0'}`}
              style={{ color: themeStyles?.textColor }}
            >
              Книга заклинаний D&D 5e
            </h1>
            <div className={`flex items-center ${isMobile ? 'w-full justify-between' : 'space-x-4'}`}>
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <SpellBookViewer />
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
