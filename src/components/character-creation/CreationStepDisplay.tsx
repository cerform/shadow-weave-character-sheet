
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Step {
  id: number;
  name: string;
  description: string;
  onlyFor?: string;
  optional?: boolean;
}

interface CreationStepDisplayProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isMagicClass?: boolean;
  hasSubraces?: boolean;
}

const CreationStepDisplay: React.FC<CreationStepDisplayProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  isMagicClass = false,
  hasSubraces = false,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Используем шаги напрямую из props
  const filteredSteps = steps;

  return (
    <div className="relative w-full mb-8">
      {/* Прогресс-бар */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
      
      {/* Шаги */}
      <div className="flex justify-between relative z-10">
        {filteredSteps.map((step, index) => {
          // Вычисляем, является ли шаг активным или завершенным
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-all",
                        isActive
                          ? "bg-yellow-500 text-black shadow-lg scale-125 font-bold shadow-yellow-500/30"
                          : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )}
                      aria-label={step.name}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </button>
                    <span 
                      className={cn(
                        "mt-2 text-xs text-center font-medium hidden md:block",
                        isActive ? "text-yellow-300" : isCompleted ? "text-green-400" : "text-gray-400"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-bold">{step.name}</p>
                    <p className="text-xs">{step.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default CreationStepDisplay;
