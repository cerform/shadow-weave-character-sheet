
import React from 'react';
import { Button } from "@/components/ui/button";

export interface NavigationButtonsProps {
  prevStep: () => void;
  nextStep: () => void;
  prevLabel?: string;
  nextLabel?: string;
  disableNext?: boolean;
  allowNext?: boolean;
  nextDisabled?: boolean; // Явно добавляем свойство nextDisabled
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  prevLabel = "Назад",
  nextLabel = "Далее",
  disableNext = false,
  allowNext = true,
  nextDisabled // Поддерживаем свойство nextDisabled
}) => {
  // Используем nextDisabled, если он передан, иначе используем логику disableNext || !allowNext
  const isNextDisabled = nextDisabled !== undefined ? nextDisabled : (disableNext || !allowNext);
  
  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline" 
        onClick={prevStep}
      >
        {prevLabel}
      </Button>
      <Button 
        onClick={nextStep}
        disabled={isNextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default NavigationButtons;
