
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  prevStep?: () => void;
  nextStep?: () => void;
  nextDisabled?: boolean;
  prevDisabled?: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  nextDisabled = false,
  prevDisabled = false,
  nextLabel = "Далее",
  prevLabel = "Назад"
}) => {
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
          disabled={nextDisabled}
          className="flex items-center"
        >
          {nextLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
