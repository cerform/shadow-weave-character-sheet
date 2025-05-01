
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom hooks
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { useAbilitiesRoller } from "@/hooks/useAbilitiesRoller";
import { useCreationStep } from "@/hooks/useCreationStep";

// Components
import CreationStepDisplay from "@/components/character-creation/CreationStepDisplay";
import CharacterCreationContent from "@/components/character-creation/CharacterCreationContent";

// Configuration
import { steps } from "@/config/characterCreationSteps";

const CharacterCreationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [abilitiesMethod, setAbilitiesMethod] = useState<"pointbuy" | "standard" | "roll">("standard");
  
  // Custom hooks
  const { character, updateCharacter, isMagicClass, getModifier } = useCharacterCreation();
  const { diceResults, rollAllAbilities, rollSingleAbility, abilityScorePoints } = useAbilitiesRoller(abilitiesMethod, character.level);
  const { currentStep, nextStep, prevStep } = useCreationStep(isMagicClass, character.class);

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div className={`p-6 min-h-screen bg-background text-foreground theme-${theme}`}>
      <Button 
        onClick={goToHomePage} 
        variant="outline" 
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        На главную
      </Button>

      <h1 className="text-3xl font-bold mb-8 text-center">Создание персонажа</h1>

      {/* Step progression display */}
      <CreationStepDisplay 
        steps={steps} 
        currentStep={currentStep}
        isMagicClass={isMagicClass}
        characterClass={character.class}
      />

      {/* Content area */}
      <div className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-lg">
        <CharacterCreationContent 
          currentStep={currentStep}
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
        />
      </div>
    </div>
  );
};

export default CharacterCreationPage;
