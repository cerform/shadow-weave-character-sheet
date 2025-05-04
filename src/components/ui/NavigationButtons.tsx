
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface NavigationButtonsProps {
  prevStep: () => void;
  nextStep: () => void;
  nextDisabled?: boolean;
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  prevStep,
  nextStep,
  nextDisabled = false,
  className = ''
}) => {
  return (
    <div className={`flex justify-between ${className}`}>
      <Button 
        onClick={prevStep} 
        variant="outline"
        className="flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        Назад
      </Button>
      <Button 
        onClick={nextStep}
        className="flex items-center gap-1"
        disabled={nextDisabled}
      >
        Далее
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default NavigationButtons;
