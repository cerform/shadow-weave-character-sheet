
import React from 'react';
import NavigationButtons from "@/components/ui/NavigationButtons";
import ThemeSelector from "@/components/ThemeSelector";
import DiceDrawer from '@/components/dice/DiceDrawer';

interface IconOnlyNavigationProps {
  includeThemeSelector?: boolean;
}

const IconOnlyNavigation: React.FC<IconOnlyNavigationProps> = ({ includeThemeSelector = false }) => {
  return (
    <div className="flex items-center gap-2">
      <NavigationButtons />
      
      {/* Добавляем кнопку кубиков */}
      <DiceDrawer />
      
      {includeThemeSelector && (
        <ThemeSelector />
      )}
    </div>
  );
};

export default IconOnlyNavigation;
