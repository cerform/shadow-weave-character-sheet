
import React from 'react';
import { Button } from "@/components/ui/button";

export interface NavigationButtonsProps {
  prevStep: () => void;
  nextStep: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disableNext?: boolean;
  allowNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  prevLabel = "Назад",
  nextLabel = "Далее",
  disableNext = false,
  allowNext = true
}) => {
  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline" 
        onClick={prevStep}
      >
        {prevLabel}
      </Button>
      <Button 
        onClick={nextStep}
        disabled={disableNext || !allowNext}
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default NavigationButtons;
