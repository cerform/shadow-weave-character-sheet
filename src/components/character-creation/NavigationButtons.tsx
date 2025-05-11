
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavigationButtonsProps {
  prevStep?: () => void;
  nextStep?: () => void;
  disableNext?: boolean;
  disablePrev?: boolean;
  nextText?: string;
  prevText?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  disableNext = false,
  disablePrev = false,
  nextText = "Далее",
  prevText = "Назад"
}) => {
  return (
    <div className="flex justify-between mt-6">
      {prevStep ? (
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={disablePrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {prevText}
        </Button>
      ) : (
        <div></div>
      )}

      {nextStep && (
        <Button
          onClick={nextStep}
          disabled={disableNext}
          className="flex items-center gap-2"
        >
          {nextText}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
