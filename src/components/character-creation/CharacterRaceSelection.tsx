
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
      setHasSubraces(!!(raceData?.subRaces && raceData.subRaces.length > 0));
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
    return !!(race?.subRaces && race.subRaces.length > 0);
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
            <RadioGroup defaultValue={selectedRace} onValueChange={handleRaceChange} className="grid gap-4">
              {races.map((race) => (
                <div 
                  key={race.name} 
                  className={`flex flex-col border rounded-lg p-4 transition-colors ${selectedRace === race.name ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/10'}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={race.name} id={race.name} />
                    <Label htmlFor={race.name} className="font-semibold text-lg flex items-center gap-2">
                      {race.name}
                      {hasSubracesForRace(race.name) && (
                        <Badge variant="outline" className="text-xs bg-primary/30">
                          Доступны подрасы
                        </Badge>
                      )}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {getRaceDescription(race.name).substring(0, 150)}...
                  </p>
                </div>
              ))}
            </RadioGroup>
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
