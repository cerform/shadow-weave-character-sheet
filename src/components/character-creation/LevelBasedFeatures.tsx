
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CharacterSheet, Feature } from '@/types/character';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Book, Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import classFeatures from '@/data/classFeatures';

interface LevelBasedFeaturesProps {
  character: CharacterSheet;
  onUpdate: (updates: Partial<CharacterSheet>) => void;
}

export const LevelBasedFeatures: React.FC<LevelBasedFeaturesProps> = ({
  character,
  onUpdate,
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState<(string | Feature)[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);

  // Получаем доступные особенности класса на основе выбранного класса и уровня
  useEffect(() => {
    if (!character.characterClass) return;

    const classFeaturesByLevel = classFeatures[character.characterClass.toLowerCase()];
    if (!classFeaturesByLevel) return;

    const level = character.level || 1;
    let features: Feature[] = [];

    // Собираем доступные особенности из данных по классу
    if (classFeaturesByLevel && typeof classFeaturesByLevel === 'object') {
      if (Array.isArray(classFeaturesByLevel.features)) {
        features = classFeaturesByLevel.features.filter(f => (f.level || 1) <= level);
      }
    }

    setAvailableFeatures(features);
  }, [character.characterClass, character.level]);

  // Устанавливаем выбранные особенности из персонажа при загрузке
  useEffect(() => {
    if (character.features) {
      setSelectedFeatures(character.features);
    }
  }, [character.features]);

  // Обновляем персонажа при изменении выбранных особенностей
  useEffect(() => {
    onUpdate({ features: selectedFeatures });
  }, [selectedFeatures, onUpdate]);

  // Добавляем особенность
  const addFeature = (feature: Feature | string) => {
    // Проверяем, нет ли уже такой особенности
    const exists = selectedFeatures.some(f => 
      typeof f === 'string' && typeof feature === 'string' 
        ? f === feature 
        : typeof f !== 'string' && typeof feature !== 'string'
          ? f.name === feature.name
          : false
    );

    if (!exists) {
      setSelectedFeatures(prev => [...prev, feature]);
    }
  };

  // Удаляем особенность
  const removeFeature = (index: number) => {
    setSelectedFeatures(prev => prev.filter((_, i) => i !== index));
  };

  // Форматирование названия особенности для отображения
  const formatFeatureName = (feature: Feature | string): string => {
    if (typeof feature === 'string') return feature;
    return feature.name;
  };

  // Форматирование описания особенности для отображения
  const formatFeatureDescription = (feature: Feature | string): string => {
    if (typeof feature === 'string') return '';
    return feature.description || '';
  };

  return (
    <Card className="col-span-1 h-full">
      <CardHeader>
        <CardTitle>Умения и особенности</CardTitle>
        <CardDescription>
          Выберите доступные умения и особенности для вашего персонажа
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Book className="mr-2 h-5 w-5" />
              Особенности класса
            </h3>
            
            <ScrollArea className="h-[200px] rounded-md border p-2">
              <div className="space-y-2">
                {availableFeatures.length > 0 ? (
                  availableFeatures.map((feature, index) => (
                    <div key={index} className="p-2 rounded-md hover:bg-secondary/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <Button
                          size="sm" 
                          variant="outline"
                          onClick={() => addFeature(feature)}
                          className="ml-2 mt-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground p-4">
                    Нет доступных особенностей для выбранного класса и уровня
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Выбранные особенности</h3>
            
            <div className="space-y-2">
              {selectedFeatures.length > 0 ? (
                selectedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start justify-between p-2 bg-secondary/5 rounded-md">
                    <div>
                      <p className="font-medium">{formatFeatureName(feature)}</p>
                      <p className="text-sm text-muted-foreground">{formatFeatureDescription(feature)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground">Нет выбранных особенностей</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex flex-wrap gap-1">
          {selectedFeatures.length > 0 && (
            <Badge variant="outline">{selectedFeatures.length} выбрано</Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default LevelBasedFeatures;
