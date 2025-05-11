
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import { useCharacter } from '@/contexts/CharacterContext';
import { createDefaultCharacter } from '@/utils/characterUtils';

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();
  const characterContext = useCharacter();
  
  // Ensure we have default properties even if CharacterContext doesn't provide them
  const characters = characterContext.characters || [];
  
  // Use the first character if available, otherwise create a default
  const character = (characters.length > 0) ? characters[0] : createDefaultCharacter();

  return (
    <BackgroundWrapper>
      <div className="min-h-screen py-4">
        <div className="container mx-auto px-4">
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0" style={{ color: themeStyles?.textColor }}>
              Книга заклинаний D&D 5e
            </h1>
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              <NavigationButtons />
            </div>
          </header>
          
          <SpellBookViewer character={character} />
        </div>
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
