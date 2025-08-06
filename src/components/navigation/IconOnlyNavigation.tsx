
import React from 'react';
import NavigationButtons from "@/components/ui/NavigationButtons";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const IconOnlyNavigation: React.FC = () => {
  const { theme } = useTheme();
  const currentThemeId = theme || 'default';
  const currentTheme = themes[currentThemeId as keyof typeof themes] || themes.default;
  
  return (
    <div 
      className="flex items-center gap-2 p-1 rounded-full bg-black/50 backdrop-blur-md"
      style={{ 
        border: `1px solid ${currentTheme.accent}30`,
        boxShadow: `0 0 8px ${currentTheme.accent}20`
      }}
    >
      <NavigationButtons />
    </div>
  );
};

export default IconOnlyNavigation;
