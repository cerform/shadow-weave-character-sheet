
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { useToast } from '@/hooks/use-toast';

interface CharacterRaceProps {
  races: any[];
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterRace: React.FC<CharacterRaceProps> = ({
  races,
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const { toast } = useToast();
  const [selectedRace, setSelectedRace] = useState(character.race || '');

  const handleRaceSelect = (raceName: string) => {
    setSelectedRace(raceName);
  };

  const handleNext = () => {
    if (selectedRace) {
      onUpdate({ race: selectedRace });
      
      // Находим информацию о расе
      const raceInfo = races.find(race => race.name === selectedRace);
      
      // Уведомляем пользователя о выборе
      toast({
        title: "Раса выбрана",
        description: `Вы выбрали расу ${selectedRace}`
      });
      
      nextStep();
    } else {
      toast({
        title: "Выберите расу",
        description: "Пожалуйста, выберите расу перед тем, как продолжить.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор расы</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {races.map((race) => (
          <Card 
            key={race.name} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRace === race.name ? 'border-primary shadow-sm' : ''
            }`}
            onClick={() => handleRaceSelect(race.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{race.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">{race.description}</CardDescription>
              <div className="text-xs text-muted-foreground">
                <div><strong>Размер:</strong> {race.size}</div>
                <div><strong>Скорость:</strong> {race.speed} м</div>
                <div><strong>Языки:</strong> {race.languages.join(', ')}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NavigationButtons
        allowNext={!!selectedRace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterRace;
