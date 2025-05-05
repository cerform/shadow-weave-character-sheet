
import React from 'react';
import SpellBookViewer from '@/components/spellbook/SpellBookViewer';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useUserTheme } from '@/hooks/use-user-theme';
import ThemeSelector from '@/components/character-sheet/ThemeSelector';

const SpellbookPage: React.FC = () => {
  const { theme } = useTheme();
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  return (
    <div 
      className="min-h-screen py-4" 
      style={{ 
        background: `#1a1625 url('/lovable-uploads/bef7b237-52d0-418d-8066-74fcaa844269.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: currentTheme.textColor
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold" style={{color: currentTheme.textColor}}>
            Книга заклинаний
          </h1>
          <ThemeSelector />
        </div>
        <SpellBookViewer />
      </div>
    </div>
  );
};

export default SpellbookPage;
