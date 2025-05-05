
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
  updateCharacter?: (updates: Partial<Character>) => void; // Добавляем для совместимости
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  onUpdate,
  updateCharacter, // Добавляем для поддержки двух вариантов названия
  backgrounds = [],
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const updateFunction = updateCharacter || onUpdate; // Используем правильную функцию
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');

  const handleSelectBackground = (backgroundName: string) => {
    setSelectedBackground(backgroundName);
    updateFunction({ background: backgroundName });
  };

  // Функция для корректной обработки различных форматов данных
  const formatArrayOrString = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'string') {
      return value;
    } else if (value === null || value === undefined) {
      return 'Нет';
    } else {
      return String(value);
    }
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
                <p>{formatArrayOrString(background.proficiencies?.skills)}</p>
                
                <div className="font-medium mt-2">Инструменты:</div>
                <p>{formatArrayOrString(background.proficiencies?.tools)}</p>
                
                <div className="font-medium mt-2">Языки:</div>
                <p>{formatArrayOrString(background.proficiencies?.languages)}</p>
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
