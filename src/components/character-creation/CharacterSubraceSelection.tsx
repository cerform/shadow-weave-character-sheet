
import React, { useState, useEffect } from 'react';
import type { Character } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { races } from '@/data/races';
import { ScrollArea } from "@/components/ui/scroll-area";
import NavigationButtons from "./NavigationButtons";
import SectionHeader from "@/components/ui/section-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCircle, Info } from 'lucide-react';

interface CharacterSubraceSelectionProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterSubraceSelection: React.FC<CharacterSubraceSelectionProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const [selectedSubrace, setSelectedSubrace] = useState(character.subrace || '');
  const [availableSubraces, setAvailableSubraces] = useState<{name: string, description: string}[]>([]);
  const [autoRedirectAttempted, setAutoRedirectAttempted] = useState(false);

  useEffect(() => {
    // Загрузка доступных подрас для выбранной расы
    if (character.race) {
      const raceData = races.find(r => r.name === character.race);
      if (raceData && raceData.subRaces && raceData.subRaces.length > 0) {
        // Преобразуем строки подрас в объекты с описаниями
        const subraceObjects = raceData.subRaces.map(subraceName => {
          const details = raceData.subRaceDetails ? raceData.subRaceDetails[subraceName] || {} : {};
          return {
            name: subraceName,
            description: details.description || `Подраса ${subraceName}`
          };
        });
        setAvailableSubraces(subraceObjects);
        
        // Если подраса не была выбрана или не соответствует текущей расе, сбрасываем её
        if (!selectedSubrace || !raceData.subRaces.some(sr => sr === selectedSubrace)) {
          setSelectedSubrace('');
          updateCharacter({ subrace: '' });
        }
      } else {
        // Если нет подрас, устанавливаем пустой массив
        setAvailableSubraces([]);
      }
    }
  }, [character.race]);

  const handleSubraceChange = (subraceName: string) => {
    setSelectedSubrace(subraceName);
    updateCharacter({ subrace: subraceName });
  };

  // Редирект только если у расы нет подрас и при первом рендере
  useEffect(() => {
    if (availableSubraces.length === 0 && character.race && !autoRedirectAttempted) {
      setAutoRedirectAttempted(true);
      nextStep();
    }
  }, [availableSubraces, character.race, autoRedirectAttempted]);

  // Если нет подрас, показываем загрузочное сообщение
  if (availableSubraces.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title={`Выбор подрасы для ${character.race}`} 
          description="Некоторые расы имеют различные подрасы с уникальными особенностями и бонусами."
        />
        <Alert variant="default" className="bg-primary/10 border-primary/30">
          <Info className="h-5 w-5" />
          <AlertDescription>
            У расы {character.race} нет доступных подрас. Переход к следующему шагу...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={`Выбор подрасы для ${character.race}`} 
        description="Некоторые расы имеют различные подрасы с уникальными особенностями и бонусами."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Доступные подрасы
          </CardTitle>
          <CardDescription>Выберите подрасу для вашего персонажа</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <RadioGroup value={selectedSubrace} onValueChange={handleSubraceChange} className="space-y-4">
              {availableSubraces.map((subrace) => (
                <div 
                  key={subrace.name} 
                  className={`border rounded-lg p-4 transition-colors ${selectedSubrace === subrace.name ? 'border-primary bg-primary/10 shadow-[0_0_10px] shadow-primary/30' : 'border-border hover:bg-accent/20'}`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value={subrace.name} id={subrace.name} />
                    <Label htmlFor={subrace.name} className="font-semibold text-lg">{subrace.name}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{subrace.description}</p>
                </div>
              ))}
            </RadioGroup>
          </ScrollArea>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={!!selectedSubrace}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubraceSelection;
