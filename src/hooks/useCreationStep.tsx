
import { useState, useEffect } from 'react';
import { steps, getCharacterSteps, getNextStepID, getPrevStepID } from '@/config/characterCreationSteps';

interface UseCreationStepConfig {
  isMagicClass?: boolean;
  characterClass?: string;
  character?: any;
  hasSubclasses?: boolean;
}

export const useCreationStep = (config?: UseCreationStepConfig) => {
  const [currentStepId, setCurrentStepId] = useState<number>(0);
  
  // Получаем отфильтрованные шаги на основе текущей конфигурации
  const visibleSteps = getCharacterSteps({
    isMagicClass: config?.isMagicClass,
    hasSubclasses: config?.hasSubclasses
  });

  // Переход к следующему шагу с учетом фильтрации
  const nextStep = () => {
    const nextId = getNextStepID(currentStepId, visibleSteps);
    setCurrentStepId(nextId);
  };

  // Переход к предыдущему шагу с учетом фильтрации
  const prevStep = () => {
    const prevId = getPrevStepID(currentStepId, visibleSteps);
    setCurrentStepId(prevId);
  };

  // Функция для установки шага по индексу, проверяя его доступность
  const setCurrentStep = (stepId: number) => {
    // Проверяем, существует ли шаг в отфильтрованном списке
    const stepExists = visibleSteps.some(step => step.id === stepId);
    
    if (stepExists) {
      setCurrentStepId(stepId);
    } else {
      // Если шаг недоступен, находим ближайший доступный
      const closestStep = visibleSteps.reduce((prev, curr) => 
        Math.abs(curr.id - stepId) < Math.abs(prev.id - stepId) ? curr : prev
      );
      setCurrentStepId(closestStep.id);
    }
  };

  // Обновляем currentStepId, если шаг стал недоступен после изменения фильтров
  useEffect(() => {
    const currentStepExists = visibleSteps.some(step => step.id === currentStepId);
    
    if (!currentStepExists && visibleSteps.length > 0) {
      // Находим ближайший доступный шаг
      const closestStep = visibleSteps.reduce((prev, curr) => 
        Math.abs(curr.id - currentStepId) < Math.abs(prev.id - currentStepId) ? curr : prev
      );
      setCurrentStepId(closestStep.id);
    }
  }, [config?.isMagicClass, config?.hasSubclasses, visibleSteps]);

  return {
    currentStep: currentStepId,
    nextStep,
    prevStep,
    setCurrentStep,
    totalSteps: steps.length,
    visibleSteps
  };
};
