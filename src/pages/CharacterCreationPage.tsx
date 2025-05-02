
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Custom hooks
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { useAbilitiesRoller } from "@/hooks/useAbilitiesRoller";
import { useCreationStep } from "@/hooks/useCreationStep";

// Components
import CreationStepDisplay from "@/components/character-creation/CreationStepDisplay";
import CharacterCreationContent from "@/components/character-creation/CharacterCreationContent";

// Configuration
import { steps } from "@/config/characterCreationSteps";

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll">("standard");
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints, rollsHistory } = useAbilitiesRoller(abilitiesMethod, character.level);
  
  // Fix: Update the hook call to match the expected parameters
  const { currentStep, nextStep, prevStep, setCurrentStep } = useCreationStep({
    isMagicClass: isMagicClass(),
    characterClass: character.class,
    character: character
  });

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
    navigate('/library');
  };
  
  // Сохраняем уровень персонажа при изменении
  const handleLevelChange = (level: number) => {
    if (level >= 1 && level <= 20) {
      console.log("Уровень персонажа изменен на:", level);
      updateCharacter({ level });
    }
  };

  // Переход к последнему шагу (обзор персонажа)
  const goToFinalReview = () => {
    setCurrentStep(10);
  };

  return (
    <div className={`p-6 min-h-screen bg-background text-foreground theme-${theme}`}>
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={goToHomePage} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Button>

        <Button 
          onClick={goToHandbook} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Руководство игрока
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">Создание персонажа</h1>

      {/* Отображение прогресса по шагам */}
      <CreationStepDisplay 
        steps={steps} 
        currentStep={currentStep}
        isMagicClass={isMagicClass()}
        characterClass={character.class}
      />

      {/* Основная область контента */}
      <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-lg">
        <CharacterCreationContent 
          currentStep={currentStep}
          character={character}
          updateCharacter={updateCharacter}
          nextStep={nextStep}
          prevStep={prevStep}
          abilitiesMethod={abilitiesMethod}
          setAbilitiesMethod={setAbilitiesMethod}
          diceResults={diceResults}
          getModifier={getModifier}
          rollAllAbilities={rollAllAbilities}
          rollSingleAbility={rollSingleAbility}
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
