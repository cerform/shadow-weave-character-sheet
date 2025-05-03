
import { useState } from 'react';

interface UseCreationStepConfig {
  isMagicClass?: boolean;
  characterClass?: string;
  character?: any;
  hasSubclasses?: boolean;
}

export const useCreationStep = (config?: UseCreationStepConfig) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Общее количество шагов
  const totalSteps = 12; // Всего 12 шагов с учетом архетипа
  
  const nextStep = () => {
    // Пропускаем шаг выбора архетипа, если для выбранного класса нет подклассов
    if (currentStep === 1 && config?.hasSubclasses === false) {
      setCurrentStep(3); // Переходим сразу к шагу уровня (3), пропуская шаг архетипа (2)
    }
    // Пропускаем шаг заклинаний, если класс не магический
    else if (currentStep === 5 && config?.isMagicClass === false) {
      setCurrentStep(7); // Пропускаем шаг заклинаний (6)
    } else {
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    }
  };
  
  const prevStep = () => {
    // Пропускаем шаг архетипа в обратном направлении, если для класса нет подклассов
    if (currentStep === 3 && config?.hasSubclasses === false) {
      setCurrentStep(1); // Возвращаемся к шагу 1 (выбор класса), пропуская шаг архетипа (2)
    }
    // Пропускаем шаг заклинаний в обратном направлении, если класс не магический
    else if (currentStep === 7 && config?.isMagicClass === false) {
      setCurrentStep(5);
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
