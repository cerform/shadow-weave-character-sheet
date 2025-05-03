
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useDeviceType } from '@/hooks/use-mobile';

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext: boolean;
  isFirstStep?: boolean;
  hideNextButton?: boolean;
  disableNext?: boolean; 
  nextLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext,
  isFirstStep = false,
  hideNextButton = false,
  disableNext,
  nextLabel = "Далее"
}) => {
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  const { isMobile } = useDeviceType() === "mobile";
  
  return (
    <div className="flex justify-between pt-6">
      <Button 
        variant="outline" 
        onClick={prevStep}
        disabled={isFirstStep}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="size-4" />
        {!isMobile && "Назад"}
      </Button>
      
      {!hideNextButton && (
        <Button 
          variant="default" 
          onClick={nextStep}
          disabled={isNextDisabled}
          className="flex items-center gap-2"
        >
          {!isMobile && nextLabel}
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
