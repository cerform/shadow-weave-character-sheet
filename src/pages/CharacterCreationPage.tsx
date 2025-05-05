
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { BookOpen, Save, DownloadIcon, UploadIcon, Undo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { themes } from "@/lib/themes";
import { motion, AnimatePresence } from "framer-motion";

// Custom hooks
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { useAbilitiesRoller } from "@/hooks/useAbilitiesRoller";
import { useCreationStep } from "@/hooks/useCreationStep";

// Components
import CreationStepDisplay from "@/components/character-creation/CreationStepDisplay";
import CharacterCreationContent from "@/components/character-creation/CharacterCreationContent";
import ThemeSelector from "@/components/ThemeSelector";
import HomeButton from "@/components/navigation/HomeButton";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Configuration
import { ABILITY_SCORE_CAPS } from "@/types/character";
import { Step } from "@/types/characterCreation";

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [hasValidationErrors, setHasValidationErrors] = useState<boolean>(false);
  const [validationMessages, setValidationMessages] = useState<{[key: string]: string}>({});
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier, handleLevelChange, getAbilityScorePointsByLevel } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints: baseAbilityScorePoints, rollsHistory } = useAbilitiesRoller(abilitiesMethod, character.level);
  
  // Расчет очков характеристик с учетом уровня
  const [adjustedAbilityScorePoints, setAdjustedAbilityScorePoints] = useState<number>(baseAbilityScorePoints);
  
  // Проверяем наличие подрас для выбранной расы
  const [hasSubraces, setHasSubraces] = useState<boolean>(false);
  
  // Обновляем флаг наличия подрас при изменении расы
  useEffect(() => {
    if (character.race) {
      const { races } = require('@/data/races');
      const raceData = races.find((r: any) => r.name === character.race);
      setHasSubraces(!!(raceData?.subRaces && raceData.subRaces.length > 0));
    } else {
      setHasSubraces(false);
    }
  }, [character.race]);
  
  // Обновляем количество очков характеристик при изменении уровня
  useEffect(() => {
    const calculatedPoints = getAbilityScorePointsByLevel(baseAbilityScorePoints);
    setAdjustedAbilityScorePoints(calculatedPoints);
  }, [character.level, baseAbilityScorePoints, getAbilityScorePointsByLevel]);
  
  // Обновляем конфигурацию хука useCreationStep с актуальной информацией о классе и подрасах
  const { currentStep, nextStep, prevStep, setCurrentStep, visibleSteps } = useCreationStep({
    hasSubraces: hasSubraces,
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

  // Локальное сохранение черновика
  useEffect(() => {
    const saveDraft = () => {
      localStorage.setItem('character-draft', JSON.stringify(character));
    };
    
    // Автосохранение каждые 30 секунд
    const intervalId = setInterval(saveDraft, 30000);
    
    // Сохранение при покидании страницы
    window.addEventListener('beforeunload', saveDraft);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', saveDraft);
    };
  }, [character]);
  
  // Загрузка черновика
  const loadDraft = useCallback(() => {
    const savedDraft = localStorage.getItem('character-draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        updateCharacter(parsedDraft);
        toast({
          title: "Черновик загружен",
          description: "Персонаж успешно восстановлен из черновика.",
        });
      } catch (e) {
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить черновик персонажа.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Черновик не найден",
        description: "Сохраненный черновик персонажа отсутствует.",
        variant: "destructive"
      });
    }
  }, [updateCharacter, toast]);
  
  // Ручное сохранение черновика
  const saveDraft = useCallback(() => {
    localStorage.setItem('character-draft', JSON.stringify(character));
    toast({
      title: "Черновик сохранен",
      description: "Персонаж успешно сохранен в черновик.",
    });
  }, [character, toast]);
  
  // Экспорт персонажа в JSON
  const exportCharacter = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${character.name || 'character'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Экспорт завершен",
      description: "Персонаж успешно экспортирован в JSON.",
    });
  }, [character, toast]);
  
  // Импорт персонажа из JSON
  const importCharacter = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target?.result as string);
            updateCharacter(json);
            toast({
              title: "Импорт завершен",
              description: "Персонаж успешно импортирован из JSON.",
            });
          } catch (e) {
            toast({
              title: "Ошибка импорта",
              description: "Не удалось импортировать персонажа из файла.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  }, [updateCharacter, toast]);
  
  // Функция для валидации текущего шага
  const validateCurrentStep = useCallback(() => {
    const errors: {[key: string]: string} = {};
    
    switch (currentStep) {
      case 0: // Race selection
        if (!character.race) errors.race = "Выберите расу персонажа";
        break;
      case 1: // Subrace selection
        if (hasSubraces && !character.subrace) errors.subrace = "Выберите подрасу персонажа";
        break;
      case 2: // Class selection
        if (!character.class) errors.class = "Выберите класс персонажа";
        break;
      case 8: // Character details
        if (!character.name) errors.name = "Введите имя персонажа";
        break;
    }
    
    setValidationMessages(errors);
    setHasValidationErrors(Object.keys(errors).length > 0);
    
    return Object.keys(errors).length === 0;
  }, [currentStep, character, hasSubraces]);
  
  // Проверяем валидацию при изменении текущего шага или персонажа
  useEffect(() => {
    validateCurrentStep();
  }, [currentStep, character, validateCurrentStep]);
  
  // Тема для отображения
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Рассчитываем прогресс создания персонажа
  const progressPercentage = ((currentStep + 1) / visibleSteps.length) * 100;
  
  // Функция для перехода к следующему шагу с валидацией
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep();
    } else {
      // Отображаем сообщение об ошибке
      toast({
        title: "Необходимо заполнить все поля",
        description: Object.values(validationMessages).join(", "),
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="min-h-screen w-full p-4 md:p-6">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <HomeButton variant="default" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => navigate('/handbook')} 
                    variant="outline" 
                    className="flex items-center gap-2 bg-black/60 border-gray-600 text-white hover:bg-black/80"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Руководство игрока</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Открыть руководство игрока
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Actions Panel */}
          <div className="flex items-center gap-2 flex-wrap">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={saveDraft} 
                    variant="outline" 
                    size="icon"
                    className="bg-black/60 border-gray-600 text-white hover:bg-black/80"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Сохранить черновик
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={loadDraft} 
                    variant="outline" 
                    size="icon"
                    className="bg-black/60 border-gray-600 text-white hover:bg-black/80"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Загрузить черновик
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={exportCharacter} 
                    variant="outline" 
                    size="icon"
                    className="bg-black/60 border-gray-600 text-white hover:bg-black/80"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Экспорт персонажа
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={importCharacter} 
                    variant="outline" 
                    size="icon"
                    className="bg-black/60 border-gray-600 text-white hover:bg-black/80"
                  >
                    <UploadIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Импорт персонажа
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <ThemeSelector />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 
            className="text-3xl font-bold mb-6 text-center text-white"
          >
            Создание персонажа
          </h1>
          
          {/* Preview Toggle */}
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="mb-6 bg-black/60 border-gray-600 text-white hover:bg-black/80"
          >
            {showPreview ? "Скрыть превью" : "Показать превью"}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-300">Прогресс создания</span>
            <span className="text-gray-300">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step navigation */}
        <div className="mb-8">
          <CreationStepDisplay 
            steps={visibleSteps as Step[]} 
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            isMagicClass={isMagicClass()}
            hasSubraces={hasSubraces}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content area */}
          <motion.div 
            className={`${showPreview ? "lg:w-2/3" : "w-full"} p-6 rounded-lg shadow-lg animate-fade-in`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
              nextStep={handleNextStep}
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
            
            {/* Validation errors */}
            {hasValidationErrors && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
                <h3 className="text-red-400 font-semibold mb-2">Необходимо заполнить:</h3>
                <ul className="list-disc list-inside text-red-300">
                  {Object.entries(validationMessages).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
          
          {/* Character Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div 
                className="lg:w-1/3 p-6 rounded-lg shadow-lg bg-black/50 border border-gray-800"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">
                  Превью персонажа
                </h2>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <span className="text-gray-400 block text-sm">Имя</span>
                    <span className="text-xl font-medium text-white">{character.name || "Безымянный герой"}</span>
                  </div>
                  
                  {/* Race & Class */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1">
                      <span className="text-gray-400 block text-sm">Раса</span>
                      <span className="text-lg text-white">{character.race || "—"}</span>
                      {character.subrace && (
                        <span className="text-sm text-gray-300 block">{character.subrace}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-400 block text-sm">Класс</span>
                      <span className="text-lg text-white">{character.class || "—"}</span>
                      {character.subclass && (
                        <span className="text-sm text-gray-300 block">{character.subclass}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Level */}
                  <div>
                    <span className="text-gray-400 block text-sm">Уровень</span>
                    <span className="text-lg text-white">{character.level || 1}</span>
                  </div>
                  
                  {/* Ability Scores */}
                  <div>
                    <span className="text-gray-400 block text-sm mb-2">Характеристики</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "СИЛ", value: character.strength },
                        { name: "ЛВК", value: character.dexterity },
                        { name: "ТЕЛ", value: character.constitution },
                        { name: "ИНТ", value: character.intelligence },
                        { name: "МДР", value: character.wisdom },
                        { name: "ХАР", value: character.charisma }
                      ].map((ability) => (
                        <div 
                          key={ability.name} 
                          className="bg-gray-800/50 p-2 rounded-lg text-center"
                        >
                          <div className="text-gray-400 text-xs">{ability.name}</div>
                          <div className="text-white text-xl">{ability.value || 10}</div>
                          <div className="text-gray-300 text-xs">
                            {getModifier(ability.value || 10)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Background */}
                  {character.background && (
                    <div>
                      <span className="text-gray-400 block text-sm">Предыстория</span>
                      <span className="text-lg text-white">{character.background}</span>
                    </div>
                  )}
                  
                  {/* Alignment */}
                  {character.alignment && (
                    <div>
                      <span className="text-gray-400 block text-sm">Мировоззрение</span>
                      <span className="text-lg text-white">{character.alignment}</span>
                    </div>
                  )}
                  
                  {/* Health */}
                  <div>
                    <span className="text-gray-400 block text-sm">Здоровье</span>
                    <span className="text-lg text-white">{character.currentHp || 0} / {character.maxHp || 0}</span>
                  </div>
                  
                  {/* Armor Class */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-gray-400 block text-sm">Класс Доспеха</span>
                      <span className="text-lg text-white">{character.armorClass || 10}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-400 block text-sm">Скорость</span>
                      <span className="text-lg text-white">{character.speed || "30 фт"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
