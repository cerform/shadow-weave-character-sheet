import React from "react";

interface NavigationButtonsProps {
  allowNext: boolean;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  allowNext,
  nextStep,
  prevStep,
  isFirstStep = false,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {/* Кнопка на главную */}
      <button
        onClick={() => (window.location.href = "/")}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 rounded"
      >
        На главную
      </button>

      {/* Кнопка назад */}
      <button
        onClick={prevStep}
        disabled={isFirstStep}
        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700 rounded disabled:opacity-50"
      >
        Назад
      </button>

      {/* Кнопка далее */}
      <button
        onClick={nextStep}
        disabled={!allowNext}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 rounded disabled:opacity-50"
      >
        Далее
      </button>
    </div>
  );
};

export default NavigationButtons;
