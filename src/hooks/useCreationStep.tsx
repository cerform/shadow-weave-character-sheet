
import { useState, useCallback } from "react";

export const useCreationStep = (isMagicClass: (className: string) => boolean, characterClass: string) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      // For non-magic classes, skip from step 2 (abilities) to step 4 (equipment),
      // effectively skipping the spell selection step (step 3)
      if (prev === 2 && characterClass && !isMagicClass(characterClass)) {
        return 4;
      }
      // Normal progression with limit at step 8
      return Math.min(prev + 1, 8);
    });
  }, [characterClass, isMagicClass]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      // For non-magic classes, when going back from step 4 (equipment), 
      // go to step 2 (abilities), skipping the spell selection step (step 3)
      if (prev === 4 && characterClass && !isMagicClass(characterClass)) {
        return 2;
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
