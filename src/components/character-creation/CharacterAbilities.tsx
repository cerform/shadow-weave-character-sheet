
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface CharacterAbilitiesProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const CharacterAbilities: React.FC<CharacterAbilitiesProps> = ({
  character,
  updateCharacter,
  prevStep,
  nextStep,
}) => {
  const [abilities, setAbilities] = useState({
    strength: character.abilities?.strength || 10,
    dexterity: character.abilities?.dexterity || 10,
    constitution: character.abilities?.constitution || 10,
    intelligence: character.abilities?.intelligence || 10,
    wisdom: character.abilities?.wisdom || 10,
    charisma: character.abilities?.charisma || 10,
  });

  const getModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const handleChange = (ability: keyof typeof abilities, value: number) => {
    if (value < 3 || value > 20) return;
    
    setAbilities(prev => ({
      ...prev,
      [ability]: value
    }));
  };

  const handleNext = () => {
    updateCharacter({
      abilities: {
        STR: abilities.strength,
        DEX: abilities.dexterity,
        CON: abilities.constitution,
        INT: abilities.intelligence,
        WIS: abilities.wisdom,
        CHA: abilities.charisma,
        strength: abilities.strength,
        dexterity: abilities.dexterity,
        constitution: abilities.constitution,
        intelligence: abilities.intelligence,
        wisdom: abilities.wisdom,
        charisma: abilities.charisma
      }
    });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Характеристики персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          {Object.entries(abilities).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key} className="w-32 font-medium capitalize">
                {key === 'strength' ? 'Сила' : 
                 key === 'dexterity' ? 'Ловкость' : 
                 key === 'constitution' ? 'Телосложение' : 
                 key === 'intelligence' ? 'Интеллект' : 
                 key === 'wisdom' ? 'Мудрость' : 
                 key === 'charisma' ? 'Харизма' : key}
              </Label>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleChange(key as keyof typeof abilities, value - 1)}
                  disabled={value <= 3}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <Input 
                  id={key}
                  value={value}
                  readOnly
                  className="w-16 text-center"
                  placeholder="10"
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleChange(key as keyof typeof abilities, value + 1)}
                  disabled={value >= 20}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                
                <div className="w-12 text-center font-medium">
                  {getModifier(value)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={prevStep}
        nextStep={handleNext}
        allowNext={true}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterAbilities;
