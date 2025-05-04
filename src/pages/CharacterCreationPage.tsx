
import React, { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
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
import HomeButton from "@/components/navigation/HomeButton";

// Configuration
import { steps } from "@/config/characterCreationSteps";
import { ABILITY_SCORE_CAPS } from "@/types/character.d";

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier, handleLevelChange, getAbilityScorePointsByLevel } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints: baseAbilityScorePoints, rollsHistory } = useAbilitiesRoller(abilitiesMethod, character.level);
  
  // Расчет очков характеристик с учетом уровня
  const [adjustedAbilityScorePoints, setAdjustedAbilityScorePoints] = useState<number>(baseAbilityScorePoints);
  
  // Обновляем количество очков характеристик при изменении уровня
  useEffect(() => {
    const calculatedPoints = getAbilityScorePointsByLevel(baseAbilityScorePoints);
    setAdjustedAbilityScorePoints(calculatedPoints);
    console.log(`Уровень: ${character.level}, доступные очки: ${calculatedPoints}`);
  }, [character.level, baseAbilityScorePoints, getAbilityScorePointsByLevel]);
  
  // Обновляем конфигурацию хука useCreationStep с актуальной информацией о классе
  const { currentStep, nextStep, prevStep, setCurrentStep, visibleSteps } = useCreationStep({
    isMagicClass: isMagicClass()
  });

  // Определяем максимальное значение для характеристик на основе уровня
  const [maxAbilityScore, setMaxAbilityScore] = useState<number>(ABILITY_SCORE_CAPS.BASE_CAP);
  
  // Обновляем максимальное значение при изменении уровня
  useEffect(() => {
    if (character.level >= 16) {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.LEGENDARY_CAP);
    } else if (character.level >= 10) {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.EPIC_CAP);
    } else {
      setMaxAbilityScore(ABILITY_SCORE_CAPS.BASE_CAP);
    }
  }, [character.level]);

  // Тема для отображения
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  // Упрощенная навигация в руководство игрока
  const goToHandbook = () => {
    navigate('/handbook');
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="min-h-screen w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <HomeButton />

          <div className="flex items-center gap-2">
            <Button 
              onClick={goToHandbook} 
              variant="outline" 
              className="flex items-center gap-2 bg-black/60 border-gray-600 text-white hover:bg-black/80"
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
            className="text-3xl font-bold mb-8 text-center text-white"
          >
            Создание персонажа
          </h1>
          
          {/* Show theme selector on larger screens in a more prominent position */}
          <div className="hidden sm:block mb-8">
            <ThemeSelector />
          </div>
        </div>

        <div className="mb-8">
          <CreationStepDisplay 
            steps={steps} 
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            isMagicClass={isMagicClass()}
          />
        </div>

        <div 
          className="max-w-4xl mx-auto p-6 rounded-lg shadow-lg animate-fade-in"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
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
            abilityScorePoints={adjustedAbilityScorePoints}
            isMagicClass={isMagicClass()}
            rollsHistory={rollsHistory}
            onLevelChange={handleLevelChange}
            maxAbilityScore={maxAbilityScore}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
