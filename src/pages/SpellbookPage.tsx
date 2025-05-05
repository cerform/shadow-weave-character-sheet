
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import ThemeSelector from '@/components/ThemeSelector';
import NavigationButtons from '@/components/ui/NavigationButtons';

const SpellbookPage: React.FC = () => {
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  return (
    <div 
      className="min-h-screen py-4" 
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
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
    </div>
  );
};

export default SpellbookPage;
