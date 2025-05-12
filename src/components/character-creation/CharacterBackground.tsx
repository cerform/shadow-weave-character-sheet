import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { getAllBackgrounds } from '@/data/backgrounds';
import { useToast } from '@/hooks/use-toast';
import NavigationButtons from './NavigationButtons';

interface CharacterBackgroundProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void; // Исправление для соответствия onUpdate в CharacterCreationContent
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [backgrounds] = useState(getAllBackgrounds());
  const { toast } = useToast();
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');

  useEffect(() => {
    if (character.background) {
      setSelectedBackground(character.background);
    }
  }, [character.background]);

  const handleBackgroundChange = (backgroundName: string) => {
    const selectedBackground = backgrounds.find(bg => bg.name === backgroundName);
    if (!selectedBackground) return;

    // Initialize proficiencies object if it doesn't exist
    const proficiencies = character.proficiencies || {
      languages: [],
      tools: [],
      weapons: [],
      armor: [],
      skills: []
    };

    // For safety, check if the property exists before accessing it
    const backgroundProficiencies = selectedBackground.proficiencies || {};
    const weaponProfs = Array.isArray(backgroundProficiencies.weapons) ? backgroundProficiencies.weapons : [];
    const toolProfs = Array.isArray(backgroundProficiencies.tools) ? backgroundProficiencies.tools : [];
    const languageProfs = Array.isArray(backgroundProficiencies.languages) ? backgroundProficiencies.languages : [];

    // Обновляем персонажа
    updateCharacter({
      background: backgroundName,
      personalityTraits: selectedBackground.personalityTraits ? selectedBackground.personalityTraits[0] : '',
      ideals: selectedBackground.ideals ? selectedBackground.ideals[0].text : '',
      bonds: selectedBackground.bonds ? selectedBackground.bonds[0] : '',
      flaws: selectedBackground.flaws ? selectedBackground.flaws[0] : '',
      proficiencies: {
        ...proficiencies,
        weapons: [...proficiencies.weapons, ...weaponProfs],
        tools: [...proficiencies.tools, ...toolProfs],
        languages: [...proficiencies.languages, ...languageProfs]
      },
      equipment: [...(character.equipment || []), ...(selectedBackground.equipment || [])]
    });
  };

  const handleNext = () => {
    if (selectedBackground) {
      handleBackgroundChange(selectedBackground);
      nextStep();
    } else {
      toast({
        title: "Выберите предысторию",
        description: "Пожалуйста, выберите предысторию для вашего персонажа.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Предыстория персонажа</h2>
      <p className="mb-4">Выберите предысторию для своего персонажа, которая определит его навыки, умения и особенности.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((background) => (
          <Card
            key={background.name}
            className={`cursor-pointer ${selectedBackground === background.name ? 'border-2 border-primary' : ''}`}
            onClick={() => setSelectedBackground(background.name)}
          >
            <CardHeader>
              <CardTitle>{background.name}</CardTitle>
              <CardDescription>{background.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4">
                <li><strong>Навыки:</strong> {background.proficiencies?.skills?.join(', ') || 'Нет'}</li>
                <li><strong>Инструменты:</strong> {background.proficiencies?.tools?.join(', ') || 'Нет'}</li>
                <li><strong>Языки:</strong> {background.proficiencies?.languages?.join(', ') || 'Нет'}</li>
                <li><strong>Снаряжение:</strong> {background.equipment?.join(', ') || 'Нет'}</li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleNext}
        allowNext={!!selectedBackground}
      />
    </div>
  );
};

export default CharacterBackground;
