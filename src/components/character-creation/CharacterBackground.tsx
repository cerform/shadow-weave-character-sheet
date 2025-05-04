
import React, { useState } from 'react';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CharacterSheet } from '@/types/character';
import { alignments } from '@/data/alignments';

interface CharacterBackgroundProps {
  character: {
    background: string;
    backstory: string;
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
  };
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const backgroundOptions = [
  { label: "Артист", value: "Артист", description: "Вы посвятили свою жизнь искусству" },
  { label: "Благородный", value: "Благородный", description: "Вы родились в богатой и влиятельной семье" },
  { label: "Гильдейский ремесленник", value: "Гильдейский ремесленник", description: "Вы являетесь членом гильдии ремесленников" },
  { label: "Моряк", value: "Моряк", description: "Вы бороздите моря на торговых или военных кораблях" },
  { label: "Мудрец", value: "Мудрец", description: "Вы потратили годы на изучение знаний мультивселенной" },
  { label: "Народный герой", value: "Народный герой", description: "Вы происходите из низов общества, но судьба приготовила вам большее" },
  { label: "Отшельник", value: "Отшельник", description: "Вы жили в уединении или в закрытом сообществе" },
  { label: "Преступник", value: "Преступник", description: "Вы имеете темное прошлое и опыт нарушения закона" },
  { label: "Прислужник", value: "Прислужник", description: "Вы выросли в услужении у богатого и влиятельного господина" },
  { label: "Солдат", value: "Солдат", description: "Война была частью вашей жизни с юных лет" },
  { label: "Чужеземец", value: "Чужеземец", description: "Вы выросли в дикой местности, вдали от цивилизации" },
  { label: "Шарлатан", value: "Шарлатан", description: "Вы зарабатывали на жизнь обманом и хитрыми уловками" },
];

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  prevStep,
  nextStep,
}) => {
  const [background, setBackground] = useState<string>(character.background || '');
  const [alignment, setAlignment] = useState<string>("");
  const [backstory, setBackstory] = useState<string>(character.backstory || '');
  const [personalityTraits, setPersonalityTraits] = useState<string>(character.personalityTraits || '');
  const [ideals, setIdeals] = useState<string>(character.ideals || '');
  const [bonds, setBonds] = useState<string>(character.bonds || '');
  const [flaws, setFlaws] = useState<string>(character.flaws || '');

  const handleNext = () => {
    updateCharacter({
      background,
      alignment,
      backstory,
      personalityTraits,
      ideals,
      bonds,
      flaws
    });
    nextStep();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Предыстория персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-6">
          <div>
            <Label htmlFor="background" className="block mb-2">Выберите предысторию</Label>
            <Select value={background} onValueChange={setBackground}>
              <SelectTrigger id="background">
                <SelectValue placeholder="Выберите предысторию" />
              </SelectTrigger>
              <SelectContent>
                {backgroundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {background && (
              <p className="mt-2 text-sm text-muted-foreground">
                {backgroundOptions.find(b => b.value === background)?.description}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="alignment" className="block mb-2">Мировоззрение</Label>
            <Select value={alignment} onValueChange={setAlignment}>
              <SelectTrigger id="alignment">
                <SelectValue placeholder="Выберите мировоззрение" />
              </SelectTrigger>
              <SelectContent>
                {alignments.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({option.value})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {alignment && (
              <p className="mt-2 text-sm text-muted-foreground">
                {alignments.find(a => a.value === alignment)?.description}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="personalityTraits">Черты характера</Label>
            <Textarea 
              id="personalityTraits"
              value={personalityTraits}
              onChange={(e) => setPersonalityTraits(e.target.value)}
              placeholder="Опишите характерные черты вашего персонажа"
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="ideals">Идеалы</Label>
            <Textarea 
              id="ideals"
              value={ideals}
              onChange={(e) => setIdeals(e.target.value)}
              placeholder="Опишите идеалы, которыми руководствуется ваш персонаж"
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="bonds">Привязанности</Label>
            <Textarea 
              id="bonds"
              value={bonds}
              onChange={(e) => setBonds(e.target.value)}
              placeholder="Опишите привязанности вашего персонажа"
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="flaws">Слабости</Label>
            <Textarea 
              id="flaws"
              value={flaws}
              onChange={(e) => setFlaws(e.target.value)}
              placeholder="Опишите слабости вашего персонажа"
              className="h-24"
            />
          </div>
          
          <div>
            <Label htmlFor="backstory">История персонажа</Label>
            <Textarea 
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Опишите историю вашего персонажа"
              className="h-36"
            />
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={background.trim() !== ''}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBackground;
