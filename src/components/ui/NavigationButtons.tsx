
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Fix the import to use our correct hook

interface Props {
  prevStep: () => void;
  nextStep: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  allowNext?: boolean;
  className?: string; // Add className prop to support the className in TopPanel
}

const NavigationButtons = ({ prevStep, nextStep, nextLabel = "Далее", disableNext = false, allowNext = true, className }: Props) => {
  const { currentUser } = useAuth();

  return (
    <div className={`flex justify-between ${className || ''}`}>
      <Button variant="outline" onClick={prevStep}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>
      <Button onClick={nextStep} disabled={disableNext}>
        {nextLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default NavigationButtons;
