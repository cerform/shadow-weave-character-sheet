
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

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
            <Button
              key={step.id}
              className={cn(
                "min-w-[130px] flex-shrink-0 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : isCompleted
                  ? "bg-primary/20 text-foreground hover:bg-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              style={{
                backgroundColor: isActive
                  ? currentTheme.accent
                  : isCompleted
                  ? `${currentTheme.accent}30`
                  : undefined,
              }}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default CreationStepDisplay;
