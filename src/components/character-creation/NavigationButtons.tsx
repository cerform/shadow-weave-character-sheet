
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavigationButtonsProps {
  prevStep?: () => void;
  nextStep?: () => void;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  allowNext?: boolean;
  isFirstStep?: boolean;
  nextText?: string;
  disableNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  nextDisabled = false,
  prevDisabled = false,
  nextLabel = "Далее",
  prevLabel = "Назад",
  allowNext,
  isFirstStep,
  nextText,
  disableNext
}) => {
  // Use the most restrictive disabled state
  const isNextDisabled = nextDisabled || (disableNext ?? false) || (allowNext === false);
  const finalNextLabel = nextText || nextLabel;

  return (
    <div className="mt-8 flex justify-between">
      {prevStep ? (
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={prevDisabled}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {prevLabel}
        </Button>
      ) : (
        <div></div>
      )}

      {nextStep && (
        <Button
          onClick={nextStep}
          disabled={isNextDisabled}
          className="flex items-center"
        >
          {finalNextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
