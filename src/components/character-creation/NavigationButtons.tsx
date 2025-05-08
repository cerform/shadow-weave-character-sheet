
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  allowPrev?: boolean;
  allowNext?: boolean;
  // Add these properties for compatibility with existing components
  nextStep?: () => void;
  prevStep?: () => void;
  isFirstStep?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevLabel = "Назад",
  nextLabel = "Далее",
  allowPrev = true,
  allowNext = true,
  // Use the passed props or fallback to onPrev/onNext
  nextStep,
  prevStep,
  isFirstStep,
}) => {
  // Use either the direct handlers or the step handlers
  const handlePrev = prevStep || onPrev;
  const handleNext = nextStep || onNext;

  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline"
        onClick={handlePrev}
        disabled={!handlePrev || !allowPrev || isFirstStep}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {prevLabel}
      </Button>
      <Button 
        onClick={handleNext}
        disabled={!handleNext || !allowNext}
        className="flex items-center"
      >
        {nextLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
