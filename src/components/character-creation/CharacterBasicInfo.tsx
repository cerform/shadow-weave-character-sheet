
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CharacterBasicInfoProps {
  character: any;
  onUpdateCharacter: (updates: any) => void;
}

export const CharacterBasicInfo = ({ character, onUpdateCharacter }: CharacterBasicInfoProps) => {
  const alignments = [
    { value: 'lawful-good', label: 'Законопослушный добрый' },
    { value: 'neutral-good', label: 'Нейтральный добрый' },
    { value: 'chaotic-good', label: 'Хаотичный добрый' },
    { value: 'lawful-neutral', label: 'Законопослушный нейтральный' },
    { value: 'true-neutral', label: 'Истинно нейтральный' },
    { value: 'chaotic-neutral', label: 'Хаотичный нейтральный' },
    { value: 'lawful-evil', label: 'Законопослушный злой' },
    { value: 'neutral-evil', label: 'Нейтральный злой' },
    { value: 'chaotic-evil', label: 'Хаотичный злой' },
  ];

  const backgrounds = [
    { value: 'acolyte', label: 'Послушник' },
    { value: 'charlatan', label: 'Шарлатан' },
    { value: 'criminal', label: 'Преступник' },
    { value: 'entertainer', label: 'Артист' },
    { value: 'folk-hero', label: 'Народный герой' },
    { value: 'guild-artisan', label: 'Гильдейский ремесленник' },
    { value: 'hermit', label: 'Отшельник' },
    { value: 'noble', label: 'Благородный' },
    { value: 'outlander', label: 'Чужеземец' },
    { value: 'sage', label: 'Мудрец' },
    { value: 'sailor', label: 'Моряк' },
    { value: 'soldier', label: 'Солдат' },
    { value: 'urchin', label: 'Беспризорник' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Основная информация</h2>
      <p className="mb-6 text-muted-foreground">
        Заполните основную информацию о вашем персонаже, включая имя, мировоззрение и предысторию.
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="character-name">Имя персонажа</Label>
          <Input 
            id="character-name"
            placeholder="Введите имя персонажа"
            value={character.name}
            onChange={(e) => onUpdateCharacter({ name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="alignment">Мировоззрение</Label>
            <Select 
              value={character.alignment} 
              onValueChange={(value) => onUpdateCharacter({ alignment: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите мировоззрение" />
              </SelectTrigger>
              <SelectContent>
                {alignments.map(alignment => (
                  <SelectItem key={alignment.value} value={alignment.value}>
                    {alignment.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background">Предыстория</Label>
            <Select 
              value={character.background} 
              onValueChange={(value) => onUpdateCharacter({ background: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите предысторию" />
              </SelectTrigger>
              <SelectContent>
                {backgrounds.map(background => (
                  <SelectItem key={background.value} value={background.value}>
                    {background.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
