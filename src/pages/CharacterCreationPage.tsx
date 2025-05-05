
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Character } from '@/types/character';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { useCreationStep } from '@/hooks/useCreationStep';
import { Step } from '@/types/characterCreation';
import CharacterBasics from '@/components/character-creation/CharacterBasics';
import CharacterRaceSelection from '@/components/character-creation/CharacterRaceSelection';
import CharacterSubraceSelection from '@/components/character-creation/CharacterSubraceSelection';
import CharacterClass from '@/components/character-creation/CharacterClass';
import CharacterAbilities from '@/components/character-creation/CharacterAbilities';
import CharacterBackground from '@/components/character-creation/CharacterBackground';
import CharacterEquipment from '@/components/character-creation/CharacterEquipment';
import CharacterSpells from '@/components/character-creation/CharacterSpells';
import CharacterSummary from '@/components/character-creation/CharacterSummary';
import { getAllRaces, getSubracesForRace } from '@/data/races';
import { getAllClasses } from '@/data/classes';
import { getAllBackgrounds } from '@/data/backgrounds';
import { createCharacter } from '@/lib/supabase';
import { getCurrentUid } from '@/utils/authHelpers';
import ThemeSelector from '@/components/ThemeSelector';
import FloatingDiceButton from '@/components/dice/FloatingDiceButton';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Определение шагов процесса создания персонажа
const characterCreationSteps: Step[] = [
  {
    id: 'basics',
    title: 'Основная информация',
    description: 'Основные данные персонажа'
  },
  {
    id: 'race',
    title: 'Раса',
    description: 'Выбор расы персонажа'
  },
  {
    id: 'subrace',
    title: 'Разновидность',
    description: 'Выбор подрасы персонажа',
    requiresSubraces: true
  },
  {
    id: 'class',
    title: 'Класс',
    description: 'Выбор класса персонажа'
  },
  {
    id: 'abilities',
    title: 'Характеристики',
    description: 'Распределение характеристик'
  },
  {
    id: 'background',
    title: 'Предыстория',
    description: 'Выбор предыстории персонажа'
  },
  {
    id: 'equipment',
    title: 'Снаряжение',
    description: 'Выбор снаряжения'
  },
  {
    id: 'spells',
    title: 'Заклинания',
    description: 'Выбор заклинаний',
    requiresMagicClass: true
  },
  {
    id: 'summary',
    title: 'Завершение',
    description: 'Просмотр и сохранение персонажа'
  }
];

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { character, updateCharacter, isMagicClass, convertToCharacter } = useCharacterCreation();
  const [races, setRaces] = useState(getAllRaces());
  const [classes, setClasses] = useState(getAllClasses());
  const [backgrounds, setBackgrounds] = useState(getAllBackgrounds());
  const [subracesForRace, setSubracesForRace] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Получаем текущую тему
  const { theme, themeStyles } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themeStyles || themes[themeKey] || themes.default;

  // Функция для получения подрас на основе выбранной расы
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

  const { currentStep, nextStep, prevStep, visibleSteps } = useCreationStep({
    steps: characterCreationSteps,
    hasSubraces: Boolean(subracesForRace?.length),
    isMagicClass: isMagicClass()
  });

  // Проверка, можно ли перейти к следующему шагу
  const canProceedToNextStep = () => {
    switch (visibleSteps[currentStep]?.id) {
      case 'basics':
        return !!character.name?.trim();
      case 'race':
        return !!character.race;
      case 'subrace':
        // Автоматически разрешаем переход, если выбрана подраса или нет подрас
        return !Boolean(subracesForRace?.length) || !!character.subrace;
      case 'class':
        return !!character.class;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (visibleSteps[currentStep]?.id) {
      case 'basics':
        return <CharacterBasics character={character} onUpdate={updateCharacter} />;
      case 'race':
        return <CharacterRaceSelection 
                character={character} 
                updateCharacter={updateCharacter} 
                nextStep={nextStep}
                prevStep={prevStep}
              />;
      case 'subrace':
        return <CharacterSubraceSelection 
                character={character} 
                updateCharacter={updateCharacter}
                nextStep={nextStep}
                prevStep={prevStep}
              />;
      case 'class':
        return <CharacterClass classes={classes} character={character} onUpdate={updateCharacter} />;
      case 'abilities':
        return <CharacterAbilities character={character} onUpdate={updateCharacter} />;
      case 'background':
        return <CharacterBackground 
          character={character} 
          onUpdate={updateCharacter} 
          backgrounds={backgrounds} 
        />;
      case 'equipment':
        return <CharacterEquipment character={character} onUpdate={updateCharacter} />;
      case 'spells':
        return <CharacterSpells character={character} onUpdate={updateCharacter} />;
      case 'summary':
        return <CharacterSummary character={character} />
      default:
        return <div>Шаг не найден</div>;
    }
  };

  const handleSaveCharacter = async () => {
    setIsLoading(true);
    try {
      const uid = getCurrentUid();
      if (!uid) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Проверяем, что все обязательные поля заполнены
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля (Имя, Раса, Класс).",
          variant: "destructive",
        });
        return;
      }

      // Подготавливаем персонажа к сохранению
      const characterToSave = convertToCharacter(character);

      // Сохраняем персонажа в базу данных
      const newCharacter = await createCharacter(characterToSave);

      if (newCharacter) {
        toast({
          title: "Персонаж сохранен!",
          description: "Ваш персонаж успешно сохранен.",
        });
        navigate(`/character-sheet/${newCharacter.id}`);
      } else {
        toast({
          title: "Ошибка сохранения",
          description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении персонажа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-4"
      style={{ 
        background: `linear-gradient(to bottom, ${currentTheme.accent}20, ${currentTheme.cardBackground || 'rgba(0, 0, 0, 0.85)'})`,
        color: currentTheme.textColor 
      }}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: currentTheme.accent }}>
            Создание персонажа
          </h1>
          
          <div className="flex space-x-2">
            <ThemeSelector />
          </div>
        </div>

        <Card 
          className="mb-4"
          style={{ 
            background: currentTheme.cardBackground, 
            borderColor: `${currentTheme.accent}30`,
            color: currentTheme.textColor 
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: currentTheme.accent }}>{visibleSteps[currentStep]?.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Показываем кнопки навигации только для шагов, которые не имеют собственных кнопок */}
        {['basics', 'class', 'abilities', 'background', 'equipment', 'spells', 'summary'].includes(visibleSteps[currentStep]?.id) && (
          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button 
                onClick={prevStep} 
                variant="outline"
                style={{ 
                  borderColor: currentTheme.accent,
                  color: currentTheme.textColor 
                }}
              >
                Назад
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < visibleSteps.length - 1 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!canProceedToNextStep()}
                  style={{ 
                    backgroundColor: currentTheme.accent,
                    color: '#FFFFFF'
                  }}
                >
                  Далее
                </Button>
              ) : (
                <Button 
                  onClick={handleSaveCharacter} 
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: currentTheme.accent,
                    color: '#FFFFFF'
                  }}
                >
                  Сохранить персонажа
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <FloatingDiceButton />
    </div>
  );
};

export default CharacterCreationPage;
