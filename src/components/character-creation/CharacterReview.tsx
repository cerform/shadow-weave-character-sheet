
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { races } from '@/data/races';
import { classes } from '@/data/classes';

interface CharacterReviewProps {
  character: any;
  onFinish: () => void;
}

export const CharacterReview = ({ character, onFinish }: CharacterReviewProps) => {
  // Helper function to find label by value
  const findLabel = (array: any[], value: string, valueProp = 'value', labelProp = 'label') => {
    const item = array.find(i => i[valueProp] === value);
    return item ? item[labelProp] : value;
  };
  
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

  const getAbilityModifier = (value: number): string => {
    const modifier = Math.floor((value - 10) / 2);
    if (modifier >= 0) return `+${modifier}`;
    return `${modifier}`;
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Обзор персонажа</h2>
      <p className="mb-6 text-muted-foreground">
        Проверьте информацию о вашем персонаже перед завершением создания.
      </p>
      
      <Card className="mb-6 bg-primary/5">
        <CardContent className="p-4">
          <h3 className="text-xl font-bold">{character.name || 'Безымянный герой'}</h3>
          <p className="text-muted-foreground">
            {character.race} {character.subrace ? `(${character.subrace})` : ''}, {character.class}, 
            уровень {character.level}
          </p>
          <p className="text-muted-foreground">
            {findLabel(backgrounds, character.background || '', 'value', 'label')} | {findLabel(alignments, character.alignment || '', 'value', 'label')}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold mb-3">Характеристики</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(character.abilities || {}).map(([ability, value]) => (
              <div key={ability} className="p-2 border rounded flex justify-between items-center">
                <span className="font-medium capitalize">
                  {ability === 'strength' ? 'Сила' : 
                   ability === 'dexterity' ? 'Ловкость' :
                   ability === 'constitution' ? 'Телосложение' :
                   ability === 'intelligence' ? 'Интеллект' :
                   ability === 'wisdom' ? 'Мудрость' : 'Харизма'}
                </span>
                <div className="text-right">
                  <span className="text-lg">{value}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    ({getAbilityModifier(Number(value))})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3">Личность</h3>
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Черты:</span> 
              <p className="text-sm">{character.personalityTraits || 'Не указано'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Идеалы:</span> 
              <p className="text-sm">{character.ideals || 'Не указано'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Узы:</span> 
              <p className="text-sm">{character.bonds || 'Не указано'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Слабости:</span> 
              <p className="text-sm">{character.flaws || 'Не указано'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <h3 className="font-semibold mb-2">Предыстория</h3>
          <p className="text-sm">{character.backstory || 'Персонаж пока не имеет предыстории.'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Внешность</h3>
          <p className="text-sm">{character.appearance || 'Описание внешности не добавлено.'}</p>
        </div>
      </div>
      
      <Button onClick={onFinish} className="w-full">Завершить и создать персонажа</Button>
    </div>
  );
};
