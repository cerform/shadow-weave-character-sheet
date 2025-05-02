
import { useState } from "react";

export const useCreationStep = (isMagicClass: boolean, characterClass: string) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const nextStep = () => {
    // Шаг 4 - выбор специализации
    // Шаг 5 - выбор заклинаний (только для магических классов)
    
    // Если мы на шаге 4 (специализация) и класс не магический, то пропускаем шаг 5
    if (currentStep === 4 && !isMagicClass) {
      setCurrentStep(6); // Переходим к снаряжению
    } 
    // В остальных случаях просто переходим к следующему шагу
    else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Если мы на шаге 6 (снаряжение) и класс не магический, то возвращаемся к шагу 4
    if (currentStep === 6 && !isMagicClass) {
      setCurrentStep(4); // Возвращаемся к специализации
    }
    // В остальных случаях просто возвращаемся на предыдущий шаг
    else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return { currentStep, nextStep, prevStep, setCurrentStep };
};
