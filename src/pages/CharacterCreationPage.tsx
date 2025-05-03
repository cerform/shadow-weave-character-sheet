import React, { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { themes } from "@/lib/themes";

// Custom hooks
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { useAbilitiesRoller } from "@/hooks/useAbilitiesRoller";
import { useCreationStep } from "@/hooks/useCreationStep";

// Components
import CreationStepDisplay from "@/components/character-creation/CreationStepDisplay";
import CharacterCreationContent from "@/components/character-creation/CharacterCreationContent";
import ThemeSelector from "@/components/ThemeSelector";

// Configuration
import { steps } from "@/config/characterCreationSteps";

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier, handleLevelChange } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints, rollsHistory } = useAbilitiesRoller(abilitiesMethod, character.level);
  
  // Fix: Update the hook call to match the expected parameters
  const { currentStep, nextStep, prevStep, setCurrentStep } = useCreationStep({
    isMagicClass: isMagicClass(),
    characterClass: character.class,
    character: character
  });

  // Тема для отображения
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Навигация на главную
  const goToHomePage = () => {
    // Показываем предупреждение, если процесс создания не завершен
    if (currentStep < 10) {
      const confirmed = window.confirm('Вы уверены, что хотите покинуть страницу создания персонажа? Все несохраненные изменения будут потеряны.');
      if (!confirmed) return;
    }
    navigate('/');
  };

  // Навигация в руководство игрока
  const goToHandbook = () => {
    navigate('/handbook');
  };
  
  // Переход к последнему шагу (обзор персонажа)
  const goToFinalReview = () => {
    setCurrentStep(10);
  };

  // Обертка для setAbilitiesMethod для соответствия типам
  const handleSetAbilitiesMethod = (method: "pointbuy" | "standard" | "roll" | "manual") => {
    setAbilitiesMethod(method as any);
  };

  // Функция-обертка для обеспечения правильной сигнатуры в rollSingleAbility
  const handleRollSingleAbility = (index: number): { rolls: number[], total: number } => {
    // Вызываем оригинальную функцию и преобразуем результат
    rollSingleAbility(index);
    // Возвращаем обязательный формат данных
    return { 
      rolls: diceResults[index] || [0, 0, 0, 0], 
      total: diceResults[index]?.reduce((a, b) => a + b, 0) || 0 
    };
  };

  // Обертка для getModifier для возвращения string
  const getModifierString = (score: number): string => {
    const mod = getModifier(score);
    return typeof mod === 'string' ? mod : (mod >= 0 ? `+${mod}` : `${mod}`);
  };

  return (
    <div 
      className="p-6 min-h-screen"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={goToHomePage} 
          variant="outline" 
          className="flex items-center gap-2"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Button>

        <div className="flex items-center gap-2">
          <Button 
            onClick={goToHandbook} 
            variant="outline" 
            className="flex items-center gap-2"
            style={{
              borderColor: currentTheme.accent,
              color: currentTheme.textColor
            }}
          >
            <BookOpen className="h-4 w-4" />
            Руководство игрока
          </Button>
          
          {/* Only show theme selector in small screens here */}
          <div className="block sm:hidden">
            <ThemeSelector />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 
          className="text-3xl font-bold mb-8 text-center"
          style={{ color: currentTheme.textColor }}
        >
          Создание персонажа
        </h1>
        
        {/* Show theme selector on larger screens in a more prominent position */}
        <div className="hidden sm:block mb-8">
          <ThemeSelector />
        </div>
      </div>

      {/* Отображение прогресса по шагам */}
      <CreationStepDisplay 
        steps={steps} 
        currentStep={currentStep}
        isMagicClass={isMagicClass()}
        characterClass={character.class}
      />

      {/* Основная область контента */}
      <div 
        className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg animate-fade-in"
        style={{ 
          backgroundColor: `${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.75)'}`,
          borderColor: currentTheme.accent,
          boxShadow: `0 0 10px ${currentTheme.accent}30`
        }}
      >
        <CharacterCreationContent 
          currentStep={currentStep}
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
          abilitiesMethod={abilitiesMethod}
          setAbilitiesMethod={handleSetAbilitiesMethod}
          diceResults={diceResults}
          getModifier={getModifierString}
          rollAllAbilities={rollAllAbilities}
          rollSingleAbility={handleRollSingleAbility}
          abilityScorePoints={abilityScorePoints}
          isMagicClass={isMagicClass()}
          rollsHistory={rollsHistory}
          onLevelChange={handleLevelChange}
        />
      </div>
    </div>
  );
};

export default CharacterCreationPage;
