
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext: boolean;
  isFirstStep?: boolean;
  hideNextButton?: boolean;
  disableNext?: boolean; 
  nextLabel?: string;
  isLastStep?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext,
  isFirstStep = false,
  hideNextButton = false,
  disableNext,
  nextLabel = "Далее",
  isLastStep = false
}) => {
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  const deviceType = useDeviceType();
  const isMobile = deviceType === "mobile";
  
  // Упрощенные обработчики для навигации
  const handlePrevStep = () => {
    if (!isFirstStep) {
      prevStep();
    }
  };
  
  const handleNextStep = () => {
    if (!isNextDisabled) {
      nextStep();
    }
  };
  
  return (
    <div className="flex justify-between pt-8 mt-2">
      <Button 
        variant="outline" 
        onClick={handlePrevStep}
        disabled={isFirstStep}
        className={`
          flex items-center gap-2 px-4 py-2 
          ${isFirstStep 
            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
            : 'bg-black/70 text-white hover:bg-gray-800 border-gray-700 hover:border-gray-500'}
        `}
      >
        <ArrowLeft className="size-4" />
        {!isMobile && "Назад"}
      </Button>
      
      {!hideNextButton && (
        <Button 
          variant="default" 
          onClick={handleNextStep}
          disabled={isNextDisabled}
          className={`
            flex items-center gap-2 px-4 py-2
            ${isNextDisabled 
              ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
              : isLastStep
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'}
          `}
        >
          {!isMobile && nextLabel}
          {isLastStep ? <CheckCircle className="size-4" /> : <ArrowRight className="size-4" />}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
