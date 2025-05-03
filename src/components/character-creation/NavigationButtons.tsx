
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext?: boolean;
  isFirstStep?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  disableNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext = true,
  isFirstStep = false,
  nextLabel = "Далее",
  prevLabel = "Назад",
  disableNext = false
}) => {
  return (
    <div className="flex justify-between mt-6">
      {!isFirstStep && (
        <Button 
          variant="outline" 
          onClick={prevStep}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> {prevLabel}
        </Button>
      )}
      
      <div className={`${isFirstStep ? 'ml-auto' : ''}`}>
        <Button 
          onClick={nextStep}
          disabled={!allowNext || disableNext}
          className="gap-2"
        >
          {nextLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NavigationButtons;
