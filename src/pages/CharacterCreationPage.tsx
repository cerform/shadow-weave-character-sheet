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
import { saveCharacter as realtimeSaveCharacter } from '@/services/characterService';

import { useTheme } from '@/hooks/use-theme';
import CreationStepper from '@/components/character-creation/CreationStepper';
import CreationSidebar from '@/components/character-creation/CreationSidebar';
import CharacterCreationContent from '@/components/character-creation/CharacterCreationContent';
import { getEquipmentLength } from '@/utils/safetyUtils';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { AbilityRollMethod } from '@/components/character-creation/AbilityScoreMethodSelector';

const CharacterCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveCharacter } = useCharacterOperations();
  const { character, updateCharacter, isMagicClass, convertToCharacter } = useCharacterCreation();
  const [isLoading, setIsLoading] = useState(false);

  // 🔧 Управление методом распределения характеристик
  const [abilitiesMethod, setAbilitiesMethod] = useState<AbilityRollMethod>('standard');

  const handleSaveCharacter = useCallback(async () => {
    console.log('=== НАЧАЛО СОХРАНЕНИЯ ПЕРСОНАЖА ===');
    setIsLoading(true);
    try {
      const uid = getCurrentUid();
      console.log('UID пользователя:', uid);

      if (!uid) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему для сохранения персонажа.",
          variant: "destructive",
        });
        navigate('/auth');
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
      characterToSave.userId = uid;

      console.log('Данные персонажа для сохранения:', characterToSave);

      const savedCharacter = await realtimeSaveCharacter(characterToSave);

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
        <CreationSidebar />
        <main className="flex-1 p-6">
          <CreationStepper />
          <CharacterCreationContent
            character={character}
            updateCharacter={updateCharacter}
            isMagicClass={isMagicClass}
            abilitiesMethod={abilitiesMethod}
            setAbilitiesMethod={setAbilitiesMethod}
          />
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveCharacter} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Сохраняем..." : "Завершить создание"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CharacterCreationPage;
