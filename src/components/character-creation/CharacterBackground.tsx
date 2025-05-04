
import React, { useState, useEffect } from 'react';
import { CharacterSheet } from '@/types/character';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import NavigationButtons from './NavigationButtons';

interface BackgroundOption {
  value: string;
  label: string;
  description: string;
}

interface CharacterBackgroundProps {
  character: {
    background: string;
    backstory: string;
    personalityTraits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
  };
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const backgroundOptions: BackgroundOption[] = [
  { value: "Артист", label: "Артист", description: "Вы выросли во всеобщем внимании. Вы знаете, как развлечь публику и доставить ей удовольствие." },
  { value: "Беспризорник", label: "Беспризорник", description: "Вы выросли на улицах, умея выживать благодаря хитрости, смелости и удаче." },
  { value: "Благородный", label: "Благородный", description: "Вы знаете, что такое богатство, власть и привилегии." },
  { value: "Гильдейский ремесленник", label: "Гильдейский ремесленник", description: "Вы — член гильдии ремесленников, опытный в определённом поле, тесно связанный с другими ремесленниками." },
  { value: "Мудрец", label: "Мудрец", description: "Вы провели годы за изучением мультивселенной." },
  { value: "Народный герой", label: "Народный герой", description: "Вы были простолюдином, пока что-то не произошло, отметив вас для великих свершений." },
  { value: "Отшельник", label: "Отшельник", description: "Вы жили в уединении — либо в закрытой общине, либо совершенно одни." },
  { value: "Преступник", label: "Преступник", description: "Вы опытный преступник, имеющий историю нарушения законов." },
  { value: "Прислужник", label: "Прислужник", description: "Вы провели свою молодость под властью могущественного хозяина, которому служили с преданностью." },
  { value: "Солдат", label: "Солдат", description: "Войны были частью вашей жизни с самой юности." },
  { value: "Чужеземец", label: "Чужеземец", description: "Вы чужие в этих краях. Вы путешествуете издалека, и поэтому особенные." },
  { value: "Шарлатан", label: "Шарлатан", description: "Вы знаете, как говорить с людьми и манипулировать ими, чтобы они поступали так, как вы хотите." },
];

const CharacterBackground: React.FC<CharacterBackgroundProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [selectedBackground, setSelectedBackground] = useState(character.background || "");
  const [backstory, setBackstory] = useState(character.backstory || "");
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits || "");
  const [ideals, setIdeals] = useState(character.ideals || "");
  const [bonds, setBonds] = useState(character.bonds || "");
  const [flaws, setFlaws] = useState(character.flaws || "");

  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    setSelectedBackground(character.background || "");
    setBackstory(character.backstory || "");
    setPersonalityTraits(character.personalityTraits || "");
    setIdeals(character.ideals || "");
    setBonds(character.bonds || "");
    setFlaws(character.flaws || "");
  }, [character]);

  // Обработчик для сохранения и перехода к следующему шагу
  const handleSaveAndContinue = () => {
    updateCharacter({
      background: selectedBackground,
      backstory, // Теперь обязательное поле, уже не опциональное
      personalityTraits,
      ideals,
      bonds,
      flaws
    });
    nextStep();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Предыстория персонажа</h2>
      
      <div>
        <Label htmlFor="background">Выберите предысторию</Label>
        <Select
          value={selectedBackground}
          onValueChange={(value) => setSelectedBackground(value)}
        >
          <SelectTrigger className="w-full mb-2">
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
        
        {selectedBackground && (
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {backgroundOptions.find(bg => bg.value === selectedBackground)?.description || ""}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="personalityTraits">Черты характера</Label>
        <Textarea
          id="personalityTraits"
          className="h-24"
          placeholder="Опишите черты характера вашего персонажа"
          value={personalityTraits}
          onChange={(e) => setPersonalityTraits(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="ideals">Идеалы</Label>
        <Textarea
          id="ideals"
          placeholder="Что движет вашим персонажем? Какие принципы он отстаивает?"
          value={ideals}
          onChange={(e) => setIdeals(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="bonds">Привязанности</Label>
        <Textarea
          id="bonds"
          placeholder="Что связывает вашего персонажа с людьми, местами или идеями?"
          value={bonds}
          onChange={(e) => setBonds(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="flaws">Слабости</Label>
        <Textarea
          id="flaws"
          placeholder="Какие недостатки или страхи есть у вашего персонажа?"
          value={flaws}
          onChange={(e) => setFlaws(e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="backstory">История персонажа</Label>
        <Textarea
          id="backstory"
          className="h-36"
          placeholder="Опишите прошлое вашего персонажа"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
        />
      </div>
      
      <NavigationButtons 
        prevStep={prevStep} 
        nextStep={handleSaveAndContinue}
        nextDisabled={!selectedBackground || !backstory}
      />
    </div>
  );
};

export default CharacterBackground;
