
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext: boolean;
  isFirstStep?: boolean;
  hideNextButton?: boolean;
  disableNext?: boolean; // Добавляем свойство disableNext
  nextLabel?: string; // Добавляем свойство nextLabel
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext,
  isFirstStep = false,
  hideNextButton = false,
  disableNext, // Добавляем новые параметры
  nextLabel = "Далее" // Добавляем со значением по умолчанию
}) => {
  // Используем либо disableNext, либо !allowNext для определения состояния кнопки
  const isNextDisabled = disableNext !== undefined ? disableNext : !allowNext;
  
  return (
    <div className="flex justify-between pt-6">
      <Button 
        variant="outline" 
        onClick={prevStep}
        disabled={isFirstStep}
      >
        Назад
      </Button>
      
      {!hideNextButton && (
        <Button 
          variant="default" 
          onClick={nextStep}
          disabled={isNextDisabled}
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
