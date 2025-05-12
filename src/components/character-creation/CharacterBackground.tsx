
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { backgrounds } from "@/data/backgrounds";
import { Character } from '@/types/character';
import NavigationButtons from './NavigationButtons';

interface CharacterBackgroundProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [selectedBackground, setSelectedBackground] = useState(character.background || '');
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits || '');
  const [ideals, setIdeals] = useState(character.ideals || '');
  const [bonds, setBonds] = useState(character.bonds || '');
  const [flaws, setFlaws] = useState(character.flaws || '');

  useEffect(() => {
    // При изменении выбранной предыстории, обновляем связанные данные
    if (selectedBackground) {
      const background = backgrounds.find(bg => bg.name === selectedBackground);
      if (background) {
        // Создаем структуру proficiencies, если она отсутствует
        const updatedProficiencies = character.proficiencies || {
          languages: [],
          tools: [],
          weapons: [],
          armor: [],
          skills: []
        };

        // Обновляем профессии из предыстории
        if (background.proficiencies) {
          // Проверяем и обновляем каждую категорию профессий
          if (background.proficiencies.weapons && updatedProficiencies.weapons) {
            updatedProficiencies.weapons = [...updatedProficiencies.weapons, ...background.proficiencies.weapons];
          }
          if (background.proficiencies.tools && updatedProficiencies.tools) {
            updatedProficiencies.tools = [...updatedProficiencies.tools, ...background.proficiencies.tools];
          }
          if (background.proficiencies.languages && updatedProficiencies.languages) {
            updatedProficiencies.languages = [...updatedProficiencies.languages, ...background.proficiencies.languages];
          }
          if (background.proficiencies.skills && updatedProficiencies.skills) {
            updatedProficiencies.skills = [...(updatedProficiencies.skills || []), ...background.proficiencies.skills];
          }
        }

        // Обновляем персонажа с новыми данными
        updateCharacter({
          background: selectedBackground,
          proficiencies: updatedProficiencies
        });
      }
    }
  }, [selectedBackground]);

  // Сохраняем данные при переходе к следующему шагу
  const handleNext = () => {
    updateCharacter({
      personalityTraits,
      ideals,
      bonds,
      flaws
    });
    if (nextStep) nextStep();
  };

  // Проверяем, достаточно ли данных для перехода далее
  const allowNext = Boolean(selectedBackground);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Предыстория и личность</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Выбор предыстории */}
        <div>
          <Label htmlFor="background">Предыстория</Label>
          <Select 
            value={selectedBackground} 
            onValueChange={setSelectedBackground}
          >
            <SelectTrigger id="background" className="mt-1">
              <SelectValue placeholder="Выберите предысторию" />
            </SelectTrigger>
            <SelectContent>
              {backgrounds.map((bg) => (
                <SelectItem key={bg.name} value={bg.name}>
                  {bg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Описание выбранной предыстории */}
          {selectedBackground && (
            <div className="mt-2 text-sm text-muted-foreground">
              {backgrounds.find(bg => bg.name === selectedBackground)?.description || ''}
            </div>
          )}
        </div>

        {/* Черты личности */}
        <div>
          <Label htmlFor="personalityTraits">Черты характера</Label>
          <Textarea
            id="personalityTraits"
            placeholder="Опишите черты характера вашего персонажа"
            value={personalityTraits}
            onChange={(e) => setPersonalityTraits(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Идеалы */}
        <div>
          <Label htmlFor="ideals">Идеалы</Label>
          <Textarea
            id="ideals"
            placeholder="Какие идеалы движут вашим персонажем?"
            value={ideals}
            onChange={(e) => setIdeals(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Привязанности */}
        <div>
          <Label htmlFor="bonds">Привязанности</Label>
          <Textarea
            id="bonds"
            placeholder="К чему или кому привязан ваш персонаж?"
            value={bonds}
            onChange={(e) => setBonds(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Слабости */}
        <div>
          <Label htmlFor="flaws">Слабости</Label>
          <Textarea
            id="flaws"
            placeholder="Какие слабости или недостатки у вашего персонажа?"
            value={flaws}
            onChange={(e) => setFlaws(e.target.value)}
            className="mt-1"
          />
        </div>

        <NavigationButtons
          allowNext={allowNext}
          nextStep={handleNext}
          prevStep={prevStep}
          isFirstStep={false}
        />
      </CardContent>
    </Card>
  );
};

export default CharacterBackground;
