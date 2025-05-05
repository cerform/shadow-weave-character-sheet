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
import CharacterRace from '@/components/character-creation/CharacterRace';
import CharacterSubrace from '@/components/character-creation/CharacterSubrace';
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

// Assuming we need to add this step configuration
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

  // Function to fetch subraces based on selected race
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

  const renderStepContent = () => {
    switch (visibleSteps[currentStep]?.id) {
      case 'basics':
        return <CharacterBasics character={character} onUpdate={updateCharacter} />;
      case 'race':
        return <CharacterRace races={races} character={character} onUpdate={updateCharacter} />;
      case 'subrace':
        return <CharacterSubrace subraces={subracesForRace} character={character} onUpdate={updateCharacter} />;
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

      // Ensure all required fields are present
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все обязательные поля (Имя, Раса, Класс).",
          variant: "destructive",
        });
        return;
      }

      // Convert the character object to ensure all required properties are present
      const characterToSave = convertToCharacter(character);

      // Save the character to the database
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
    <div className="container p-4 mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Создание персонажа</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{visibleSteps[currentStep]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
          Назад
        </Button>
        {currentStep < visibleSteps.length - 1 ? (
          <Button onClick={nextStep}>Далее</Button>
        ) : (
          <Button onClick={handleSaveCharacter} disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить персонажа"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CharacterCreationPage;
