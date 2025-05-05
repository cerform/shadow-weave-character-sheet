
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';

const SpellbookPage: React.FC = () => {
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  return (
    <div 
      className="min-h-screen py-4" 
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/91719f56-2b3a-49c7-904f-35af06f9d3b3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        color: currentTheme.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-end space-x-2 mb-4">
          <NavigationButtons />
          <ThemeSelector />
        </div>
        <SpellBookViewer />
      </div>
      <FloatingDiceButton />
    </div>
  );
};

export default SpellbookPage;
