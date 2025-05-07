import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Character } from '@/types/character'; // Fixed import from .ts instead of .d.ts
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface CharacterBasicInfoProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  nextStep?: () => void;
  prevStep?: () => void;
}

const CharacterBasicInfo: React.FC<CharacterBasicInfoProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const [name, setName] = useState(character.name || '');
  const [race, setRace] = useState(character.race || '');
  const [className, setClassName] = useState(character.className || '');
  const [level, setLevel] = useState(character.level || 1);
  const [background, setBackground] = useState(character.background || '');
  const [alignment, setAlignment] = useState(character.alignment || '');

  useEffect(() => {
    updateCharacter({ name, race, className, level, background, alignment });
  }, [name, race, className, level, background, alignment, updateCharacter]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Основная информация</h2>
        <p className="text-sm text-muted-foreground">
          Заполните основную информацию о вашем персонаже.
        </p>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Персональные данные</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Имя персонажа</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="race">Раса</Label>
                <Input
                  type="text"
                  id="race"
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Класс</Label>
                <Input
                  type="text"
                  id="class"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="level">Уровень</Label>
                <Input
                  type="number"
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background">Предыстория</Label>
                <Input
                  type="text"
                  id="background"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="alignment">Мировоззрение</Label>
                <Input
                  type="text"
                  id="alignment"
                  value={alignment}
                  onChange={(e) => setAlignment(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between pt-4">
        {prevStep && (
          <button 
            onClick={prevStep}
            className="px-4 py-2 border rounded text-sm"
          >
            Назад
          </button>
        )}
        {nextStep && (
          <Button 
            onClick={nextStep}
            className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm"
          >
            Далее
          </Button>
        )}
      </div>
    </div>
  );
};

export default CharacterBasicInfo;
