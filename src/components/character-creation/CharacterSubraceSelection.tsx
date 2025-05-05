
import React, { useEffect } from 'react';
import type { Character } from "@/types/character";
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import SubraceCard from './SubraceCard';
import NoSubracesAlert from './NoSubracesAlert';
import { useSubraceSelection } from '@/hooks/useSubraceSelection';
import { useTheme } from '@/hooks/use-theme';

interface CharacterSubraceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSubraceSelection: React.FC<CharacterSubraceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const { themeStyles } = useTheme();
  
  const { 
    selectedSubrace, 
    availableSubraces, 
    autoRedirectAttempted, 
    setAutoRedirectAttempted,
    hasSubraces,
    handleSubraceSelect 
  } = useSubraceSelection({
    race: character.race,
    initialSubrace: character.subrace || '',
    onSubraceSelect: (subrace) => updateCharacter({ subrace })
  });

  // Redirect only if the race has no subraces and on first render
  useEffect(() => {
    if (!hasSubraces && character.race && !autoRedirectAttempted) {
      setAutoRedirectAttempted(true);
      nextStep();
    }
  }, [hasSubraces, character.race, autoRedirectAttempted, nextStep, setAutoRedirectAttempted]);

  // If no subraces, show loading message
  if (!hasSubraces) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title={`Выбор подрасы для ${character.race}`} 
          description="Некоторые расы имеют различные подрасы с уникальными особенностями и бонусами."
        />
        <NoSubracesAlert raceName={character.race} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader 
        title="Разновидность" 
        description={`Раса ${character.race} имеет несколько разновидностей. Выберите одну из них.`}
      />

      <ScrollArea className="h-[calc(100vh-20rem)] pr-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSubraces.map((subrace) => (
            <SubraceCard
              key={subrace.name}
              name={subrace.name}
              description={subrace.description}
              traits={subrace.traits}
              abilityScoreIncrease={subrace.abilityScoreIncrease}
              selected={selectedSubrace === subrace.name}
              onClick={() => handleSubraceSelect(subrace.name)}
            />
          ))}
        </div>
      </ScrollArea>

      <NavigationButtons
        allowNext={!!selectedSubrace}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubraceSelection;
