
import React, { useState } from 'react';
import { CharacterSheet } from '@/types/character';
import NavigationButtons from '@/components/character-creation/NavigationButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CharacterBasicsProps {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
}

const CharacterBasics: React.FC<CharacterBasicsProps> = ({
  character,
  updateCharacter,
  nextStep,
}) => {
  const [name, setName] = useState<string>(character.name || '');
  const [race, setRace] = useState<string>(character.race || '');
  const [gender, setGender] = useState<string>(character.gender || '');

  const handleNext = () => {
    updateCharacter({ 
      name, 
      race,
      gender
    });
    nextStep();
  };

  const isFormValid = name.trim() !== '' && race.trim() !== '';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Основные данные персонажа</h2>
      
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="name">Имя персонажа</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя персонажа"
            />
          </div>
          
          <div>
            <Label htmlFor="race">Раса</Label>
            <Select value={race} onValueChange={setRace}>
              <SelectTrigger id="race">
                <SelectValue placeholder="Выберите расу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Человек">Человек</SelectItem>
                <SelectItem value="Эльф">Эльф</SelectItem>
                <SelectItem value="Дварф">Дварф</SelectItem>
                <SelectItem value="Полурослик">Полурослик</SelectItem>
                <SelectItem value="Полуэльф">Полуэльф</SelectItem>
                <SelectItem value="Полуорк">Полуорк</SelectItem>
                <SelectItem value="Драконорожденный">Драконорожденный</SelectItem>
                <SelectItem value="Гном">Гном</SelectItem>
                <SelectItem value="Тифлинг">Тифлинг</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="gender">Пол</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Выберите пол" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Мужской">Мужской</SelectItem>
                <SelectItem value="Женский">Женский</SelectItem>
                <SelectItem value="Другой">Другой</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <NavigationButtons
        prevStep={() => {}} // Первый шаг, поэтому пустая функция
        nextStep={handleNext}
        allowNext={isFormValid}
        isFirstStep={true}
      />
    </div>
  );
};

export default CharacterBasics;
