
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, ArrowRight, Book, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface NavigationButtonsProps {
  allowNext?: boolean;
  disableNext?: boolean; // Добавлено для CharacterSpellSelection
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  homePath?: string;
  nextLabel?: string;
  prevLabel?: string;
  homeLabel?: string;
  showHomeButton?: boolean;
  showBookButton?: boolean;
  bookPath?: string;
  bookLabel?: string;
  showPdfImportButton?: boolean;
  onPdfImportClick?: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  allowNext = true,
  disableNext = false,
  nextStep,
  prevStep,
  isFirstStep = false,
  isLastStep = false,
  homePath = "/",
  nextLabel = "Далее",
  prevLabel = "Назад",
  homeLabel = "На главную",
  showHomeButton = true,
  showBookButton = false,
  bookPath = "/handbook",
  bookLabel = "Справочник",
  showPdfImportButton = false,
  onPdfImportClick
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const goHome = () => {
    navigate(homePath);
  };
  
  const goToBook = () => {
    navigate(bookPath);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {/* Кнопка на главную */}
      {showHomeButton && (
        <Button
          onClick={goHome}
          variant="outline"
          className="flex items-center gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <Home className="size-4" />
          {homeLabel}
        </Button>
      )}
      
      {/* Кнопка справочника */}
      {showBookButton && (
        <Button
          onClick={goToBook}
          variant="outline"
          className="flex items-center gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <Book className="size-4" />
          {bookLabel}
        </Button>
      )}
      
      {/* Кнопка импорта из PDF */}
      {showPdfImportButton && onPdfImportClick && (
        <Button
          onClick={onPdfImportClick}
          variant="outline"
          className="flex items-center gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <FileUp className="size-4" />
          Импорт из PDF
        </Button>
      )}

      {/* Кнопка назад */}
      <Button
        onClick={prevStep}
        disabled={isFirstStep}
        variant="outline"
        className="flex items-center gap-2"
        style={{
          borderColor: currentTheme.accent,
          color: currentTheme.textColor
        }}
      >
        <ArrowLeft className="size-4" />
        {prevLabel}
      </Button>

      {/* Кнопка далее */}
      <Button
        onClick={nextStep}
        disabled={disableNext || !allowNext}
        className="flex items-center gap-2"
        style={{
          backgroundColor: currentTheme.accent,
          color: currentTheme.buttonText
        }}
      >
        <ArrowRight className="size-4" />
        {nextLabel}
      </Button>
    </div>
  );
};

export default NavigationButtons;
