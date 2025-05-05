import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  prevStep: () => void;
  nextStep: () => void;
  nextLabel?: string;
  disableNext?: boolean;
  allowNext?: boolean;
}

const NavigationButtons = ({ prevStep, nextStep, nextLabel = "Далее", disableNext = false, allowNext = true }: Props) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex justify-between">
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
