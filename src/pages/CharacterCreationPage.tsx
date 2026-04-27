import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Character } from '@/types/character';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { Save, Loader2 } from 'lucide-react';
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
import { saveCharacter, updateCharacter, getCharacterById } from "@/services/supabaseCharacterService";
import { hasUndefinedValues, cleanUndefinedValues } from '@/utils/cleanUndefinedValues';

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { character, updateCharacter: updateLocal, isMagicClass, convertToCharacter, currentStep, setCurrentStep, nextStep, prevStep } = useCharacterCreation();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [abilitiesMethod, setAbilitiesMethod] = useState<AbilityRollMethod>('standard');

  // ── Edit mode ────────────────────────────────────────────────────────────
  // Detect ?edit=<id> query param. When present, load existing character.
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

  useEffect(() => {
    if (!editId) return;

    const loadForEdit = async () => {
      setIsLoadingEdit(true);
      try {
        const existing = await getCharacterById(editId);
        if (!existing) {
          toast({
            title: "Персонаж не найден",
            description: `Персонаж с ID ${editId} не найден. Создаётся новый.`,
            variant: "destructive",
          });
          return;
        }
        // Pre-fill form with existing character data
        updateLocal(existing);
        setCurrentStep(0);
        toast({
          title: "Персонаж загружен",
          description: `Редактирование: ${existing.name}`,
        });
      } catch (err) {
        toast({
          title: "Ошибка загрузки",
          description: err instanceof Error ? err.message : "Не удалось загрузить персонажа для редактирования.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEdit(false);
      }
    };

    loadForEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

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
    updateLocal({ level });
  }, [updateLocal]);

  // ── Save handler (create or update) ──────────────────────────────────────
  const handleSaveCharacter = useCallback(async () => {
    setIsLoading(true);
    try {
      // Auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth', { state: { returnPath: '/character-creation' } });
        return;
      }

      // Required field validation
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля: Имя, Раса, Класс.",
          variant: "destructive",
        });
        return;
      }

      const characterToSave = convertToCharacter(character);

      // Sanitize data before write
      const finalCharacter: Character = hasUndefinedValues(characterToSave)
        ? cleanUndefinedValues(characterToSave)
        : characterToSave;

      if (isEditMode && editId) {
        // ── Edit mode: UPDATE existing record ──────────────────────────────
        const withId: Character = { ...finalCharacter, id: editId };
        await updateCharacter(withId);
        toast({
          title: "Персонаж обновлён!",
          description: `${finalCharacter.name} успешно сохранён.`,
        });
        setTimeout(() => navigate(`/character-sheet/${editId}`), 100);
      } else {
        // ── Create mode: INSERT new record ─────────────────────────────────
        const savedCharacter = await saveCharacter(finalCharacter);
        if (savedCharacter && savedCharacter.id) {
          // Clear creation progress from localStorage once saved to Supabase
          localStorage.removeItem('character_creation_progress');
          toast({
            title: "Персонаж создан!",
            description: `${savedCharacter.name} успешно сохранён.`,
          });
          setTimeout(() => navigate(`/character-sheet/${savedCharacter.id}`), 100);
        } else {
          toast({
            title: "Ошибка сохранения",
            description: "Не удалось сохранить персонажа. Попробуйте ещё раз.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [character, convertToCharacter, navigate, toast, isEditMode, editId]);

  // ── Loading state while fetching character for edit ──────────────────────
  if (isLoadingEdit) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Загрузка персонажа для редактирования…</p>
      </div>
    );
  }

  const saveLabel = isEditMode ? 'Сохранить изменения' : 'Завершить создание';

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
          {isEditMode && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
              ✏️ Режим редактирования — изменения будут сохранены в существующий персонаж
            </div>
          )}
          <CreationStepper
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
          <CharacterCreationContent
            currentStep={currentStep}
            character={character}
            updateCharacter={updateLocal}
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
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Сохраняем…</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />{saveLabel}</>
                )}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
