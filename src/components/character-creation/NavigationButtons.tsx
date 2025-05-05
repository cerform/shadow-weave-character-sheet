
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationButtonsProps {
  allowNext: boolean;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  nextLabel?: string;
  prevLabel?: string;
  // Добавляем поддержку disableNext как алиас для !allowNext
  disableNext?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  allowNext,
  nextStep,
  prevStep,
  isFirstStep,
  nextLabel = 'Далее',
  prevLabel = 'Назад',
  disableNext, // Добавляем, но используем его как альтернативу !allowNext
}) => {
  // Если disableNext передан, используем его, иначе !allowNext
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  
  return (
    <div className="flex justify-between mt-6">
      {!isFirstStep ? (
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {prevLabel}
        </Button>
      ) : (
        <div></div>
      )}
      <Button onClick={nextStep} disabled={isNextDisabled}>
        {nextLabel}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
