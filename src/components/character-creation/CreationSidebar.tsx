
import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Step {
  id: number;
  name: string;
  description: string;
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
  
  return (
    <div className="hidden md:block w-80 mt-4">
      <Card 
        className="rounded-lg sticky top-24"
        style={{ 
          background: `${themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.8)'}`,
          borderColor: `${themeStyles?.accent}30`,
          color: themeStyles?.textColor 
        }}
      >
        <CardContent className="p-4">
          <h3 
            className="text-lg font-medium mb-4"
            style={{ color: themeStyles?.accent }}
          >
            Шаги создания
          </h3>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-1 pr-3">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      if (isCompleted || isActive) {
                        setCurrentStep(index);
                      }
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md transition-all",
                      isActive 
                        ? "bg-primary/15" 
                        : "hover:bg-primary/5",
                      (!isCompleted && !isActive) && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!isCompleted && !isActive}
                    style={{
                      backgroundColor: isActive 
                        ? `${themeStyles?.accent}20` 
                        : undefined,
                      borderLeft: isActive 
                        ? `3px solid ${themeStyles?.accent}` 
                        : undefined,
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-medium",
                          isActive 
                            ? "bg-primary text-white" 
                            : isCompleted 
                            ? "bg-green-600 text-white" 
                            : "bg-gray-600 text-gray-300"
                        )}
                        style={{
                          backgroundColor: isActive ? themeStyles?.accent : undefined
                        }}
                      >
                        {isCompleted ? "✓" : index + 1}
                      </div>
                      <span 
                        className={cn(
                          "font-medium",
                          isActive 
                            ? "text-white" 
                            : "text-gray-300"
                        )}
                      >
                        {step.name}
                      </span>
                    </div>
                    {isActive && (
                      <p className="mt-1 text-sm opacity-80 pl-8">
                        {step.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreationSidebar;
