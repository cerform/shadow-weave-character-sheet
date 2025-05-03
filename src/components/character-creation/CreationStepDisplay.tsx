
import React from "react";
import { steps } from "@/config/characterCreationSteps";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface CreationStepDisplayProps {
  steps: typeof steps;
  currentStep: number;
  isMagicClass: boolean;
  characterClass?: string;
}

const CreationStepDisplay: React.FC<CreationStepDisplayProps> = ({
  steps,
  currentStep,
  isMagicClass,
  characterClass,
}) => {
  const { theme } = useTheme();
  
  // Get theme colors for styling
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Фильтруем шаги для немагических классов
  const visibleSteps = steps.filter((_, index) => 
    !(index === 5 && !isMagicClass) // Скрываем шаг заклинаний для немагических классов
  );

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-2 relative">
        {/* Progress bar */}
        <div 
          className="absolute h-1 top-4 left-0 right-0 bg-muted/50 -z-10"
          style={{ width: "100%" }}
        ></div>
        <div 
          className="absolute h-1 top-4 left-0 bg-primary transition-all duration-500 -z-10"
          style={{ 
            width: `${(currentStep / (visibleSteps.length - 1)) * 100}%`,
            backgroundColor: currentTheme.accent
          }}
        ></div>
        
        {/* Step circles */}
        {visibleSteps.map((step, index) => {
          // Вычисляем реальный индекс шага в общем массиве шагов
          const realStepIndex = steps.findIndex(s => s.id === step.id);
          const isActive = currentStep === realStepIndex;
          const isPast = currentStep > realStepIndex;
          const isSpecialStep = realStepIndex === 4; // Subclass step that changes based on class

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center transition-all duration-300 ${
                isActive ? "scale-110" : ""
              }`}
            >
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center z-10 font-medium transition-all duration-300
                  ${isActive ? "animate-pulse shadow-glow" : ""}
                  ${isPast ? "bg-primary" : isActive ? "bg-primary border-2" : "bg-background border"}`}
                style={{
                  backgroundColor: isPast ? currentTheme.accent : isActive ? `${currentTheme.accent}30` : '',
                  borderColor: isActive || isPast ? currentTheme.accent : '',
                  boxShadow: isActive ? `0 0 8px ${currentTheme.accent}` : 'none'
                }}
              >
                <span className={isPast ? "text-primary-foreground" : ""}>
                  {index + 1}
                </span>
              </div>
              
              <div 
                className={`text-xs mt-1 font-medium text-center max-w-20 transition-all duration-300
                  ${isActive ? "text-primary underline" : "text-muted-foreground"}`}
                style={{
                  color: isActive ? currentTheme.accent : ''
                }}
              >
                {isSpecialStep && characterClass
                  ? `Выбор ${characterClass}`
                  : step.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreationStepDisplay;
