
import React from 'react';
import { Character } from '@/contexts/CharacterContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface BackgroundTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({ character, onUpdate }) => {
  // Обработчик изменения текстовых полей
  const handleChange = (field: keyof Character) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ [field]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Предыстория и характер</h2>
      
      {/* Предыстория */}
      <Card>
        <CardHeader>
          <CardTitle>Предыстория: {character.background}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="backstory">История персонажа</Label>
              <Textarea
                id="backstory"
                value={character.backstory || ''}
                onChange={handleChange('backstory')}
                placeholder="Опишите историю вашего персонажа..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Черты характера */}
      <Card>
        <CardHeader>
          <CardTitle>Особенности характера</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personalityTraits">Черты личности</Label>
              <Textarea
                id="personalityTraits"
                value={character.personalityTraits || ''}
                onChange={handleChange('personalityTraits')}
                placeholder="Какие особенности отличают вашего персонажа?"
                className="h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="ideals">Идеалы</Label>
              <Textarea
                id="ideals"
                value={character.ideals || ''}
                onChange={handleChange('ideals')}
                placeholder="За что борется ваш персонаж? Каковы его принципы?"
                className="h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="bonds">Привязанности</Label>
              <Textarea
                id="bonds"
                value={character.bonds || ''}
                onChange={handleChange('bonds')}
                placeholder="К кому или чему привязан ваш персонаж?"
                className="h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="flaws">Слабости</Label>
              <Textarea
                id="flaws"
                value={character.flaws || ''}
                onChange={handleChange('flaws')}
                placeholder="Какие у вашего персонажа недостатки?"
                className="h-[100px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Внешность */}
      <Card>
        <CardHeader>
          <CardTitle>Внешность</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="appearance">Описание внешности</Label>
          <Textarea
            id="appearance"
            value={character.appearance || ''}
            onChange={handleChange('appearance')}
            placeholder="Опишите внешний вид вашего персонажа..."
            className="min-h-[150px]"
          />
        </CardContent>
      </Card>
    </div>
  );
};
