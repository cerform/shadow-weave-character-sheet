
import { useState, useEffect, useRef, useCallback } from 'react';
import { steps, getCharacterSteps, getNextStepID, getPrevStepID } from '@/config/characterCreationSteps';

interface UseCreationStepConfig {
  isMagicClass?: boolean;
  characterClass?: string;
  character?: any;
}

export const useCreationStep = (config?: UseCreationStepConfig) => {
  const [currentStepId, setCurrentStepId] = useState<number>(0);
  const isMounted = useRef(true);
  
  // Получаем отфильтрованные шаги на основе текущей конфигурации
  const visibleSteps = getCharacterSteps({
    isMagicClass: config?.isMagicClass
  });

  // Переход к следующему шагу с учетом фильтрации
  const nextStep = useCallback(() => {
    if (!isMounted.current) return;
    
    const nextId = getNextStepID(currentStepId, visibleSteps);
    console.log(`Переход к следующему шагу: с ${currentStepId} на ${nextId}`);
    setCurrentStepId(nextId);
  }, [currentStepId, visibleSteps]);

  // Переход к предыдущему шагу с учетом фильтрации
  const prevStep = useCallback(() => {
    if (!isMounted.current) return;
    
    const prevId = getPrevStepID(currentStepId, visibleSteps);
    console.log(`Переход к предыдущему шагу: с ${currentStepId} на ${prevId}`);
    setCurrentStepId(prevId);
  }, [currentStepId, visibleSteps]);

  // Функция для установки шага по индексу, проверяя его доступность
  const setCurrentStep = useCallback((stepId: number) => {
    if (!isMounted.current) return;
    
    console.log(`Установка текущего шага на ${stepId}`);
    // Проверяем, существует ли шаг в отфильтрованном списке
    const stepExists = visibleSteps.some(step => step.id === stepId);
    
    if (stepExists) {
      setCurrentStepId(stepId);
    } else {
      // Если шаг недоступен, находим ближайший доступный
      const closestStep = visibleSteps.reduce((prev, curr) => 
        Math.abs(curr.id - stepId) < Math.abs(prev.id - stepId) ? curr : prev
      );
      console.log(`Шаг ${stepId} недоступен, переходим к ближайшему: ${closestStep.id}`);
      setCurrentStepId(closestStep.id);
    }
  }, [visibleSteps]);

  // Обновляем currentStepId, если шаг стал недоступен после изменения фильтров
  useEffect(() => {
    console.log(`Конфигурация шагов изменилась: isMagicClass=${config?.isMagicClass}`);
    console.log(`Видимые шаги:`, visibleSteps.map(s => s.id));

    const currentStepExists = visibleSteps.some(step => step.id === currentStepId);
    
    if (!currentStepExists && visibleSteps.length > 0) {
      // Находим ближайший доступный шаг
      const closestStep = visibleSteps.reduce((prev, curr) => 
        Math.abs(curr.id - currentStepId) < Math.abs(prev.id - currentStepId) ? curr : prev
      );
      console.log(`Текущий шаг ${currentStepId} недоступен после изменения фильтров, переходим к ближайшему: ${closestStep.id}`);
      setCurrentStepId(closestStep.id);
    }

    // Очистка при размонтировании
    return () => {
      isMounted.current = false;
      console.log("Очистка ресурсов useCreationStep");
    };
  }, [config?.isMagicClass, visibleSteps, currentStepId]);

  // Вычисляем процент завершения создания персонажа
  const calculateProgress = useCallback((): number => {
    if (visibleSteps.length === 0) return 0;
    const currentIndex = visibleSteps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / visibleSteps.length) * 100);
  }, [visibleSteps, currentStepId]);

  // Сброс текущего шага на начальный
  const resetStep = useCallback(() => {
    if (isMounted.current) {
      setCurrentStepId(0);
      console.log("Сброс шага создания персонажа на начальный");
    }
  }, []);

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      isMounted.current = false;
      console.log("Компонент useCreationStep размонтирован");
    };
  }, []);

  return {
    currentStep: currentStepId,
    nextStep,
    prevStep,
    setCurrentStep,
    resetStep,
    totalSteps: visibleSteps.length,
    visibleSteps,
    progress: calculateProgress()
  };
};
