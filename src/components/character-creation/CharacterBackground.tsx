import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CharacterSheet } from '@/types/character';
import { backgrounds } from '@/data/backgrounds';

interface CharacterBackgroundProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [background, setBackground] = useState(character.background || '');
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(character.personalityTraits || []);
  const [ideals, setIdeals] = useState<string[]>(character.ideals || []);
  const [bonds, setBonds] = useState<string[]>(character.bonds || []);
  const [flaws, setFlaws] = useState<string[]>(character.flaws || []);
  const [backstory, setBackstory] = useState(character.backstory || '');

  // Обработчик выбора предыстории
  const handleBackgroundChange = (value: string) => {
    setBackground(value);
    const selectedBackground = backgrounds.find(bg => bg.name === value);
    
    if (selectedBackground) {
      setPersonalityTraits(selectedBackground.personalityTraits.slice(0, 2));
      setIdeals([selectedBackground.ideals[0]]);
      setBonds([selectedBackground.bonds[0]]);
      setFlaws([selectedBackground.flaws[0]]);
    }
  };

  // Обработчик сохранения и перехода к следующему шагу
  const handleSaveBackground = () => {
    updateCharacter({
      background,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      backstory
    });
    nextStep();
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Предыстория персонажа</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Предыстория:</label>
            <Select value={background} onValueChange={handleBackgroundChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предысторию" />
              </SelectTrigger>
              <SelectContent>
                {backgrounds.map((bg) => (
                  <SelectItem key={bg.name} value={bg.name}>{bg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Черты характера:</label>
            <Textarea 
              value={personalityTraits.join('\n')} 
              onChange={(e) => setPersonalityTraits(e.target.value.split('\n'))}
              className="min-h-20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Идеалы:</label>
            <Textarea 
              value={ideals.join('\n')} 
              onChange={(e) => setIdeals(e.target.value.split('\n'))}
              className="min-h-20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Привязанности:</label>
            <Textarea 
              value={bonds.join('\n')} 
              onChange={(e) => setBonds(e.target.value.split('\n'))}
              className="min-h-20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Слабости:</label>
            <Textarea 
              value={flaws.join('\n')} 
              onChange={(e) => setFlaws(e.target.value.split('\n'))}
              className="min-h-20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">История персонажа:</label>
            <Textarea 
              value={backstory} 
              onChange={(e) => setBackstory(e.target.value)}
              className="min-h-40"
              placeholder="Опишите историю вашего персонажа..."
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="secondary" onClick={prevStep}>
              Назад
            </Button>
            <Button onClick={handleSaveBackground}>
              Сохранить и продолжить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterBackground;
