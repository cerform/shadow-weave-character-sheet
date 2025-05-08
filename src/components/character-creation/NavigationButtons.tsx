
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
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevLabel = "Назад",
  nextLabel = "Далее",
  allowPrev = true,
  allowNext = true,
}) => {
  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline"
        onClick={onPrev}
        disabled={!onPrev || !allowPrev}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {prevLabel}
      </Button>
      <Button 
        onClick={onNext}
        disabled={!onNext || !allowNext}
        className="flex items-center"
      >
        {nextLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
