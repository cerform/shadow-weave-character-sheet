
import { useState, useCallback } from "react";

export const useCreationStep = (isMagicClass: (className: string) => boolean, characterClass: string) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      // For non-magic classes, skip from step 3 (abilities) to step 5 (equipment),
      // effectively skipping the spell selection step (step 4)
      if (prev === 3 && characterClass && !isMagicClass(characterClass)) {
        return 5;
      }
      // Normal progression with limit at step 9
      return Math.min(prev + 1, 9);
    });
  }, [characterClass, isMagicClass]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      // For non-magic classes, when going back from step 5 (equipment), 
      // go to step 3 (abilities), skipping the spell selection step (step 4)
      if (prev === 5 && characterClass && !isMagicClass(characterClass)) {
        return 3;
      }
      // Normal backward progression with limit at step 0
      return Math.max(prev - 1, 0);
    });
  }, [characterClass, isMagicClass]);

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep
  };
};
