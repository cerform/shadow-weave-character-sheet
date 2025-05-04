
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader } from "lucide-react";
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier, handleLevelChange, 
          getAbilityScorePointsByLevel, resetCharacter } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints: baseAbilityScorePoints, 
          rollsHistory } = useAbilitiesRoller(abilitiesMethod, character.level);
  
  // Расчет очков характеристик с учетом уровня
  const [adjustedAbilityScorePoints, setAdjustedAbilityScorePoints] = useState<number>(baseAbilityScorePoints);
  
  // Обновляем количество очков характеристик при изменении уровня
  useEffect(() => {
    const calculatedPoints = getAbilityScorePointsByLevel(baseAbilityScorePoints);
    setAdjustedAbilityScorePoints(calculatedPoints);
    console.log(`Уровень: ${character.level}, доступные очки: ${calculatedPoints}`);
    
    return () => {
      // Очистка при размонтировании
      console.log("Очистка эффекта расчета очков характеристик");
    };
  }, [character.level, baseAbilityScorePoints, getAbilityScorePointsByLevel]);
  
  // Обновляем конфигурацию хука useCreationStep с актуальной информацией о классе
  const { currentStep, nextStep, prevStep, setCurrentStep, visibleSteps, resetStep } = useCreationStep({
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
    
    return () => {
      // Очистка при размонтировании
      console.log("Очистка эффекта максимального значения характеристик");
    };
  }, [character.level]);

  // Тема для отображения
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Функция для безопасной навигации на главную страницу
  const navigateToHome = useCallback(() => {
    setIsNavigating(true);
    
    // Показываем уведомление о переходе
    toast({
      title: "Переход на главную",
      description: "Данные создания персонажа будут сброшены...",
    });
    
    // Сбрасываем состояния перед навигацией
    resetCharacter();
    resetStep();
    
    // Даем время на завершение всех операций и анимацию
    setTimeout(() => {
      navigate('/');
      setIsNavigating(false);
    }, 500);
  }, [navigate, resetCharacter, resetStep, toast]);
  
  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      console.log("Страница создания персонажа размонтирована");
      // Здесь можно добавить дополнительную очистку ресурсов при необходимости
    };
  }, []);
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="min-h-screen w-full p-6">
        <div className="flex justify-between items-center mb-4">
          {isNavigating ? (
            <Button
              variant="default"
              disabled
              className="flex items-center gap-2"
            >
              <Loader className="size-4 animate-spin" />
              Возвращаемся...
            </Button>
          ) : (
            <HomeButton variant="default" />
          )}

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/handbook')} 
              variant="outline" 
              className="flex items-center gap-2 bg-black/60 border-gray-600 text-white hover:bg-black/80"
              disabled={isNavigating}
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
          className={`max-w-4xl mx-auto p-6 rounded-lg shadow-lg ${isNavigating ? 'opacity-50' : 'animate-fade-in'}`}
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isNavigating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="size-8 animate-spin mb-4" />
              <p className="text-white text-xl">Переход на главную страницу...</p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
