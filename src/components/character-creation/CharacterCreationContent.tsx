import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCharacter } from '@/contexts/CharacterContext';
import { Character } from '@/types/character';
import { toast } from 'sonner';

interface CharacterCreationContentProps {
  onNext: () => void;
  onPrev: () => void;
}

const CharacterCreationContent: React.FC<CharacterCreationContentProps> = ({ onNext, onPrev }) => {
  const { character, updateCharacter } = useCharacter();
  const [activeStep, setActiveStep] = useState(0);

  const handleBasicInfoSubmit = (basicInfo: Partial<Character>) => {
    updateCharacter(basicInfo);
    setActiveStep(activeStep + 1);
  };

  const handleAbilityScoresSubmit = (abilityScores: any) => {
    updateCharacter({ abilities: abilityScores });
    setActiveStep(activeStep + 1);
  };

  const handlePersonalDetailsSubmit = (details: any) => {
    updateCharacter({
      ...details,
      personalityTraits: details.personality,  // Map personality to personalityTraits
      appearance: details.portrait             // Map portrait to appearance
    });
    setActiveStep(activeStep + 1);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Имя персонажа</Label>
                <Input
                  type="text"
                  id="name"
                  value={character?.name || ''}
                  onChange={(e) => updateCharacter({ name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="race">Раса</Label>
                <Input
                  type="text"
                  id="race"
                  value={character?.race || ''}
                  onChange={(e) => updateCharacter({ race: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="class">Класс</Label>
                <Input
                  type="text"
                  id="class"
                  value={character?.class || ''}
                  onChange={(e) => updateCharacter({ class: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="level">Уровень</Label>
                <Input
                  type="number"
                  id="level"
                  value={character?.level?.toString() || '1'}
                  onChange={(e) => updateCharacter({ level: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="background">Предыстория</Label>
                <Input
                  type="text"
                  id="background"
                  value={character?.background || ''}
                  onChange={(e) => updateCharacter({ background: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="alignment">Мировоззрение</Label>
                <Input
                  type="text"
                  id="alignment"
                  value={character?.alignment || ''}
                  onChange={(e) => updateCharacter({ alignment: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={() => handleBasicInfoSubmit({
              name: character?.name,
              race: character?.race,
              class: character?.class,
              level: character?.level,
              background: character?.background,
              alignment: character?.alignment
            })} className="mt-4">Далее</Button>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Характеристики</h2>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="strength">Сила (STR)</Label>
                <Input
                  type="number"
                  id="strength"
                  value={character?.abilities?.STR?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, STR: parseInt(e.target.value) } })}
                />
              </div>
              <div>
                <Label htmlFor="dexterity">Ловкость (DEX)</Label>
                <Input
                  type="number"
                  id="dexterity"
                  value={character?.abilities?.DEX?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, DEX: parseInt(e.target.value) } })}
                />
              </div>
              <div>
                <Label htmlFor="constitution">Телосложение (CON)</Label>
                <Input
                  type="number"
                  id="constitution"
                  value={character?.abilities?.CON?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, CON: parseInt(e.target.value) } })}
                />
              </div>
              <div>
                <Label htmlFor="intelligence">Интеллект (INT)</Label>
                <Input
                  type="number"
                  id="intelligence"
                  value={character?.abilities?.INT?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, INT: parseInt(e.target.value) } })}
                />
              </div>
              <div>
                <Label htmlFor="wisdom">Мудрость (WIS)</Label>
                <Input
                  type="number"
                  id="wisdom"
                  value={character?.abilities?.WIS?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, WIS: parseInt(e.target.value) } })}
                />
              </div>
              <div>
                <Label htmlFor="charisma">Харизма (CHA)</Label>
                <Input
                  type="number"
                  id="charisma"
                  value={character?.abilities?.CHA?.toString() || '10'}
                  onChange={(e) => updateCharacter({ abilities: { ...character.abilities, CHA: parseInt(e.target.value) } })}
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveStep(activeStep - 1)}>Назад</Button>
              <Button onClick={() => handleAbilityScoresSubmit({
                STR: character?.abilities?.STR,
                DEX: character?.abilities?.DEX,
                CON: character?.abilities?.CON,
                INT: character?.abilities?.INT,
                WIS: character?.abilities?.WIS,
                CHA: character?.abilities?.CHA
              })}>Далее</Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Личные детали</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personality">Личность</Label>
                <Textarea
                  id="personality"
                  placeholder="Опишите личность вашего персонажа"
                  value={character?.personalityTraits || ''}
                  onChange={(e) => updateCharacter({ personalityTraits: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ideals">Идеалы</Label>
                <Textarea
                  id="ideals"
                  placeholder="Опишите идеалы вашего персонажа"
                  value={character?.ideals || ''}
                  onChange={(e) => updateCharacter({ ideals: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bonds">Привязанности</Label>
                <Textarea
                  id="bonds"
                  placeholder="Опишите привязанности вашего персонажа"
                  value={character?.bonds || ''}
                  onChange={(e) => updateCharacter({ bonds: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="flaws">Слабости</Label>
                <Textarea
                  id="flaws"
                  placeholder="Опишите слабости вашего персонажа"
                  value={character?.flaws || ''}
                  onChange={(e) => updateCharacter({ flaws: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="portrait">Внешность</Label>
                <Textarea
                  id="portrait"
                  placeholder="Опишите внешность вашего персонажа"
                  value={character?.appearance || ''}
                  onChange={(e) => updateCharacter({ appearance: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="backstory">Предыстория</Label>
                <Textarea
                  id="backstory"
                  placeholder="Опишите предысторию вашего персонажа"
                  value={character?.backstory || ''}
                  onChange={(e) => updateCharacter({ backstory: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveStep(activeStep - 1)}>Назад</Button>
              <Button onClick={() => handlePersonalDetailsSubmit({
                personality: character?.personalityTraits,
                ideals: character?.ideals,
                bonds: character?.bonds,
                flaws: character?.flaws,
                portrait: character?.appearance,
                backstory: character?.backstory
              })}>Далее</Button>
            </div>
          </div>
        );
      default:
        return <div>Завершено!</div>;
    }
  };

  return (
    <div>
      {renderStepContent()}
    </div>
  );
};

export default CharacterCreationContent;
