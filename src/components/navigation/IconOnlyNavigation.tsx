
import React from 'react';
import NavigationButtons from "@/components/ui/NavigationButtons";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Users, UserPlus } from 'lucide-react';

interface IconOnlyNavigationProps {
  includeThemeSelector?: boolean;
}

const IconOnlyNavigation: React.FC<IconOnlyNavigationProps> = ({ includeThemeSelector = false }) => {
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
      
      {includeThemeSelector && (
        <ThemeSelector />
      )}
    </div>
  );
};

// Добавляем новые элементы навигации в NavigationButtons.tsx
// Этот компонент должен добавить следующие элементы:
// {
//   icon: <Users className="h-5 w-5" />,
//   label: "Вести игру",
//   href: "/dm-session",
// },
// {
//   icon: <UserPlus className="h-5 w-5" />,
//   label: "Присоединиться",
//   href: "/join-game",
// },

export default IconOnlyNavigation;
