
import { useState } from 'react';

interface UseCreationStepConfig {
  isMagicClass?: boolean;
  characterClass?: string;
  character?: any;
}

export const useCreationStep = (config?: UseCreationStepConfig) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Общее количество шагов
  const totalSteps = 12; // Теперь у нас 12 шагов с учетом архетипа
  
  const nextStep = () => {
    // Пропускаем шаг заклинаний, если класс не магический
    if (currentStep === 5 && config?.isMagicClass === false) {
      setCurrentStep(currentStep + 2);
    } else {
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    }
  };
  
  const prevStep = () => {
    // Пропускаем шаг заклинаний в обратном направлении, если класс не магический
    if (currentStep === 7 && config?.isMagicClass === false) {
      setCurrentStep(currentStep - 2);
    } else {
      setCurrentStep(Math.max(currentStep - 1, 0));
    }
  };
  
  return {
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
    totalSteps
  };
};
