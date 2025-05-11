
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavigationButtonsProps {
  onPrev?: () => void;
  onNext?: () => void;
  prevStep?: () => void;
  nextStep?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disablePrev?: boolean;
  disableNext?: boolean;
  allowNext?: boolean;
  isFirstStep?: boolean;
  currentStep?: number;
  totalSteps?: number;
  saveCharacter?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onPrev,
  onNext,
  prevStep,
  nextStep,
  prevLabel = 'Назад',
  nextLabel = 'Далее',
  disablePrev = false,
  disableNext = false,
  allowNext = true,
  currentStep,
  totalSteps,
  saveCharacter,
  isFirstStep
}) => {
  // Используем onPrev или prevStep, в зависимости от того, что передано
  const handlePrev = onPrev || prevStep;
  // Используем onNext или nextStep, в зависимости от того, что передано
  const handleNext = onNext || nextStep;
  
  // Определяем отключение кнопки "Далее" на основе disableNext или !allowNext
  const isNextDisabled = disableNext || !allowNext;

  return (
    <div className="flex justify-between gap-4">
      {handlePrev && (
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={disablePrev}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {prevLabel}
        </Button>
      )}
      
      {handleNext && (
        <Button
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex items-center ml-auto"
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      )}
      
      {saveCharacter && currentStep === totalSteps && (
        <Button
          onClick={saveCharacter}
          className="flex items-center ml-2"
        >
          Сохранить персонажа
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
