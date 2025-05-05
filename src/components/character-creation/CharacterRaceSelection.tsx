
import React, { useState, useEffect } from 'react';
import type { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { races } from '@/data/races';
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Badge } from '@/components/ui/badge';
import { SelectionCard, SelectionCardBadge } from '@/components/ui/selection-card';

interface CharacterRaceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterRaceSelection: React.FC<CharacterRaceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedRace, setSelectedRace] = useState(character.race || '');
  const [hasSubraces, setHasSubraces] = useState<boolean>(false);

  useEffect(() => {
    // Проверяем наличие подрас при изменении выбранной расы
    if (selectedRace) {
      const raceData = races.find(r => r.name === selectedRace);
      setHasSubraces(!!(raceData?.subraces && raceData.subraces.length > 0));
    }
  }, [selectedRace]);

  const handleRaceChange = (raceName: string) => {
    setSelectedRace(raceName);
    updateCharacter({ race: raceName, subrace: '' }); // Сбрасываем подрасу при смене расы
  };

  const handleNext = () => {
    if (selectedRace) {
      nextStep();
    }
  };

  // Получаем описание расы
  const getRaceDescription = (raceName: string) => {
    const race = races.find(r => r.name === raceName);
    return race?.description || "Нет описания";
  };

  // Проверяем, есть ли у расы подрасы
  const hasSubracesForRace = (raceName: string) => {
    const race = races.find(r => r.name === raceName);
    return !!(race?.subraces && race.subraces.length > 0);
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Выбор расы" 
        description="Выберите расу для вашего персонажа. Раса влияет на характеристики, умения и историю персонажа."
      />

      <Card>
        <CardHeader>
          <CardTitle>Расы</CardTitle>
          <CardDescription>Выберите расу для вашего персонажа</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {races.map((race) => (
                <SelectionCard
                  key={race.name}
                  title={race.name}
                  description={getRaceDescription(race.name).substring(0, 150) + "..."}
                  selected={selectedRace === race.name}
                  onClick={() => handleRaceChange(race.name)}
                  badges={
                    hasSubracesForRace(race.name) ? (
                      <SelectionCardBadge>
                        Доступны подрасы
                      </SelectionCardBadge>
                    ) : null
                  }
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
