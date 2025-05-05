
import { useState, useEffect } from 'react';
import { Step, UseCreationStepConfig } from '@/types/characterCreation';

export const useCreationStep = (config: UseCreationStepConfig) => {
  const { steps = [], initialStep = 0, onStepChange, hasSubraces = false, isMagicClass = false } = config;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [visibleSteps, setVisibleSteps] = useState<Step[]>([]);

  // Функция для получения и фильтрации шагов из конфигурации
  const getVisibleSteps = (): Step[] => {
    // Apply filters based on configuration
    return steps.filter((step: Step) => {
      // Если шаг требует подрасы, но их нет - скрываем шаг
      if (step.requiresSubraces && !hasSubraces) {
        return false;
      }
      
      // Если шаг требует магического класса, но класс не магический - скрываем шаг
      if (step.requiresMagicClass && !isMagicClass) {
        return false;
      }
      
      // В остальных случаях показываем шаг
      return true;
    });
  };

  // Обновляем видимые шаги при изменении конфигурации
  useEffect(() => {
    const filteredSteps = getVisibleSteps();
    setVisibleSteps(filteredSteps);
    
    // Если текущий шаг больше, чем общее количество шагов после фильтрации,
    // сбрасываем на последний доступный шаг
    if (currentStep >= filteredSteps.length) {
      setCurrentStep(Math.max(0, filteredSteps.length - 1));
    }
  }, [config.hasSubraces, isMagicClass, steps]);

  // Функция для перехода к следующему шагу
  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) {
        onStepChange(newStep);
      }
    }
  };

  // Функция для перехода к предыдущему шагу
  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      if (onStepChange) {
        onStepChange(newStep);
      }
    }
  };

  return {
    currentStep,
    nextStep,
    prevStep,
    setCurrentStep,
    visibleSteps
  };
};
