
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { races } from '@/data/races';

interface CharacterRaceSelectionProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterRaceSelection = ({ character, onUpdateCharacter }: CharacterRaceSelectionProps) => {
  const [selectedRace, setSelectedRace] = useState<string>(character.race || '');
  const [selectedSubrace, setSelectedSubrace] = useState<string>(character.subrace || '');
  
  const handleRaceChange = (value: string) => {
    setSelectedRace(value);
    setSelectedSubrace('');
    onUpdateCharacter({ 
      race: value,
      subrace: '' 
    });
  };
  
  const handleSubraceChange = (value: string) => {
    setSelectedSubrace(value);
    onUpdateCharacter({ subrace: value });
  };
  
  const currentRace = races.find(race => race.name === selectedRace);
  
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Выберите расу</h2>
        <p className="mb-4 text-muted-foreground">
          Раса определяет основные черты вашего персонажа, включая базовые 
          характеристики, расовые особенности и другие качества.
        </p>
        
        <RadioGroup
          value={selectedRace}
          onValueChange={handleRaceChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {races.map(race => (
            <div key={race.name} className="relative">
              <RadioGroupItem
                value={race.name}
                id={race.name}
                className="peer sr-only"
              />
              <Label
                htmlFor={race.name}
                className="flex flex-col p-4 rounded-md border-2 border-muted bg-primary/5 hover:bg-primary/10 cursor-pointer peer-data-[state=checked]:border-primary transition-colors"
              >
                <span className="font-semibold text-lg">{race.name}</span>
                <span className="text-sm text-muted-foreground">{race.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {currentRace?.subraces && currentRace.subraces.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Выберите подрасу</h3>
          <RadioGroup
            value={selectedSubrace}
            onValueChange={handleSubraceChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {currentRace.subraces.map(subrace => (
              <div key={subrace.name} className="relative">
                <RadioGroupItem
                  value={subrace.name}
                  id={subrace.name}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={subrace.name}
                  className="flex flex-col p-4 rounded-md border-2 border-muted bg-primary/5 hover:bg-primary/10 cursor-pointer peer-data-[state=checked]:border-primary transition-colors"
                >
                  <span className="font-semibold text-lg">{subrace.name}</span>
                  <span className="text-sm text-muted-foreground">{subrace.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
      
      {selectedRace && (
        <Card className="mt-8 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Особенности расы: {selectedRace}</h3>
            <div className="space-y-2">
              {currentRace?.traits.map((trait, index) => (
                <div key={index}>
                  <h4 className="font-medium">{trait.name}</h4>
                  <p className="text-sm text-muted-foreground">{trait.description}</p>
                </div>
              ))}
            </div>
            {selectedSubrace && currentRace?.subraces?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-semibold mb-2">Особенности подрасы: {selectedSubrace}</h3>
                <div className="space-y-2">
                  {currentRace.subraces.find(sr => sr.name === selectedSubrace)?.traits.map((trait, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{trait.name}</h4>
                      <p className="text-sm text-muted-foreground">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
