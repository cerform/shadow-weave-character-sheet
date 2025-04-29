
import { useState } from "react";

export const useCreationStep = (isMagicClass: (className: string) => boolean, characterClass: string) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    // Skip spell selection step if class is not a magic user
    if (currentStep === 1 && !isMagicClass(characterClass)) {
      setCurrentStep((prev) => Math.min(prev + 2, 8));
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const prevStep = () => {
    // Skip spell selection step if class is not a magic user when going back
    if (currentStep === 3 && !isMagicClass(characterClass)) {
      setCurrentStep((prev) => Math.max(prev - 2, 0));
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep
  };
};
