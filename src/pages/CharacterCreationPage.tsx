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
import { getCurrentUid } from '@/utils/authHelpers';
import { saveCharacter as realtimeSaveCharacter } from '@/services/characterService';

import { useTheme } from '@/hooks/use-theme';
import CreationStepper from '@/components/character-creation/CreationStepper';
import CreationSidebar from '@/components/character-creation/CreationSidebar';
import CharacterCreationContent from '@/components/character-creation/CharacterCreationContent';
import { getEquipmentLength } from '@/utils/safetyUtils';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { character, updateCharacter, isMagicClass, convertToCharacter } = useCharacterCreation();
  const [races] = useState(getAllRaces());
  const [classes] = useState(getAllClasses());
  const [backgrounds] = useState(getAllBackgrounds());
  const [subracesForRace, setSubracesForRace] = useState<any[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { themeStyles } = useTheme();

  const steps = useMemo(() => [
    { id: 0, name: "Раса", completed: !!character.race },
    { id: 1, name: "Подраса", completed: !subracesForRace?.length || !!character.subrace },
    { id: 2, name: "Класс", completed: !!character.class },
    { id: 3, name: "Уровень", completed: !!character.level },
    { id: 4, name: "Характеристики", completed: true },
    { id: 5, name: "Предыстория", completed: !!character.background },
    { id: 6, name: "Здоровье", completed: !!character.maxHp },
    { id: 7, name: "Снаряжение", completed: !!character.equipment && getEquipmentLength(character.equipment) > 0 },
    { id: 8, name: "Детали", completed: !!character.name },
    { id: 9, name: "Заклинания", completed: !isMagicClass || (!!character.spells && character.spells.length > 0) },
    { id: 10, name: "Завершение", completed: false }
  ], [character, subracesForRace, isMagicClass]);

  const visibleSteps = useMemo(() => {
    return steps.filter((step) => {
      if (step.id === 1 && !subracesForRace?.length) return false;
      if (step.id === 9 && !isMagicClass) return false;
      return true;
    });
  }, [steps, subracesForRace, isMagicClass]);

  const fetchSubraces = useCallback((race: string) => {
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

  const handleSaveCharacter = useCallback(async () => {
    setIsLoading(true);
    try {
      const uid = getCurrentUid();
      if (!uid) {
        toast({ title: "Ошибка", description: "Необходимо войти в систему", variant: "destructive" });
        navigate('/auth');
        return;
      }

      if (!character.name || !character.race || !character.class) {
        toast({ title: "Ошибка", description: "Заполните имя, расу и класс", variant: "destructive" });
        return;
      }

      const characterToSave = convertToCharacter(character);
      characterToSave.userId = uid;

      const savedCharacter = await realtimeSaveCharacter(characterToSave);
      if (savedCharacter?.id) {
        toast({ title: "Персонаж сохранен", description: "Успешно сохранен" });
        setTimeout(() => navigate(`/character-sheet/${savedCharacter.id}`), 100);
      } else {
        toast({ title: "Ошибка", description: "Не удалось сохранить", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message || "Неизвестная ошибка", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [character, convertToCharacter, navigate, toast]);

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(to bottom, ${themeStyles?.accent}20, ${themeStyles?.cardBackground})`,
        color: themeStyles?.textColor
      }}
    >
      <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-md py-3 px-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: themeStyles?.accent }}>
            Создание персонажа
          </h1>
          <IconOnlyNavigation includeThemeSelector />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-4">
        <CreationStepper
          steps={visibleSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
      </div>

      <div className="container mx-auto px-4 flex gap-6">
        <CreationSidebar
          steps={visibleSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        <Card className="mt-4 flex-1 shadow-xl" style={{
          background: themeStyles?.cardBackground,
          borderColor: `${themeStyles?.accent}30`,
          color: themeStyles?.textColor
        }}>
          <CardContent className="p-6">
            <CharacterCreationContent
              currentStep={visibleSteps[currentStep]?.id || 0}
              character={character}
              updateCharacter={updateCharacter}
              nextStep={() => setCurrentStep((prev) => Math.min(prev + 1, visibleSteps.length - 1))}
              prevStep={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
              onSaveCharacter={handleSaveCharacter}
              isMagicClass={isMagicClass}
            />
            <div className="mt-6 text-right">
              <Button onClick={handleSaveCharacter} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Сохранить персонажа
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
