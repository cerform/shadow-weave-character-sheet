
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  allowNext: boolean;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  nextLabel?: string;
  prevLabel?: string;
  disableNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  allowNext,
  nextStep,
  prevStep,
  isFirstStep,
  nextLabel = 'Далее',
  prevLabel = 'Назад',
  disableNext,
}) => {
  // Если disableNext передан, используем его, иначе !allowNext
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  
  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;
  
  return (
    <div className="flex justify-between mt-6">
      {!isFirstStep ? (
        <Button 
          variant="outline" 
          onClick={prevStep}
          style={{ 
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {prevLabel}
        </Button>
      ) : (
        <div></div>
      )}
      <Button 
        onClick={nextStep} 
        disabled={isNextDisabled}
        style={{ 
          backgroundColor: currentTheme.accent,
          color: '#FFFFFF'
        }}
      >
        {nextLabel}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
