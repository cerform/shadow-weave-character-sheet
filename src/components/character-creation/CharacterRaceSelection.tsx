
import React, { useState, useEffect } from "react";
import { races } from "@/data/races";
import { CharacterSheet } from "@/types/character.d";
import NavigationButtons from "./NavigationButtons";
import { 
  SelectionCard,
  SelectionCardGrid,
} from "@/components/ui/selection-card";
import SectionHeader from "@/components/ui/section-header";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Эффект для синхронизации локальных состояний с данными персонажа при монтировании
  useEffect(() => {
    setSelectedRace(character.race || "");
    setSelectedSubrace(character.subrace || "");
  }, [character.race, character.subrace]);

  // Получаем доступные подрасы для выбранной расы
  const getAvailableSubraces = (raceName: string) => {
    if (!raceName) return [];
    const race = races.find(r => r.name === raceName);
    return race?.subRaces || [];
  };

  const handleRaceSelect = (race: string) => {
    setSelectedRace(race);
    
    // Сбрасываем подрасу только если новая раса отличается от предыдущей
    if (race !== character.race) {
      setSelectedSubrace("");
      updateCharacter({ race, subrace: "" });
    } else {
      updateCharacter({ race });
    }
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
  
  return (
    <TooltipProvider>
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
              >
                {/* Заменяем бэджи на кнопку с всплывающей подсказкой */}
                <div className="mt-2 flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                        <Info className="h-3.5 w-3.5" />
                        <span>Бонусы характеристик</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-black/90 text-white border-primary/30">
                      <p>{race.abilityBonuses}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {raceHasSubraces && isSelected && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Доступные подрасы:</h4>
                    <div className="bg-black/40 p-3 rounded-lg border border-primary/30">
                      <div className="flex flex-wrap gap-2">
                        {race.subRaces?.map((subrace) => {
                          const isSubraceSelected = selectedSubrace === subrace;
                          
                          return (
                            <button
                              key={subrace}
                              onClick={(e) => {
                                e.stopPropagation(); // Предотвращаем всплытие события
                                handleSubraceSelect(subrace);
                              }}
                              className={`
                                px-3 py-1.5 rounded text-sm font-medium transition-all duration-200
                                ${isSubraceSelected
                                  ? 'bg-primary text-white shadow-md scale-105'
                                  : 'bg-black/60 text-white hover:bg-white/20'
                                }
                                ${isSubraceSelected ? 'border border-white' : 'border border-primary/30'}
                              `}
                              style={{
                                backgroundColor: isSubraceSelected ? currentTheme.accent : undefined,
                                boxShadow: isSubraceSelected ? `0 0 8px ${currentTheme.accent}` : undefined
                              }}
                            >
                              <span className="flex items-center gap-1.5">
                                {subrace}
                                {isSubraceSelected && <Check className="h-3 w-3" />}
                              </span>
                            </button>
                          );
                        })}
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
          nextStep={nextStep}
          prevStep={prevStep}
          isFirstStep={true}
        />
      </div>
    </TooltipProvider>
  );
};

export default CharacterRaceSelection;
