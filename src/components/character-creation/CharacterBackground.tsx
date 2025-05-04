
import React, { useState } from "react";
import NavigationButtons from "./NavigationButtons";
import { CharacterSheet } from '@/types/character';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import SectionHeader from "@/components/ui/section-header";
import { useToast } from "@/hooks/use-toast";

interface CharacterBackgroundProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const backgroundOptions = [
  "Артист", "Беспризорник", "Благородный", "Гильдейский ремесленник", "Моряк",
  "Мудрец", "Отшельник", "Преступник", "Прислужник", "Солдат", "Чужеземец", "Шарлатан"
];

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep,
}) => {
  const { toast } = useToast();
  
  const [background, setBackground] = useState(character.background || "");
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits || "");
  const [ideals, setIdeals] = useState<string>(character.ideals ? (Array.isArray(character.ideals) ? character.ideals.join(', ') : character.ideals) : "");
  const [bonds, setBonds] = useState<string>(character.bonds ? (Array.isArray(character.bonds) ? character.bonds.join(', ') : character.bonds) : "");
  const [flaws, setFlaws] = useState<string>(character.flaws ? (Array.isArray(character.flaws) ? character.flaws.join(', ') : character.flaws) : "");
  const [backstory, setBackstory] = useState(character.backstory || "");

  const handleNext = () => {
    // Преобразуем строки в массивы
    const idealsArray = ideals.split(',').map(item => item.trim()).filter(Boolean);
    const bondsArray = bonds.split(',').map(item => item.trim()).filter(Boolean);
    const flawsArray = flaws.split(',').map(item => item.trim()).filter(Boolean);
    
    const updates = {
      background,
      personalityTraits,
      ideals: idealsArray,
      bonds: bondsArray,
      flaws: flawsArray,
      backstory
    };

    updateCharacter(updates);
    
    toast({
      title: "Предыстория сохранена",
      description: "Детали предыстории персонажа сохранены"
    });
    
    nextStep();
  };

  const canProceed = background !== "" && backstory !== "";

  return (
    <div>
      <SectionHeader
        title="Предыстория персонажа"
        description="Выберите предысторию и заполните детали личности персонажа."
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="background">Предыстория</Label>
              <select
                id="background"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-full p-3 rounded-md bg-background border border-input"
              >
                <option value="">Выберите предысторию</option>
                {backgroundOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalityTraits">Черты характера</Label>
              <Textarea
                id="personalityTraits"
                value={personalityTraits}
                onChange={(e) => setPersonalityTraits(e.target.value)}
                className="min-h-[80px]"
                placeholder="Опишите черты характера вашего персонажа"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ideals">Идеалы</Label>
              <Textarea
                id="ideals"
                value={ideals}
                onChange={(e) => setIdeals(e.target.value)}
                className="min-h-[80px]"
                placeholder="Опишите идеалы вашего персонажа"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonds">Привязанности</Label>
              <Textarea
                id="bonds"
                value={bonds}
                onChange={(e) => setBonds(e.target.value)}
                className="min-h-[80px]"
                placeholder="Опишите привязанности вашего персонажа"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flaws">Слабости</Label>
              <Textarea
                id="flaws"
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                className="min-h-[80px]"
                placeholder="Опишите слабости вашего персонажа"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backstory" className="flex justify-between">
                История персонажа <span className="text-muted-foreground text-sm">(Обязательно)</span>
              </Label>
              <Textarea
                id="backstory"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                className="min-h-[150px]"
                placeholder="Напишите подробную историю персонажа"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        allowNext={canProceed}
        nextStep={handleNext}
        prevStep={prevStep}
        isFirstStep={false}
      />
    </div>
  );
};

export default CharacterBackground;
