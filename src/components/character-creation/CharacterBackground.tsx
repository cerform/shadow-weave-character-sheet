
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Character } from '@/types/character';
import { getAllBackgrounds } from '@/data/backgrounds';
import { useToast } from '@/hooks/use-toast';
import NavigationButtons from './NavigationButtons';
import { Background, BackgroundIdeal } from '@/types/background';

interface CharacterBackgroundProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const { toast } = useToast();
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');

  useEffect(() => {
    // Get backgrounds but cast to the correct type
    const bgData = getAllBackgrounds();
    setBackgrounds(bgData as unknown as Background[]);
    
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

    // Safely get array values with defaults if missing or wrong type
    const getArraySafely = <T,>(value: any, defaultValue: T[] = []): T[] => {
      if (Array.isArray(value)) return value as T[];
      if (typeof value === 'string') return [value] as T[];
      return defaultValue;
    };
    
    // For safety, check if properties exist before accessing them
    const backgroundProficiencies = selectedBackground.proficiencies || {};
    
    // Get weapon proficiencies safely
    const weaponProfs = backgroundProficiencies.weapons ? 
      getArraySafely<string>(backgroundProficiencies.weapons) : [];
      
    // Get tool proficiencies safely
    const toolProfs = backgroundProficiencies.tools ? 
      getArraySafely<string>(backgroundProficiencies.tools) : [];
      
    // Get language proficiencies safely
    const languageProfs = backgroundProficiencies.languages ? 
      getArraySafely<string>(backgroundProficiencies.languages) : [];
    
    // Safely get text fields with null checks
    let personalityTrait = '';
    if (selectedBackground.personalityTraits && 
        Array.isArray(selectedBackground.personalityTraits) && 
        selectedBackground.personalityTraits.length > 0) {
      personalityTrait = selectedBackground.personalityTraits[0];
    }
    
    let idealText = '';
    if (selectedBackground.ideals && 
        Array.isArray(selectedBackground.ideals) && 
        selectedBackground.ideals.length > 0) {
      const ideal = selectedBackground.ideals[0];
      if (ideal && typeof ideal === 'object' && 'text' in ideal) {
        // Check if ideal is not null and has a text property
        idealText = ideal.text;
      }
    }
    
    let bond = '';
    if (selectedBackground.bonds && 
        Array.isArray(selectedBackground.bonds) && 
        selectedBackground.bonds.length > 0) {
      bond = selectedBackground.bonds[0];
    }
    
    let flaw = '';
    if (selectedBackground.flaws && 
        Array.isArray(selectedBackground.flaws) && 
        selectedBackground.flaws.length > 0) {
      flaw = selectedBackground.flaws[0];
    }
    
    // Safe equipment handling - make a type guard for equipment
    let equipment: string[] = [];
    if ('equipment' in selectedBackground && selectedBackground.equipment) {
      equipment = Array.isArray(selectedBackground.equipment) ? 
        selectedBackground.equipment : 
        [selectedBackground.equipment];
    }

    // Update the character
    updateCharacter({
      background: backgroundName,
      personalityTraits: personalityTrait,
      ideals: idealText,
      bonds: bond,
      flaws: flaw,
      proficiencies: {
        ...proficiencies,
        weapons: [...proficiencies.weapons, ...weaponProfs],
        tools: [...proficiencies.tools, ...toolProfs],
        languages: [...proficiencies.languages, ...languageProfs]
      },
      equipment: [...(character.equipment || []), ...equipment]
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
        {backgrounds.map((background) => {
          // Safely get skills
          const skills = background.proficiencies?.skills && Array.isArray(background.proficiencies.skills) ? 
            background.proficiencies.skills.join(', ') : 'Нет';
          
          // Safely get tools
          const tools = background.proficiencies?.tools ? 
            (Array.isArray(background.proficiencies.tools) ? 
              background.proficiencies.tools.join(', ') : background.proficiencies.tools) : 'Нет';
          
          // Safely get languages
          const languages = background.proficiencies?.languages ? 
            (Array.isArray(background.proficiencies.languages) ? 
              background.proficiencies.languages.join(', ') : background.proficiencies.languages) : 'Нет';
          
          // Safely get equipment with type guard
          const equipment = 'equipment' in background && background.equipment ? 
            (Array.isArray(background.equipment) ? 
              background.equipment.join(', ') : background.equipment) : 'Нет';
            
          return (
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
                  <li><strong>Навыки:</strong> {skills}</li>
                  <li><strong>Инструменты:</strong> {tools}</li>
                  <li><strong>Языки:</strong> {languages}</li>
                  <li><strong>Снаряжение:</strong> {equipment}</li>
                </ul>
              </CardContent>
            </Card>
          );
        })}
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
