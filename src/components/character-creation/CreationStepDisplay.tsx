
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
        
        // Determine if this step is active, completed or upcoming
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const isUpcoming = currentStep < index;
        
        return (
          <div
            key={index}
            className={`p-2 rounded-md font-semibold text-sm ${
              isActive
                ? "bg-primary text-primary-foreground"
                : isCompleted 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
            }`}
            title={step.description}
          >
            {step.name}
          </div>
        );
      })}
    </div>
  );
};

export default CreationStepDisplay;
