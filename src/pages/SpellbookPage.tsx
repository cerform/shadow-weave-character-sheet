
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const SpellbookPage: React.FC = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div className="min-h-screen" style={{ backgroundColor: currentTheme.cardBackground ? currentTheme.cardBackground.replace('rgba', 'rgb').replace(', 0.6)', ', 0.9)') : '#000000' }}>
      <SpellBookViewer />
    </div>
  );
};

export default SpellbookPage;
