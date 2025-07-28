import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Character } from '@/types/character';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { Save } from 'lucide-react';
import { getSubracesForRace } from '@/data/races';
import { getCharacterSteps } from '@/config/characterCreationSteps';
import { useAbilitiesRoller } from '@/hooks/useAbilitiesRoller';
import { useTheme } from '@/hooks/use-theme';
import CreationStepper from '@/components/character-creation/CreationStepper';
import CreationSidebar from '@/components/character-creation/CreationSidebar';
import CharacterCreationContent from '@/components/character-creation/CharacterCreationContent';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { AbilityRollMethod } from '@/components/character-creation/AbilityScoreMethodSelector';
import { supabase } from '@/integrations/supabase/client';
import { saveCharacter } from "@/services/supabaseCharacterService";

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { character, updateCharacter, isMagicClass, convertToCharacter, currentStep, setCurrentStep, nextStep, prevStep } = useCharacterCreation();
  const [isLoading, setIsLoading] = useState(false);
  const [abilitiesMethod, setAbilitiesMethod] = useState<AbilityRollMethod>('standard');

  const abilityRoller = useAbilitiesRoller(abilitiesMethod, character.level || 1);

  const getModifier = useCallback((score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }, []);

  const hasSubraces = useMemo(() => {
    if (!character.race) return false;
    const subraces = getSubracesForRace(character.race);
    return subraces && subraces.length > 0;
  }, [character.race]);

  const steps = useMemo(() => {
    return getCharacterSteps({ hasSubraces }).map(step => ({
      ...step,
      completed: step.id < currentStep,
      active: step.id === currentStep,
      disabled: step.id > currentStep
    }));
  }, [hasSubraces, currentStep]);

  const handleLevelChange = useCallback((level: number) => {
    updateCharacter({ level });
  }, [updateCharacter]);

  // 🔥 Удалён localStorage.getItem('character_creation_progress') — больше не нужен

  const handleSaveCharacter = useCallback(async () => {
    console.log('=== НАЧАЛО СОХРАНЕНИЯ ПЕРСОНАЖА ===');
    setIsLoading(true);
    try {
      // Проверяем авторизацию через Supabase
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Supabase пользователь:', user);

      if (!user) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth', { state: { returnPath: '/character-creation' } });
        return;
      }

      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля (Имя, Раса, Класс).",
          variant: "destructive",
        });
        return;
      }

      const characterToSave = convertToCharacter(character);
      // userId теперь устанавливается автоматически в Supabase сервисе

      // Дополнительная валидация: убеждаемся, что нет undefined значений
      if (hasUndefinedValues(characterToSave)) {
        console.warn('⚠️ Обнаружены undefined значения в персонаже:', characterToSave);
        throw new Error('Данные персонажа содержат некорректные значения');
      }

      console.log('✅ Данные персонажа для сохранения (валидированы):', characterToSave);

      const savedCharacter = await saveCharacter(characterToSave);

      if (savedCharacter && savedCharacter.id) {
        toast({
          title: "Персонаж сохранен!",
          description: "Ваш персонаж успешно сохранен.",
        });

        setTimeout(() => {
          navigate(`/character-sheet/${savedCharacter.id}`);
        }, 100);
      } else {
        toast({
          title: "Ошибка сохранения",
          description: "Не удалось сохранить персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка при сохранении персонажа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [character, convertToCharacter, navigate, toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <IconOnlyNavigation />
      <div className="flex flex-1">
        <CreationSidebar 
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <main className="flex-1 p-6">
          <CreationStepper 
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
          <CharacterCreationContent
            currentStep={currentStep}
            character={character}
            updateCharacter={updateCharacter}
            nextStep={nextStep}
            prevStep={prevStep}
            abilitiesMethod={abilitiesMethod}
            setAbilitiesMethod={setAbilitiesMethod}
            diceResults={abilityRoller.diceResults}
            getModifier={getModifier}
            rollAllAbilities={abilityRoller.rollAllAbilities}
            rollSingleAbility={abilityRoller.rollSingleAbility}
            abilityScorePoints={abilityRoller.abilityScorePoints}
            isMagicClass={isMagicClass}
            rollsHistory={abilityRoller.rollsHistory}
            onLevelChange={handleLevelChange}
            maxAbilityScore={20}
            setCurrentStep={setCurrentStep}
            onSaveCharacter={handleSaveCharacter}
          />
          {currentStep !== steps.length - 1 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveCharacter} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Сохраняем..." : "Завершить создание"}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

/**
 * Проверяет, есть ли в объекте undefined значения
 */
function hasUndefinedValues(obj: any, path = ''): boolean {
  if (obj === undefined) {
    console.log(`🔍 Найдено undefined значение в ${path}`);
    return true;
  }

  if (obj === null || typeof obj !== 'object') {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item, index) => hasUndefinedValues(item, `${path}[${index}]`));
  }

  for (const [key, value] of Object.entries(obj)) {
    if (hasUndefinedValues(value, path ? `${path}.${key}` : key)) {
      return true;
    }
  }

  return false;
}

export default CharacterCreationPage;
