
import { useState, useEffect } from 'react';
import { Step } from '@/types/characterCreation';

// Обновляем интерфейс, добавляя isMagicClass
export interface UseCreationStepConfig {
  hasSubraces?: boolean;
  isMagicClass?: boolean;
}

export const useCreationStep = (config: UseCreationStepConfig = {}) => {
  const { hasSubraces = false, isMagicClass = false } = config;
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<Step[]>([]);

  // Функция для получения и фильтрации шагов из конфигурации
  const getVisibleSteps = (): Step[] => {
    // Импортируем шаги из конфигурации
    const { steps } = require('@/config/characterCreationSteps');
    
    // Применяем фильтры на основе конфигурации
    return steps.filter((step: Step) => {
      // Если шаг требует наличия подрас, но их нет - скрываем шаг
      if (step.requiresSubraces && !hasSubraces) {
        return false;
      }
      
      // Если шаг требует магический класс, но класс не магический - скрываем шаг
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
    // Убедимся, что текущий шаг по-прежнему валиден
    if (currentStep >= filteredSteps.length) {
      setCurrentStep(Math.max(0, filteredSteps.length - 1));
    }
  }, [hasSubraces, isMagicClass]);

  // Функция для перехода к следующему шагу
  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Функция для перехода к предыдущему шагу
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
