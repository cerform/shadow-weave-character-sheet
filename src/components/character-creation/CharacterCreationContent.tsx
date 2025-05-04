import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterBasicInfo } from './CharacterBasicInfo';
import { CharacterAbilityScores } from './CharacterAbilityScores';
import { CharacterClassSelector } from './CharacterClassSelector';
import { CharacterBackgroundSelector } from './CharacterBackgroundSelector';
import { CharacterSkillsSelector } from './CharacterSkillsSelector';
import { CharacterEquipmentSelector } from './CharacterEquipmentSelector';
import { CharacterPersonality } from './CharacterPersonality';
import { CharacterReview } from './CharacterReview';
import { CharacterAppearance } from './CharacterAppearance';
import { CharacterSpellsSelector } from './CharacterSpellsSelector';
import { useCharacterCreation } from '@/hooks/useCharacterCreation';
import { CharacterRaceSelector } from './CharacterRaceSelector';
import { CharacterHitPointsCalculator } from './CharacterHitPointsCalculator';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const CharacterCreationContent: React.FC = () => {
  const {
    currentStep,
    character,
    availablePoints,
    abilityScoreMethod,
    handleNextStep,
    handlePrevStep,
    handleAbilityScoreMethodChange,
    handleAbilityScoreChange,
    handleRaceChange,
    handleClassChange,
    handleBackgroundChange,
    handleSkillChange,
    handleEquipmentChange,
    handlePersonalityChange,
    handleAppearanceChange,
    handleSpellChange,
    handleSubmit,
    steps,
    isSubmitDisabled,
    handleAlignmentChange,
    handleNameChange,
    handleGenderChange,
    handleBackstoryChange,
    handleIdealsChange,
    handleBondsChange,
    handleFlawsChange,
    handleProficiencyChange,
    handleLevelChange,
    handleAdditionalClassChange,
    handleSubclassChange,
    handleAbilityPointsUsedChange,
    handleImageChange,
    handleHitPointsCalculated
  } = useCharacterCreation();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
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
