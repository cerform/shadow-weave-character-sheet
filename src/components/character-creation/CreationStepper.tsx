
import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Step {
  id: number;
  name: string;
  description: string;
  icon?: React.ReactNode;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
}

interface CreationStepperProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const CreationStepper: React.FC<CreationStepperProps> = ({
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
    <div className="relative w-full mb-8 sticky top-0 z-10 py-4 bg-black/30 backdrop-blur-md">
      {/* Progress bar background */}
      <div 
        className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 rounded-full z-0"
        style={{ backgroundColor: `${themeStyles?.accent}30` }}
      ></div>
      
      {/* Progress bar fill */}
      <div 
        className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full z-1 transition-all duration-300"
        style={{ 
          width: `${Math.max(5, (currentStep / (steps.length - 1)) * 100)}%`,
          backgroundColor: themeStyles?.accent || '#8B5A2B' 
        }}
      ></div>
      
      {/* Steps */}
      <div className="flex justify-between relative z-10">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.completed || step.id < currentStep;
          const isDisabled = !isCompleted && !isActive;
          
          return (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300",
                      isActive
                        ? "bg-yellow-500 text-black shadow-lg scale-125 font-bold shadow-yellow-500/30"
                        : isCompleted
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                      isDisabled && "opacity-50 cursor-not-allowed hover:bg-gray-700"
                    )}
                    disabled={isDisabled}
                    aria-label={step.name}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span>{step.id + 1}</span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-bold">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              <div className="mt-2 text-xs text-center font-medium max-w-[80px] mx-auto">
                <span 
                  className={cn(
                    "transition-colors duration-300",
                    isActive ? "text-yellow-300" : isCompleted ? "text-green-400" : "text-gray-400"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default CreationStepper;
