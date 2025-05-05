
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

const SpellbookPage: React.FC = () => {
  const { theme, themeStyles } = useTheme();

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end space-x-2 mb-4">
          <NavigationButtons />
          <ThemeSelector />
        </div>
        <SpellBookViewer />
      </div>
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
