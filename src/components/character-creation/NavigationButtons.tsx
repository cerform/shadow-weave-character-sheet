
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
  allowNext: boolean;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  homePath?: string;
  nextLabel?: string;
  prevLabel?: string;
  homeLabel?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  allowNext,
  nextStep,
  prevStep,
  isFirstStep = false,
  isLastStep = false,
  homePath = "/",
  nextLabel = "Далее",
  prevLabel = "Назад",
  homeLabel = "На главную",
}) => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate(homePath);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {/* Кнопка на главную */}
      <Button
        onClick={goHome}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Home className="size-4" />
        {homeLabel}
      </Button>

      {/* Кнопка назад */}
      <Button
        onClick={prevStep}
        disabled={isFirstStep}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="size-4" />
        {prevLabel}
      </Button>

      {/* Кнопка далее */}
      <Button
        onClick={nextStep}
        disabled={!allowNext}
        className="flex items-center gap-2"
      >
        <ArrowRight className="size-4" />
        {nextLabel}
      </Button>
    </div>
  );
};

export default NavigationButtons;
