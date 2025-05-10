
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import NavigationButtons from './NavigationButtons';
import { Shield, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CharacterLevelSelectionProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  onLevelChange: (level: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterLevelSelection: React.FC<CharacterLevelSelectionProps> = ({
  character,
  onUpdate,
  onLevelChange,
  nextStep,
  prevStep
}) => {
  const [level, setLevel] = useState<number>(character.level || 1);
  
  const handleLevelChange = (newLevels: number[]) => {
    const newLevel = newLevels[0];
    setLevel(newLevel);
    onLevelChange(newLevel);
  };
  
  const handleContinue = () => {
    onUpdate({ level });
    nextStep();
  };

  // Описания тиров игры для разных уровней
  const getTierDescription = (level: number) => {
    if (level <= 4) {
      return {
        name: 'Локальные герои',
        description: 'Персонажи являются начинающими искателями приключений, становясь известными в небольшой деревне или городе.'
      };
    } else if (level <= 10) {
      return {
        name: 'Герои региона',
        description: 'Персонажи достигли заметной силы и начинают влиять на события в регионе или королевстве.'
      };
    } else if (level <= 16) {
      return {
        name: 'Герои королевств',
        description: 'Персонажи обладают значительной силой и их деяния известны во многих странах и королевствах.'
      };
    } else {
      return {
        name: 'Герои мультивселенной',
        description: 'Герои эпических масштабов, способные влиять на судьбы планов существования и миров.'
      };
    }
  };

  const tierInfo = getTierDescription(level);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Выберите уровень персонажа</h2>
      
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Уровень {level}</span>
          </CardTitle>
          <CardDescription className="font-bold text-lg">{tierInfo.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            {tierInfo.description}
          </p>
          
          <div className="mb-8">
            <Slider
              defaultValue={[character.level || 1]}
              min={1}
              max={20}
              step={1}
              value={[level]}
              onValueChange={handleLevelChange}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
          </div>

          {level > 1 && (
            <div className="bg-amber-600/20 border border-amber-600/30 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-amber-500">Персонаж повышенного уровня</h3>
                  <p className="text-sm text-muted-foreground">
                    Начиная с уровня выше 1-го, ваш персонаж будет иметь дополнительные особенности, заклинания и возможности.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <NavigationButtons
        nextStep={handleContinue}
        prevStep={prevStep}
        allowNext={level >= 1}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterLevelSelection;
