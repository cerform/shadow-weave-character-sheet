
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';
import HomeButton from '@/components/navigation/HomeButton';
import { useUserTheme } from '@/hooks/use-user-theme';
import { themes } from '@/lib/themes';

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext: boolean;
  isFirstStep?: boolean;
  hideNextButton?: boolean;
  disableNext?: boolean; 
  nextLabel?: string;
  isLastStep?: boolean;
  onSave?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext,
  isFirstStep = false,
  hideNextButton = false,
  disableNext,
  nextLabel = "Далее",
  isLastStep = false,
  onSave
}) => {
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const buttonStyle = {
    '--theme-accent-rgb': currentTheme.accent.replace('#', '').match(/.{2}/g)?.map(hex => parseInt(hex, 16)).join(',')
  } as React.CSSProperties;
  
  const handlePrevStep = () => {
    if (!isFirstStep) {
      prevStep();
    }
  };

  const handleNextOrSave = () => {
    if (isLastStep && onSave) {
      onSave();
    } else {
      nextStep();
    }
  };
  
  return (
    <div className="flex justify-between pt-8 mt-2">
      {isFirstStep ? (
        <HomeButton variant="outline" className="bg-black/70 text-white hover:bg-gray-800 border-gray-700 hover:border-gray-500" />
      ) : (
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          className="flex items-center gap-2 px-4 py-2 bg-black/70 text-white hover:bg-gray-800 border-gray-700 hover:border-gray-500 hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]"
          style={buttonStyle}
        >
          <ArrowLeft className="size-4" />
          {!isMobile && <span>Назад</span>}
        </Button>
      )}
      
      {!hideNextButton && (
        <Button 
          variant="default" 
          onClick={handleNextOrSave}
          disabled={isNextDisabled}
          className={`
            flex items-center gap-2 px-4 py-2
            ${isNextDisabled 
              ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
              : isLastStep
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'}
            hover:shadow-[0_0_12px_rgba(var(--theme-accent-rgb),0.6)]
          `}
          style={buttonStyle}
        >
          {!isMobile && <span>{isLastStep ? "Сохранить персонажа" : nextLabel}</span>}
          {isLastStep ? (
            <Save className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
