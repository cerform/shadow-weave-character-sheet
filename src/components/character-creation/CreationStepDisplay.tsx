
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
}

interface CreationStepDisplayProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isMagicClass?: boolean;
}

const CreationStepDisplay: React.FC<CreationStepDisplayProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  isMagicClass = false,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Фильтруем шаги для отображения
  const visibleSteps = steps.filter(
    (step) => step.onlyFor !== "magic" || isMagicClass
  );

  return (
    <div className="flex overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex space-x-2 min-w-full">
        {visibleSteps.map((step) => {
          // Вычисляем, является ли шаг активным или завершенным
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      "min-w-[130px] flex-shrink-0 transition-all",
                      isActive
                        ? "bg-primary text-white shadow-lg scale-105 font-medium"
                        : isCompleted
                        ? "bg-primary/20 text-white hover:bg-primary/30"
                        : "bg-muted text-white hover:bg-muted/80"
                    )}
                    style={{
                      backgroundColor: isActive
                        ? currentTheme.accent
                        : isCompleted
                        ? `${currentTheme.accent}30`
                        : undefined,
                      color: "#FFFFFF", // Обеспечиваем белый текст для всех кнопок
                      textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)", // Добавляем тень для улучшения читаемости
                    }}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    {step.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.description}</p>
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
