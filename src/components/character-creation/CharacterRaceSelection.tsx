import React, { useState } from 'react';
import type { CharacterSheet } from "@/utils/characterImports";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { races } from '@/data/races';
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";

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
  prevStep,
}) => {
  const [selectedRace, setSelectedRace] = useState(character.race || '');

  const handleRaceChange = (raceName: string) => {
    setSelectedRace(raceName);
    updateCharacter({ race: raceName });
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
          <RadioGroup defaultValue={selectedRace} onValueChange={handleRaceChange} className="grid gap-2">
            {races.map((race) => (
              <div key={race.name} className="flex items-center space-x-2">
                <RadioGroupItem value={race.name} id={race.name} />
                <Label htmlFor={race.name}>{race.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterRaceSelection;
