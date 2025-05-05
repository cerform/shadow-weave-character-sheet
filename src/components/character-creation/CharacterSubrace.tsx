
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';
import { useToast } from '@/hooks/use-toast';

interface CharacterSubraceProps {
  subraces: any[];
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterSubrace: React.FC<CharacterSubraceProps> = ({
  subraces,
  character,
  onUpdate,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const { toast } = useToast();
  const [selectedSubrace, setSelectedSubrace] = useState(character.subrace || '');

  const handleSubraceSelect = (subraceName: string) => {
    setSelectedSubrace(subraceName);
  };

  const handleNext = () => {
    if (selectedSubrace) {
      onUpdate({ subrace: selectedSubrace });
      
      // Находим информацию о подрасе
      const subraceInfo = subraces.find(subrace => subrace.name === selectedSubrace);
      
      // Уведомляем пользователя о выборе
      toast({
        title: "Разновидность расы выбрана",
        description: `Вы выбрали разновидность ${selectedSubrace} для расы ${character.race}`
      });
      
      nextStep();
    } else {
      toast({
        title: "Выберите разновидность",
        description: "Пожалуйста, выберите разновидность расы перед тем, как продолжить.",
        variant: "destructive"
      });
    }
  };

  // Если нет подрас, пропускаем этот шаг
  if (!subraces || subraces.length === 0) {
    onUpdate({ subrace: undefined });
    nextStep();
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Выбор разновидности расы</h2>
      <p className="text-muted-foreground mb-6">
        Раса {character.race} имеет несколько разновидностей. Выберите одну из них.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {subraces.map((subrace) => (
          <Card 
            key={subrace.name} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSubrace === subrace.name ? 'border-primary shadow-sm' : ''
            }`}
            onClick={() => handleSubraceSelect(subrace.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{subrace.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">{subrace.description}</CardDescription>
              <div className="text-xs text-muted-foreground">
                <div className="font-semibold mb-1">Особенности:</div>
                <ul className="list-disc pl-5">
                  {subrace.traits.map((trait: string, index: number) => (
                    <li key={index}>{trait}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NavigationButtons
        allowNext={!!selectedSubrace}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterSubrace;
