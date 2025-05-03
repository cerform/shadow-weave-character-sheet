
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  nextStep: () => void;
  prevStep: () => void;
  allowNext: boolean;
  isFirstStep?: boolean;
  hideNextButton?: boolean; // Добавляем свойство hideNextButton
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  nextStep,
  prevStep,
  allowNext,
  isFirstStep = false,
  hideNextButton = false // Устанавливаем значение по умолчанию
}) => {
  return (
    <div className="flex justify-between pt-6">
      <Button 
        variant="outline" 
        onClick={prevStep}
        disabled={isFirstStep}
      >
        Назад
      </Button>
      
      {!hideNextButton && ( // Проверяем, нужно ли скрыть кнопку "Далее"
        <Button 
          variant="default" 
          onClick={nextStep}
          disabled={!allowNext}
        >
          Далее
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
