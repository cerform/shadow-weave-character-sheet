
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface BackgroundTabProps {
  character?: any;
  onUpdate?: (updates: any) => void;
}

export const BackgroundTab: React.FC<BackgroundTabProps> = ({ character, onUpdate }) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onUpdate && character) {
      onUpdate({
        ...character,
        [field]: e.target.value
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Предыстория персонажа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Предыстория</h4>
            <Textarea 
              value={character?.backstory || ''}
              onChange={handleChange('backstory')}
              placeholder="Опишите историю вашего персонажа..."
              className="min-h-[150px]"
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-1">Внешность</h4>
            <Textarea 
              value={character?.appearance || ''}
              onChange={handleChange('appearance')}
              placeholder="Опишите внешность вашего персонажа..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Личностные черты</h4>
              <Textarea 
                value={character?.personalityTraits || ''}
                onChange={handleChange('personalityTraits')}
                placeholder="Какие качества отличают вашего персонажа?"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Идеалы</h4>
              <Textarea 
                value={character?.ideals || ''}
                onChange={handleChange('ideals')}
                placeholder="Во что верит ваш персонаж?"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Узы</h4>
              <Textarea 
                value={character?.bonds || ''}
                onChange={handleChange('bonds')}
                placeholder="С чем или кем связан ваш персонаж?"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Слабости</h4>
              <Textarea 
                value={character?.flaws || ''}
                onChange={handleChange('flaws')}
                placeholder="Какие недостатки есть у вашего персонажа?"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
