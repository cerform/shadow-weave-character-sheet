
import React, { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { feats } from '@/data/feats';

interface FeatSelectorProps {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  numberOfFeats: number;
}

const FeatSelector: React.FC<FeatSelectorProps> = ({ 
  character, 
  updateCharacter,
  numberOfFeats = 1
}) => {
  const [selectedFeats, setSelectedFeats] = useState<string[]>(
    Array.isArray(character.feats) 
      ? character.feats.map(feat => typeof feat === 'string' ? feat : feat.name)
      : []
  );

  useEffect(() => {
    // При изменении компонента обновляем персонажа
    if (selectedFeats.length > 0) {
      const featsData = selectedFeats.map(featName => {
        const featData = feats.find(f => f.name === featName);
        return featData 
          ? { name: featData.name, description: featData.description, source: 'Раса' }
          : { name: featName, description: 'Описание недоступно', source: 'Раса' };
      });
      
      updateCharacter({ feats: featsData });
    }
  }, [selectedFeats]);

  const handleFeatChange = (featName: string, index: number) => {
    const newSelectedFeats = [...selectedFeats];
    newSelectedFeats[index] = featName;
    setSelectedFeats(newSelectedFeats);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Выбор черт</CardTitle>
        <CardDescription>
          Выберите {numberOfFeats} {numberOfFeats === 1 ? 'черту' : 'черты'} для вашего персонажа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {Array.from({ length: numberOfFeats }, (_, i) => (
            <div key={i} className="mb-4">
              <Label htmlFor={`feat-${i}`}>Черта {i + 1}</Label>
              <Select
                value={selectedFeats[i] || ''}
                onValueChange={(value) => handleFeatChange(value, i)}
              >
                <SelectTrigger id={`feat-${i}`}>
                  <SelectValue placeholder="Выберите черту" />
                </SelectTrigger>
                <SelectContent>
                  {feats.map(feat => (
                    <SelectItem 
                      key={feat.name} 
                      value={feat.name}
                      disabled={selectedFeats.includes(feat.name) && selectedFeats[i] !== feat.name}
                    >
                      {feat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedFeats[i] && (
                <div className="mt-2 text-sm text-muted-foreground">
                  {feats.find(f => f.name === selectedFeats[i])?.description || 'Описание недоступно'}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FeatSelector;
