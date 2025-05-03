
import React from 'react';
import { Check, CircleSlash } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  description: string;
  isOptional?: boolean;
  isMagicOnly?: boolean;
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
  isMagicClass = false
}) => {
  const handleStepClick = (stepId: number) => {
    // Не позволяем переходить к шагу для магических классов, если выбран немагический класс
    if (steps[stepId]?.isMagicOnly && !isMagicClass) {
      return;
    }
    
    setCurrentStep(stepId);
  };
  
  // Фильтруем шаги, чтобы не показывать шаг для магических классов, если выбран немагический класс
  const filteredSteps = steps.filter(step => 
    !step.isMagicOnly || isMagicClass
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Прогресс создания</h2>
        <span className="text-sm text-muted-foreground">
          Шаг {currentStep + 1} из {filteredSteps.length}
        </span>
      </div>
      
      {/* Прогресс-бар */}
      <div className="w-full bg-secondary h-2 rounded-full mb-4 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / filteredSteps.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Шаги с возможностью перехода */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {filteredSteps.map((step, index) => {
          const isPast = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;
          
          return (
            <button
              key={step.id}
              className={`p-2 rounded-md text-center text-xs sm:text-sm transition-all cursor-pointer
                ${isCurrent ? 'bg-primary text-primary-foreground font-medium' : ''}
                ${isPast ? 'bg-primary/20 text-primary' : ''}
                ${isFuture ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : ''}
                ${step.isOptional ? 'opacity-70' : ''}
              `}
              onClick={() => handleStepClick(step.id)}
              title={step.description}
            >
              <div className="flex items-center justify-center gap-1">
                {isPast && <Check className="w-3 h-3" />}
                {step.isOptional && <CircleSlash className="w-3 h-3" />}
                <span>{step.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CreationStepDisplay;
