
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';

const SpellbookPage: React.FC = () => {
  const { themeStyles } = useTheme();

  return (
    <BackgroundWrapper>
      <SpellBookViewer />
      <FloatingDiceButton />
    </BackgroundWrapper>
  );
};

export default SpellbookPage;
