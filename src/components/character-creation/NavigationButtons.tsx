
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disablePrev?: boolean;
  disableNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevLabel = 'Назад',
  nextLabel = 'Далее',
  disablePrev = false,
  disableNext = false
}) => {
  return (
    <div className="flex justify-between gap-4">
      {onPrev && (
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={disablePrev}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {prevLabel}
        </Button>
      )}
      
      {onNext && (
        <Button
          onClick={onNext}
          disabled={disableNext}
          className="flex items-center ml-auto"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
