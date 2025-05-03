
import React, { useState } from "react";
import { races } from "@/data/races";
import { CharacterSheet } from "@/types/character.d";
import NavigationButtons from "./NavigationButtons";
import { 
  SelectionCard,
  SelectionCardBadge, 
  SelectionCardGrid,
  SelectionSubOptionsContainer,
  SelectionSubOption
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

interface CharacterRaceSelectionProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterRaceSelection: React.FC<CharacterRaceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [selectedRace, setSelectedRace] = useState(character.race || "");
  const [selectedSubrace, setSelectedSubrace] = useState(character.subrace || "");
  const { theme } = useTheme();
  
  // Добавляем защиту от undefined
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const handleRaceSelect = (race: string) => {
    setSelectedRace(race);
    setSelectedSubrace("");
    updateCharacter({ race, subrace: "" });
  };

  const handleSubraceSelect = (subrace: string) => {
    setSelectedSubrace(subrace);
    updateCharacter({ subrace });
  };

  const handleNext = () => {
    if (selectedRace) {
      nextStep();
    }
  };
  
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Выберите расу"
        description="Раса определяет внешний вид персонажа и дает врожденные способности."
      />
      
      <SelectionCardGrid>
        {races.map((race) => {
          const isSelected = selectedRace === race.name;
          const hasSubraces = (race.subRaces && race.subRaces.length > 0) || 
                             (race.subRaceDetails && Object.keys(race.subRaceDetails).length > 0);
          
          return (
            <SelectionCard
              key={race.name}
              title={race.name}
              description={race.description}
              selected={isSelected}
              onClick={() => handleRaceSelect(race.name)}
              badges={race.abilityBonuses ? (
                <SelectionCardBadge>{race.abilityBonuses}</SelectionCardBadge>
              ) : undefined}
              subOptions={hasSubraces && isSelected ? (
                <div>
                  <p className="text-sm font-medium mb-2">Доступные подрасы:</p>
                  <SelectionSubOptionsContainer>
                    {race.subRaces?.map((subrace) => (
                      <SelectionSubOption
                        key={subrace}
                        label={subrace}
                        selected={selectedSubrace === subrace}
                        onClick={() => handleSubraceSelect(subrace)}
                        className={`
                          ${selectedSubrace === subrace 
                            ? 'bg-primary text-white font-semibold border-2 border-primary shadow-lg' 
                            : 'bg-secondary/30 text-foreground border border-gray-400'}
                          hover:bg-primary/20 transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-primary/50
                        `}
                      />
                    ))}
                  </SelectionSubOptionsContainer>
                </div>
              ) : undefined}
            />
          );
        })}
      </SelectionCardGrid>
      
      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
