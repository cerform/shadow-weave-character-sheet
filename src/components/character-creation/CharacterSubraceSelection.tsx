
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

  useEffect(() => {
    // Загрузка доступных подрас для выбранной расы
    if (character.race) {
      const raceData = races.find(r => r.name === character.race);
      if (raceData && raceData.subraces && raceData.subraces.length > 0) {
        setAvailableSubraces(raceData.subraces);
        
        // Если подраса не была выбрана или не соответствует текущей расе, сбрасываем её
        if (!selectedSubrace || !raceData.subraces.some(sr => sr.name === selectedSubrace)) {
          setSelectedSubrace('');
          updateCharacter({ subrace: '' });
        }
      } else {
        setAvailableSubraces([]);
      }
    }
  }, [character.race]);

  const handleSubraceChange = (subraceName: string) => {
    setSelectedSubrace(subraceName);
    updateCharacter({ subrace: subraceName });
  };

  // Если для выбранной расы нет подрас, автоматически переходим к следующему шагу
  if (availableSubraces.length === 0) {
    // Используем setTimeout для предотвращения render loop
    setTimeout(() => nextStep(), 0);
    return null;
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title={`Выбор подрасы для ${character.race}`} 
        description="Некоторые расы имеют различные подрасы с уникальными особенностями и бонусами."
      />

      {availableSubraces.length > 0 ? (
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
                  <div key={subrace.name} className="border border-border rounded-lg p-4 hover:bg-accent/20 transition-colors">
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
      ) : (
        <Alert variant="default" className="bg-primary/10 border-primary/30">
          <Info className="h-5 w-5" />
          <AlertDescription>
            У расы {character.race} нет доступных подрас. Переход к следующему шагу...
          </AlertDescription>
        </Alert>
      )}

      <NavigationButtons
        allowNext={!!selectedSubrace || availableSubraces.length === 0}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubraceSelection;
