import React, { useState, useEffect } from 'react';
import { Character, Feature } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Book, ListChecks } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  const [newFeature, setNewFeature] = useState({ name: '', source: '', description: '' });
  const { toast } = useToast();
  
  // Обработчик добавления новой особенности
  const addFeature = () => {
    if (!newFeature.name.trim() || !newFeature.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Название и описание особенности не могут быть пустыми",
        variant: "destructive",
      });
      return;
    }
    
    const featureToAdd: Feature = {
      name: newFeature.name,
      source: newFeature.source || 'Custom',
      description: newFeature.description,
    };
    
    const updatedFeatures = character.features ? [...character.features, featureToAdd] : [featureToAdd];
    onUpdate({ features: updatedFeatures });
    setNewFeature({ name: '', source: '', description: '' });
  };
  
  // Обработчик удаления особенности
  const removeFeature = (index: number) => {
    if (!character.features) return;
    
    const updatedFeatures = [...character.features];
    updatedFeatures.splice(index, 1);
    onUpdate({ features: updatedFeatures });
  };
  
  // Обработчик изменения значения в поле ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFeature(prev => ({ ...prev, [name]: value }));
  };
  
  // Получаем список особенностей для отображения
  const getFeaturesList = (): (string | Feature)[] => {
    if (character.features && character.features.length > 0) {
      return character.features;
    }
    
    return [];
  };
  
  const featuresList = getFeaturesList();
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Особенности</CardTitle>
          <ListChecks className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Добавление новой особенности */}
        <div>
          <h3 className="text-lg font-medium mb-2">Добавить новую особенность</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              name="name"
              placeholder="Название особенности"
              value={newFeature.name}
              onChange={handleInputChange}
            />
            <Input
              type="text"
              name="source"
              placeholder="Источник (например, класс, раса)"
              value={newFeature.source}
              onChange={handleInputChange}
            />
          </div>
          <Input
            as="textarea"
            name="description"
            placeholder="Описание особенности"
            value={newFeature.description}
            onChange={handleInputChange}
            className="mt-2"
          />
          <Button onClick={addFeature} className="mt-4 w-full">
            <Plus className="h-4 w-4 mr-2" />
            Добавить особенность
          </Button>
        </div>
        
        <Separator />
        
        {/* Список существующих особенностей */}
        <div>
          <h3 className="text-lg font-medium mb-2">Список особенностей</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {featuresList.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  У персонажа нет особенностей
                </p>
              ) : (
                Array.isArray(character.features) && character.features.map((feature, index) => {
                  const featureObj = typeof feature === 'string' ? { name: feature, source: 'Unknown', description: '' } : feature;
                  return (
                    <Accordion type="single" collapsible key={index}>
                      <AccordionItem value={`feature-${index}`}>
                        <AccordionTrigger className="flex justify-between items-center">
                          {featureObj.name}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Предотвращаем раскрытие аккордеона при удалении
                              removeFeature(index);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-sm text-muted-foreground">
                            Источник: {featureObj.source}
                          </p>
                          <p className="text-sm mt-2">
                            {featureObj.description}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
