
import React from "react";

interface StepDisplayProps {
  steps: { id: number; name: string; description: string }[];
  currentStep: number;
  isMagicClass: boolean;
  characterClass: string;
}

const CreationStepDisplay: React.FC<StepDisplayProps> = ({
  steps,
  currentStep,
  isMagicClass,
  characterClass,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        // Skip spell step for non-magic classes
        if (step.id === 5 && !isMagicClass) {
          return null;
        }
        
        return (
          <div
            key={index}
            className={`p-2 rounded-md font-semibold text-sm ${
              currentStep === index
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.name}
          </div>
        );
      })}
    </div>
  );
};

export default CreationStepDisplay;
