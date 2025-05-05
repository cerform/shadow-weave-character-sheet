
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface Step {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
}

interface CreationSidebarProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const CreationSidebar: React.FC<CreationSidebarProps> = ({
  steps,
  currentStep,
  setCurrentStep,
}) => {
  const { themeStyles } = useTheme();

  // Handle step click - only allow clicking on completed steps or current step
  const handleStepClick = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && (step.completed || step.id === currentStep)) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="hidden md:block w-64 h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto pr-4">
      <div 
        className="py-3 px-4 mb-4 rounded-lg font-semibold text-center"
        style={{ backgroundColor: `${themeStyles?.accent}20`, color: themeStyles?.accent }}
      >
        Этапы создания
      </div>
      <ul className="space-y-2">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed || step.id < currentStep;
          const isDisabled = !isCompleted && !isActive;
          
          return (
            <li key={step.id}>
              <button
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "w-full text-left py-3 px-4 rounded-lg transition-all duration-300 flex items-center",
                  isActive
                    ? `bg-opacity-20 font-medium`
                    : isCompleted
                    ? "hover:bg-opacity-10"
                    : "opacity-50 cursor-not-allowed",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={isDisabled}
                style={{ 
                  backgroundColor: isActive ? `${themeStyles?.accent}20` : 'transparent',
                  borderLeft: isActive ? `3px solid ${themeStyles?.accent}` : '',
                  paddingLeft: isActive ? "calc(1rem - 3px)" : "1rem"
                }}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full mr-3 flex items-center justify-center flex-shrink-0",
                    isActive
                      ? "bg-yellow-500 text-black"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">{step.id + 1}</span>
                  )}
                </div>
                <span>{step.name}</span>
                {isActive && <ChevronRightIcon className="w-4 h-4 ml-auto" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CreationSidebar;
