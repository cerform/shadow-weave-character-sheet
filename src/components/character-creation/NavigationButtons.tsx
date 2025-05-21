
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  showPrev?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
  allowNext?: boolean;
  isFirstStep?: boolean;
  nextStep?: () => void;
  prevStep?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevLabel = "Назад",
  nextLabel = "Далее",
  showPrev = true,
  showNext = true,
  nextDisabled = false,
  allowNext,
  isFirstStep,
  nextStep,
  prevStep
}) => {
  // Используем переданные обработчики или резервные
  const handlePrev = prevStep || onPrev;
  const handleNext = nextStep || onNext;
  
  // Проверяем, должна ли кнопка "Далее" быть отключена
  const isNextDisabled = nextDisabled || (allowNext !== undefined && !allowNext);
  
  return (
    <div className="flex justify-between mt-6">
      {showPrev ? (
        <Button
          variant="outline"
          onClick={handlePrev}
          className="flex items-center"
          disabled={isFirstStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {prevLabel}
        </Button>
      ) : (
        <div></div>
      )}

      {showNext && (
        <Button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex items-center"
        >
          {nextLabel}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
