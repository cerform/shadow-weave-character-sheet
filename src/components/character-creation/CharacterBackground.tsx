
import React, { useState } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavigationButtons from './NavigationButtons';

export interface CharacterBackgroundProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
  backgrounds?: any[];
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  onUpdate,
  backgrounds = [],
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');

  const handleSelectBackground = (backgroundName: string) => {
    setSelectedBackground(backgroundName);
    onUpdate({ background: backgroundName });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Выберите предысторию персонажа</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {backgrounds.map((background, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedBackground === background.name ? 'border-primary shadow-sm' : ''
            }`}
            onClick={() => handleSelectBackground(background.name)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{background.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{background.description}</p>
              
              <div className="mt-4 text-sm">
                <div className="font-medium">Навыки:</div>
                <p>{background.proficiencies?.skills?.join(', ')}</p>
                
                <div className="font-medium mt-2">Инструменты:</div>
                <p>{background.proficiencies?.tools?.join(', ') || 'Нет'}</p>
                
                <div className="font-medium mt-2">Языки:</div>
                <p>{background.proficiencies?.languages?.join(', ') || 'Нет'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <NavigationButtons
        allowNext={!!selectedBackground}
        nextStep={nextStep}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBackground;
