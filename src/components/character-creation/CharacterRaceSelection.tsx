
import React, { useState, useEffect } from "react";
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
import { Check } from "lucide-react";

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

  // Функция для определения, нужна ли подраса для выбранной расы
  const hasSubraces = (raceName: string) => {
    if (!raceName) return false;
    const race = races.find(r => r.name === raceName);
    return race && race.subRaces && race.subRaces.length > 0;
  };

  // Эффект для сброса подрасы при изменении расы
  useEffect(() => {
    if (selectedRace !== character.race) {
      setSelectedSubrace("");
    }
  }, [selectedRace, character.race]);

  // Получаем доступные подрасы для выбранной расы
  const getAvailableSubraces = (raceName: string) => {
    if (!raceName) return [];
    const race = races.find(r => r.name === raceName);
    return race?.subRaces || [];
  };

  const handleRaceSelect = (race: string) => {
    setSelectedRace(race);
    setSelectedSubrace("");
    updateCharacter({ race, subrace: "" });
  };

  const handleSubraceSelect = (subrace: string) => {
    setSelectedSubrace(subrace);
    updateCharacter({ subrace });
  };

  // Проверяем, доступен ли переход на следующий шаг
  const canProceed = () => {
    // Если у расы есть подрасы, требуется выбрать подрасу
    if (hasSubraces(selectedRace)) {
      return !!selectedSubrace;
    }
    // Иначе достаточно только выбрать расу
    return !!selectedRace;
  };

  const handleNext = () => {
    if (canProceed()) {
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
          const raceHasSubraces = race.subRaces && race.subRaces.length > 0;
          
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
            >
              {raceHasSubraces && isSelected && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Доступные подрасы:</p>
                  <div className="bg-black/40 p-3 rounded-lg border border-primary/30">
                    <div className="flex flex-wrap gap-2">
                      {race.subRaces?.map((subrace) => (
                        <button
                          key={subrace}
                          onClick={() => handleSubraceSelect(subrace)}
                          className={`
                            px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                            ${selectedSubrace === subrace
                              ? 'bg-primary text-white shadow-md scale-105'
                              : 'bg-black/60 text-white hover:bg-white/20'
                            }
                            ${selectedSubrace === subrace ? 'border border-white' : 'border border-primary/30'}
                          `}
                          style={{
                            backgroundColor: selectedSubrace === subrace ? currentTheme.accent : undefined,
                            boxShadow: selectedSubrace === subrace ? `0 0 8px ${currentTheme.accent}` : undefined
                          }}
                        >
                          <span className="flex items-center">
                            {subrace}
                            {selectedSubrace === subrace && <Check className="ml-1.5 h-3 w-3" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SelectionCard>
          );
        })}
      </SelectionCardGrid>
      
      <NavigationButtons
        allowNext={canProceed()}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
