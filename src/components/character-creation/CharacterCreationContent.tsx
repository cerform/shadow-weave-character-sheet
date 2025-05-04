
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CharacterBasicInfo from './CharacterBasicInfo';
import CharacterAbilityScores from './CharacterAbilityScores';
import { CharacterClassSelector } from './CharacterClassSelector';
import { CharacterBackgroundSelector } from './CharacterBackgroundSelector';
import { CharacterSkillsSelector } from './CharacterSkillsSelector';
import { CharacterEquipmentSelector } from './CharacterEquipmentSelector';
import { CharacterPersonality } from './CharacterPersonality';
import CharacterReview from './CharacterReview';
import { CharacterAppearance } from './CharacterAppearance';
import { CharacterSpellsSelector } from './CharacterSpellsSelector';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { CharacterRaceSelector } from './CharacterRaceSelector';
import { CharacterHitPointsCalculator } from './CharacterHitPointsCalculator';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Определим шаги создания персонажа для использования в компоненте
const steps = [
  { step: 1, label: "Основное" },
  { step: 2, label: "Раса" },
  { step: 3, label: "Класс" },
  { step: 4, label: "Хит-поинты" },
  { step: 5, label: "Характеристики" },
  { step: 6, label: "Предыстория" },
  { step: 7, label: "Навыки" },
  { step: 8, label: "Снаряжение" },
  { step: 9, label: "Заклинания" },
  { step: 10, label: "Личность" },
  { step: 11, label: "Внешность" },
  { step: 12, label: "Обзор" }
];

interface CharacterCreationContentProps {
  // Можно расширить эти пропсы, если потребуется
}

export const CharacterCreationContent: React.FC<CharacterCreationContentProps> = () => {
  const {
    character,
    updateCharacter,
    handleLevelChange,
    getModifier,
    isMagicClass,
  } = useCharacterCreation();
  
  // Добавляем локальное состояние для управления шагами и прочим
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePoints, setAvailablePoints] = useState<number>(27);
  const [abilityScoreMethod, setAbilityScoreMethod] = useState<"pointbuy" | "standard" | "roll" | "manual">("standard");
  
  const { toast } = useToast();
  
  // Обработчики для управления шагами
  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Вспомогательные обработчики, которые будут передаваться в дочерние компоненты
  const handleAbilityScoreMethodChange = (method: "pointbuy" | "standard" | "roll" | "manual") => {
    setAbilityScoreMethod(method);
  };
  
  const handleAbilityScoreChange = (ability: string, value: number) => {
    updateCharacter({
      abilities: {
        ...character.abilities,
        [ability]: value
      }
    });
  };
  
  const handleRaceChange = (race: string) => {
    updateCharacter({ race });
  };
  
  const handleClassChange = (className: string) => {
    updateCharacter({ class: className });
  };
  
  const handleBackgroundChange = (background: string) => {
    updateCharacter({ background });
  };
  
  const handleSkillChange = (skills: string[]) => {
    updateCharacter({ skills });
  };
  
  const handleEquipmentChange = (equipment: string[]) => {
    updateCharacter({ equipment });
  };
  
  const handlePersonalityChange = (values: any) => {
    updateCharacter(values);
  };
  
  const handleAppearanceChange = (appearance: string) => {
    updateCharacter({ appearance });
  };
  
  const handleSpellChange = (spells: string[]) => {
    updateCharacter({ spells });
  };
  
  const handleNameChange = (name: string) => {
    updateCharacter({ name });
  };
  
  const handleGenderChange = (gender: string) => {
    updateCharacter({ gender });
  };
  
  const handleAlignmentChange = (alignment: string) => {
    updateCharacter({ alignment });
  };
  
  const handleBackstoryChange = (backstory: string) => {
    updateCharacter({ backstory });
  };
  
  const handleIdealsChange = (ideals: string) => {
    updateCharacter({ ideals });
  };
  
  const handleBondsChange = (bonds: string) => {
    updateCharacter({ bonds });
  };
  
  const handleFlawsChange = (flaws: string) => {
    updateCharacter({ flaws });
  };
  
  const handleProficiencyChange = (proficiencies: string[]) => {
    updateCharacter({ proficiencies });
  };
  
  const handleAdditionalClassChange = (additionalClasses: any[]) => {
    updateCharacter({ additionalClasses });
  };
  
  const handleSubclassChange = (subclass: string) => {
    updateCharacter({ subclass });
  };
  
  const handleAbilityPointsUsedChange = (points: number) => {
    updateCharacter({ abilityPointsUsed: points });
  };
  
  const handleImageChange = (image: string) => {
    updateCharacter({ image });
  };
  
  const handleHitPointsCalculated = (hitPoints: number) => {
    updateCharacter({ maxHp: hitPoints, currentHp: hitPoints });
  };
  
  // Функция для создания персонажа
  const handleSubmit = async () => {
    // Здесь будет логика сохранения персонажа
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };
  
  // Проверка, можно ли создать персонажа
  const isSubmitDisabled = !character.name || !character.race || !character.class;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CharacterBasicInfo 
                 character={character}
                 onNameChange={handleNameChange}
                 onGenderChange={handleGenderChange}
                 onAlignmentChange={handleAlignmentChange}
                 onBackstoryChange={handleBackstoryChange}
                 onIdealsChange={handleIdealsChange}
                 onBondsChange={handleBondsChange}
                 onFlawsChange={handleFlawsChange}
                 onImageChange={handleImageChange}
               />;
      case 2:
        return <CharacterRaceSelector 
                 character={character}
                 onRaceChange={handleRaceChange}
               />;
      case 3:
        return <CharacterClassSelector 
                 character={character} 
                 onClassChange={handleClassChange}
                 onLevelChange={handleLevelChange}
                 onAdditionalClassChange={handleAdditionalClassChange}
                 onSubclassChange={handleSubclassChange}
               />;
      case 4:
        return <CharacterHitPointsCalculator 
                 level={character.level}
                 characterClass={character.class}
                 constitutionModifier={0}
                 onHitPointsCalculated={handleHitPointsCalculated}
               />;
      case 5:
        return <CharacterAbilityScores
                 character={character}
                 availablePoints={availablePoints}
                 abilityScoreMethod={abilityScoreMethod}
                 onAbilityScoreMethodChange={handleAbilityScoreMethodChange}
                 onAbilityScoreChange={handleAbilityScoreChange}
                 onAbilityPointsUsedChange={handleAbilityPointsUsedChange}
               />;
      case 6:
        return <CharacterBackgroundSelector 
                 character={character}
                 onBackgroundChange={handleBackgroundChange}
                 onProficiencyChange={handleProficiencyChange}
               />;
      case 7:
        return <CharacterSkillsSelector 
                 character={character}
                 onSkillChange={handleSkillChange}
               />;
      case 8:
        return <CharacterEquipmentSelector 
                 character={character}
                 onEquipmentChange={handleEquipmentChange}
               />;
      case 9:
        return <CharacterSpellsSelector 
                 character={character}
                 onSpellChange={handleSpellChange}
               />;
      case 10:
        return <CharacterPersonality 
                 character={character}
                 onPersonalityChange={handlePersonalityChange}
               />;
      case 11:
        return <CharacterAppearance 
                 character={character}
                 onAppearanceChange={handleAppearanceChange}
               />;
      case 12:
        return <CharacterReview character={character} />;
      default:
        return <div>Шаг не найден</div>;
    }
  };

  const handleSubmitCharacter = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit();
      toast({
        title: "Персонаж создан!",
        description: "Вы успешно создали персонажа.",
      });
    } catch (error) {
      toast({
        title: "Ошибка создания персонажа",
        description: "Произошла ошибка при создании персонажа.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Шаги в виде табов */}
      <Tabs value={`step-${currentStep}`} className="flex-1 flex flex-col">
        <TabsList className="flex-none">
          {steps.map((step) => (
            <TabsTrigger value={`step-${step.step}`} key={step.step} disabled={step.step > currentStep}>
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Контент текущего шага */}
        <div className="flex-1 overflow-auto p-4">
          {renderStepContent()}
        </div>

        {/* Кнопки навигации */}
        <div className="flex justify-between p-4">
          <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNextStep}>
              Вперед
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitCharacter} disabled={isSubmitting || isSubmitDisabled}>
              {isSubmitting ? (
                <>
                  Создание...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Создать персонажа
                </>
              )}
            </Button>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default CharacterCreationContent;
