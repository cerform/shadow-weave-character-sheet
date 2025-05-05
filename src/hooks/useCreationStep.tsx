
import { useState, useEffect } from 'react';
import { Step, UseCreationStepConfig } from '@/types/characterCreation';

export const useCreationStep = (config: UseCreationStepConfig) => {
  const { steps = [], initialStep = 0, onStepChange, isMagicClass = false } = config;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [visibleSteps, setVisibleSteps] = useState<Step[]>([]);

  // Функция для получения и фильтрации шагов из конфигурации
  const getVisibleSteps = (): Step[] => {
    // Apply filters based on configuration
    return steps.filter((step: Step) => {
      // If step requires subraces, but there are none - hide step
      if (step.requiresSubraces && !config.hasSubraces) {
        return false;
      }
      
      // If step requires magic class, but class isn't magical - hide step
      if (step.requiresMagicClass && !isMagicClass) {
        return false;
      }
      
      // In all other cases, show step
      return true;
    });
  };

  // Update visible steps when configuration changes
  useEffect(() => {
    const filteredSteps = getVisibleSteps();
    setVisibleSteps(filteredSteps);
    // Ensure current step is still valid
    if (currentStep >= filteredSteps.length) {
      setCurrentStep(Math.max(0, filteredSteps.length - 1));
    }
  }, [config.hasSubraces, isMagicClass, steps]);

  // Function to move to next step
  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      if (onStepChange) {
        onStepChange(newStep);
      }
    }
  };

  // Function to move to previous step
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
