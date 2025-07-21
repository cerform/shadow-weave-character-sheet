import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Character } from '@/types/character';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { Save } from 'lucide-react';
import { getAllRaces, getSubracesForRace } from '@/data/races';
import { getAllClasses } from '@/data/classes';
import { getAllBackgrounds } from '@/data/backgrounds';
import { useCharacterOperations } from '@/hooks/useCharacterOperations';
import { getCurrentUid } from '@/utils/authHelpers';

import { useTheme } from '@/hooks/use-theme';
import CreationStepper from '@/components/character-creation/CreationStepper';
import CreationSidebar from '@/components/character-creation/CreationSidebar';
import CharacterCreationContent from '@/components/character-creation/CharacterCreationContent';
import { getEquipmentLength } from '@/utils/safetyUtils';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveCharacter } = useCharacterOperations();
  const { character, updateCharacter, isMagicClass, convertToCharacter } = useCharacterCreation();
  const [races] = useState(getAllRaces());
  const [classes] = useState(getAllClasses());
  const [backgrounds] = useState(getAllBackgrounds());
  const [subracesForRace, setSubracesForRace] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  const [diceResults, setDiceResults] = useState<number[][]>(Array(6).fill(null).map(() => []));
  const [abilityScorePoints, setAbilityScorePoints] = useState(27);
  const [rollsHistory, setRollsHistory] = useState<{ ability: string; rolls: number[]; total: number }[]>([]);
  const [maxAbilityScore, setMaxAbilityScore] = useState(15);
  
  // Get current theme - вызываем один раз и запоминаем значения, чтобы избежать мерцания
  const { themeStyles } = useTheme();
  
  // Кешируем стили для избежания мерцания
  const pageBackground = useMemo(() => `linear-gradient(to bottom, ${themeStyles?.accent}20, ${themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.85)'})`, [themeStyles]);
  const pageColor = useMemo(() => themeStyles?.textColor, [themeStyles]);
  const cardBackground = useMemo(() => themeStyles?.cardBackground || 'rgba(0, 0, 0, 0.8)', [themeStyles]);
  const cardBorderColor = useMemo(() => `${themeStyles?.accent}30`, [themeStyles]);
  const accentColor = useMemo(() => themeStyles?.accent, [themeStyles]);

  // Fetch subraces based on selected race
  const fetchSubraces = useCallback(async (race: string) => {
    const subraces = getSubracesForRace(race);
    setSubracesForRace(subraces);
  }, []);

  useEffect(() => {
    if (character.race) {
      fetchSubraces(character.race);
    } else {
      setSubracesForRace(null);
    }
  }, [character.race, fetchSubraces]);

  // Define steps for the character creation process
  const steps = useMemo(() => {
    return [
      { 
        id: 0, 
        name: "Раса", 
        description: "Выбор расы персонажа",
        completed: !!character.race
      },
      { 
        id: 1, 
        name: "Подраса", 
        description: "Выбор подрасы персонажа",
        completed: !subracesForRace?.length || !!character.subrace
      },
      { 
        id: 2, 
        name: "Класс", 
        description: "Выбор класса персонажа",
        completed: !!character.class
      },
      { 
        id: 3, 
        name: "Уровень", 
        description: "Выбор уровня персонажа",
        completed: !!character.level
      },
      { 
        id: 4, 
        name: "Характеристики", 
        description: "Распределение характеристик",
        completed: character.strength !== 10 || 
                 character.dexterity !== 10 || 
                 character.constitution !== 10 || 
                 character.intelligence !== 10 || 
                 character.wisdom !== 10 || 
                 character.charisma !== 10
      },
      { 
        id: 5, 
        name: "Предыстория", 
        description: "Выбор предыстории персонажа",
        completed: !!character.background
      },
      { 
        id: 6, 
        name: "Здоровье", 
        description: "Определение очков здоровья",
        completed: !!character.maxHp && character.maxHp > 0
      },
      { 
        id: 7, 
        name: "Снаряжение", 
        description: "Выбор снаряжения",
        completed: !!character.equipment && getEquipmentLength(character.equipment) > 0
      },
      { 
        id: 8, 
        name: "Детали", 
        description: "Персональные детали",
        completed: !!character.name
      },
      { 
        id: 9, 
        name: "Заклинания", 
        description: "Выбор заклинаний",
        completed: !isMagicClass || (!!character.spells && character.spells.length > 0)
      },
      { 
        id: 10, 
        name: "Завершение", 
        description: "Проверка и сохранение персонажа",
        completed: false
      }
    ];
  }, [character, subracesForRace, isMagicClass]);

  // Filter steps if needed (for example, skip subrace step if no subraces)
  const visibleSteps = useMemo(() => {
    return steps.filter((step) => {
      // Skip subrace step if race has no subraces
      if (step.id === 1 && !subracesForRace?.length) {
        return false;
      }
      
      // Skip spells step if class isn't magical
      if (step.id === 9 && !isMagicClass) {
        return false;
      }
      
      return true;
    });
  }, [steps, subracesForRace, isMagicClass]);

  // Get modifier function
  const getModifier = useCallback((abilityScore: number): string => {
    const mod = Math.floor((abilityScore - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }, []);

  // Roll abilities functions
  const rollSingleAbility = useCallback((index: number) => {
    // Roll 4d6, drop lowest
    const rolls = Array(4).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    const total = rolls[0] + rolls[1] + rolls[2];
    
    // Update dice results
    const newDiceResults = [...diceResults];
    newDiceResults[index] = rolls;
    setDiceResults(newDiceResults);
    
    return { rolls, total };
  }, [diceResults]);

  const rollAllAbilities = useCallback(() => {
    const newDiceResults: number[][] = [];
    const abilities = ["Сила", "Ловкость", "Телосложение", "Интеллект", "Мудрость", "Харизма"];
    const history: { ability: string; rolls: number[]; total: number }[] = [];
    
    const stats = {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };
    
    abilities.forEach((ability, index) => {
      const { rolls, total } = rollSingleAbility(index);
      newDiceResults.push(rolls);
      
      // Add to history
      history.push({
        ability,
        rolls,
        total
      });
      
      // Set stats
      if (index === 0) stats.strength = total;
      else if (index === 1) stats.dexterity = total;
      else if (index === 2) stats.constitution = total;
      else if (index === 3) stats.intelligence = total;
      else if (index === 4) stats.wisdom = total;
      else if (index === 5) stats.charisma = total;
    });
    
    setDiceResults(newDiceResults);
    setRollsHistory(history);
    
    // Update character stats
    updateCharacter({ 
      stats,
      strength: stats.strength,
      dexterity: stats.dexterity,
      constitution: stats.constitution,
      intelligence: stats.intelligence,
      wisdom: stats.wisdom,
      charisma: stats.charisma
    });
  }, [rollSingleAbility, updateCharacter]);

  // Handle level change
  const handleLevelChange = useCallback((level: number) => {
    updateCharacter({ level });
    
    // Adjust max ability score based on level
    if (level >= 16) {
      setMaxAbilityScore(30);
    } else if (level >= 10) {
      setMaxAbilityScore(22);
    } else {
      setMaxAbilityScore(20);
    }
    
    // Adjust ability score points based on level
    let points = 27;
    if (level >= 5) points += 3;
    if (level >= 10) points += 2;
    if (level >= 15) points += 2;
    
    setAbilityScorePoints(points);
  }, [updateCharacter]);

  // Handle next and previous step navigation
  const nextStep = useCallback(() => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, visibleSteps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Handle save character
  const handleSaveCharacter = useCallback(async () => {
    console.log('=== НАЧАЛО СОХРАНЕНИЯ ПЕРСОНАЖА ===');
    setIsLoading(true);
    try {
      const uid = getCurrentUid();
      console.log('UID пользователя:', uid);
      
      if (!uid) {
        console.log('Пользователь не авторизован, перенаправляем на страницу входа');
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check required fields
      console.log('Проверяем обязательные поля:', {
        name: character.name,
        race: character.race,
        class: character.class
      });
      
      if (!character.name || !character.race || !character.class) {
        console.log('Не заполнены обязательные поля');
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля (Имя, Раса, Класс).",
          variant: "destructive",
        });
        return;
      }

      // Prepare character for saving
      console.log('Подготавливаем персонажа для сохранения...');
      const characterToSave = convertToCharacter(character);
      
      // Добавляем userId к персонажу
      characterToSave.userId = uid;
      
      console.log('Данные персонажа для сохранения:', characterToSave);

      // Save character using Firebase
      console.log('Сохраняем персонажа через Firebase...');
      const { saveCharacter: firestoreSaveCharacter } = await import('@/services/firebase/firestore');
      const characterId = await firestoreSaveCharacter(characterToSave);

      console.log('Персонаж сохранен с ID:', characterId);

      if (characterId) {
        console.log('Сохранение успешно, показываем уведомление и перенаправляем');
        toast({
          title: "Персонаж сохранен!",
          description: "Ваш персонаж успешно сохранен.",
        });
        
        // Небольшая задержка перед переходом для показа toast
        setTimeout(() => {
          navigate(`/character-sheet/${characterId}`);
        }, 100);
      } else {
        console.log('Не получен ID персонажа');
        toast({
          title: "Ошибка сохранения",
          description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("=== ОШИБКА ПРИ СОХРАНЕНИИ ПЕРСОНАЖА ===");
      console.error("Детали ошибки:", error);
      console.error("Тип ошибки:", typeof error);
      console.error("Стек ошибки:", error instanceof Error ? error.stack : 'Нет стека');
      
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка при сохранении персонажа.",
        variant: "destructive",
      });
    } finally {
      console.log('=== ЗАВЕРШЕНИЕ СОХРАНЕНИЯ ПЕРСОНАЖА ===');
      setIsLoading(false);
    }
  }, [character, convertToCharacter, navigate, toast]);

  // Calculate whether 'Next' button should be allowed based on current step
  const canProceedToNextStep = useMemo(() => {
    const step = visibleSteps[currentStep];
    if (!step) return false;
    return step.completed;
  }, [visibleSteps, currentStep]);

  return (
    <div 
      className="min-h-screen pb-20"
      style={{ 
        background: pageBackground,
        color: pageColor 
      }}
    >
      {/* Header with Navigation Icons - ThemeSelector included in IconOnlyNavigation */}
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md py-3 px-4 border-b border-gray-800">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: accentColor }}>
              Создание персонажа
            </h1>
            
            <div className="flex items-center space-x-4">
              <IconOnlyNavigation includeThemeSelector={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="container mx-auto px-4 mt-4">
        <CreationStepper 
          steps={visibleSteps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep} 
        />
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 flex gap-6">
        {/* Sidebar */}
        <CreationSidebar 
          steps={visibleSteps} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep} 
        />
        
        {/* Content Area */}
        <Card 
          className="mt-4 flex-1 rounded-lg overflow-hidden shadow-xl animate-fade-in"
          style={{ 
            background: cardBackground,
            borderColor: cardBorderColor,
            color: pageColor 
          }}
        >
          <CardContent className="p-6">
            <CharacterCreationContent
              currentStep={visibleSteps[currentStep]?.id || 0}
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
              isMagicClass={isMagicClass}
              rollsHistory={rollsHistory}
              onLevelChange={handleLevelChange}
              maxAbilityScore={maxAbilityScore}
              setCurrentStep={setCurrentStep}
              onSaveCharacter={handleSaveCharacter}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Добавляем только одну кнопку Dice Button */}
      
    </div>
  );
};

export default CharacterCreationPage;
