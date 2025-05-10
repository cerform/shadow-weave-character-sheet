import React from 'react';
import { Character } from '@/types/character';
import { ABILITY_SCORE_CAPS } from '@/types/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NavigationButtons from './NavigationButtons';
import SectionHeader from '@/components/ui/section-header';
import { useToast } from '@/hooks/use-toast';

interface CharacterLevelSelectionProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({
  character,
  onUpdate,
  nextStep,
  prevStep
}) => {
  const { toast } = useToast();
  
  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(event.target.value);
    
    if (isNaN(level) || level < 1 || level > 20) {
      toast({
        title: "Ошибка",
        description: "Уровень должен быть от 1 до 20",
        variant: "destructive"
      });
      return;
    }
    
    onUpdate({ level: level });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Выбор уровня"
        description="Определите уровень вашего персонажа. Это влияет на его способности и характеристики."
      />
      
      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="level">Уровень персонажа:</Label>
            <Input
              type="number"
              id="level"
              min="1"
              max="20"
              value={character.level}
              onChange={handleLevelChange}
            />
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={!!character.level}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterLevelSelection;
