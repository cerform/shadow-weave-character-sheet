
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
                  <p className="text-sm font-medium mb-2 text-white">Доступные подрасы:</p>
                  <SelectionSubOptionsContainer>
                    {race.subRaces?.map((subrace) => {
                      const isSubraceSelected = selectedSubrace === subrace;
                      return (
                        <SelectionSubOption
                          key={subrace}
                          label={subrace}
                          selected={isSubraceSelected}
                          onClick={() => handleSubraceSelect(subrace)}
                          style={{
                            backgroundColor: isSubraceSelected ? currentTheme.accent : 'rgba(0, 0, 0, 0.6)',
                            color: isSubraceSelected ? '#000000' : '#FFFFFF',
                            boxShadow: isSubraceSelected ? `0 0 12px ${currentTheme.accent}` : 'none',
                            transform: isSubraceSelected ? 'scale(1.05)' : 'scale(1)',
                            border: `1px solid ${currentTheme.accent || '#50FF50'}`,
                            textShadow: isSubraceSelected ? 'none' : '0px 1px 2px rgba(0, 0, 0, 0.8)'
                          }}
                          className={`
                            transition-all duration-200
                            ${isSubraceSelected 
                              ? 'font-semibold scale-105 shadow-glow' 
                              : 'hover:bg-white/20'}
                          `}
                        />
                      );
                    })}
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
