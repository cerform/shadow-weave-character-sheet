
import { useState, useEffect } from "react";
import { CharacterSheet } from "@/types/character";

interface UseCreationStepProps {
  isMagicClass: boolean;
  characterClass: string;
  character: CharacterSheet;
}

export const useCreationStep = ({ isMagicClass, characterClass, character }: UseCreationStepProps) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<{[key: number]: boolean}>({});

  // Эффект для обновления состояния завершенности шагов при изменении персонажа
  useEffect(() => {
    const newCompletedSteps = { ...completedSteps };
    
    // Проверяем расу
    if (character.race) {
      newCompletedSteps[0] = true;
    } else {
      newCompletedSteps[0] = false;
    }
    
    // Проверяем класс
    if (character.class) {
      newCompletedSteps[1] = true;
    } else {
      newCompletedSteps[1] = false;
    }
    
    // Проверка уровня
    if (character.level && character.level >= 1 && character.level <= 20) {
      newCompletedSteps[2] = true;
    } else {
      newCompletedSteps[2] = false;
    }
    
    // Проверяем характеристики
    if (character.abilities && 
        Object.values(character.abilities).every(score => score >= 3 && score <= 30)) {
      newCompletedSteps[3] = true;
    } else {
      newCompletedSteps[3] = false;
    }
    
    // Шаг мультиклассирования всегда считается завершенным (необязательный шаг)
    newCompletedSteps[4] = true;
    
    // Проверка заклинаний (только для магических классов)
    if (!isMagicClass || (character.spells && character.spells.length > 0)) {
      newCompletedSteps[5] = true;
    } else {
      newCompletedSteps[5] = false;
    }
    
    // Проверка снаряжения
    if (character.equipment && character.equipment.length > 0) {
      newCompletedSteps[6] = true;
    } else {
      newCompletedSteps[6] = false;
    }
    
    // Проверка языков
    if (character.languages && character.languages.length > 0) {
      newCompletedSteps[7] = true;
    } else {
      newCompletedSteps[7] = false;
    }
    
    // Проверка имени и внешности
    if (character.name) {
      newCompletedSteps[8] = true;
    } else {
      newCompletedSteps[8] = false;
    }
    
    // Проверка предыстории
    if (character.background) {
      newCompletedSteps[9] = true;
    } else {
      newCompletedSteps[9] = false;
    }
    
    // Шаг обзора всегда завершен
    newCompletedSteps[10] = true;
    
    setCompletedSteps(newCompletedSteps);
  }, [character, isMagicClass]);

  const nextStep = () => {
    // Шаг 4 - Мультиклассирование (необязательный)
    // Шаг 5 - выбор заклинаний (только для магических классов)
    
    // Если мы на шаге 4 (мультиклассирование) и класс не магический, то пропускаем шаг 5
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
      setCurrentStep(4); // Возвращаемся к мультиклассированию
    }
    // В остальных случаях просто возвращаемся на предыдущий шаг
    else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (step: number): boolean => {
    return !!completedSteps[step];
  };
  
  const canProceedToNextStep = (): boolean => {
    // Проверяем, завершен ли текущий шаг
    return isStepCompleted(currentStep);
  };

  return { 
    currentStep, 
    nextStep, 
    prevStep, 
    setCurrentStep, 
    isStepCompleted,
    canProceedToNextStep 
  };
};
