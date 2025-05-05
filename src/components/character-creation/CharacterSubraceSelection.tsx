
import React, { useEffect } from 'react';
import type { Character } from "@/types/character";
import { Button } from "@/components/ui/button";
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

  // Важное изменение: не делаем автоматическую редирект без проверки наличия расы
  useEffect(() => {
    if (character.race && !hasSubraces && !autoRedirectAttempted) {
      console.log("No subraces for race", character.race, "redirecting to next step");
      setAutoRedirectAttempted(true);
      // Добавляем задержку, чтобы UI успел обновиться
      setTimeout(() => {
        nextStep();
      }, 100);
    }
  }, [hasSubraces, character.race, autoRedirectAttempted, nextStep, setAutoRedirectAttempted]);

  // Если ещё нет выбранной расы, показываем сообщение
  if (!character.race) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SectionHeader 
          title="Подраса" 
          description="Пожалуйста, сначала выберите расу персонажа."
        />
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
          <p className="text-red-100">Необходимо сначала выбрать расу персонажа.</p>
          <Button 
            onClick={prevStep} 
            className="mt-4"
            style={{ 
              backgroundColor: themeStyles?.accent,
              color: themeStyles?.buttonText || 'white'
            }}
          >
            Вернуться к выбору расы
          </Button>
        </div>
      </div>
    );
  }

  // Если нет подрас для выбранной расы, показываем соответствующее сообщение
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
