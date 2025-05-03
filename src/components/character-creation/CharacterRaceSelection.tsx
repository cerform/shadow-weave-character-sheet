
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useCharacterCreation } from "@/hooks/useCharacterCreation";
import { races } from "@/data/races";
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";

const CharacterRaceSelection = () => {
  const { character, updateCharacter } = useCharacterCreation();
  const [selectedRace, setSelectedRace] = useState(character.race || "");
  const [selectedSubrace, setSelectedSubrace] = useState(character.subrace || "");
  const [expandedRace, setExpandedRace] = useState<string | null>(null);

  const handleRaceSelect = (race: string) => {
    setSelectedRace(race);
    setSelectedSubrace("");
    updateCharacter({ race, subrace: "" });
  };

  const handleSubraceSelect = (subrace: string) => {
    setSelectedSubrace(subrace);
    updateCharacter({ subrace });
  };

  const toggleExpandRace = (race: string) => {
    if (expandedRace === race) {
      setExpandedRace(null);
    } else {
      setExpandedRace(race);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Выберите расу</h2>
        <p className="text-muted-foreground">Раса определяет внешний вид персонажа и дает врожденные способности.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {races.map((race) => {
          const isSelected = selectedRace === race.name;
          const hasSubraces = race.subraces && race.subraces.length > 0;
          
          return (
            <Card 
              key={race.name}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
              onClick={() => {
                handleRaceSelect(race.name);
                if (hasSubraces) {
                  toggleExpandRace(race.name);
                }
              }}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg mb-1">{race.name}</h3>
                    {isSelected && <Check className="text-primary h-5 w-5" />}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {race.abilityScoreIncrease && Object.entries(race.abilityScoreIncrease).map(([ability, value]) => (
                      <TooltipProvider key={ability}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="cursor-help">
                              {ability} +{value}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Увеличивает характеристику {ability} на {value}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{race.description}</p>
                  
                  {hasSubraces && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Доступные подрасы:</p>
                      <div className="flex flex-wrap gap-2">
                        {race.subraces.map((subrace) => (
                          <Badge 
                            key={subrace.name}
                            variant={selectedSubrace === subrace.name ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubraceSelect(subrace.name);
                            }}
                          >
                            {subrace.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CharacterRaceSelection;
