import React, { useState, useEffect } from 'react';
import { Character, Feature } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from 'lucide-react';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDescription, setNewFeatureDescription] = useState('');
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [featureSource, setFeatureSource] = useState('');

  useEffect(() => {
    if (selectedFeatureIndex !== null && character.features && Array.isArray(character.features)) {
      const feature = character.features[selectedFeatureIndex];
      if (typeof feature === 'object' && feature !== null) {
        setNewFeatureName(feature.name || '');
        setNewFeatureDescription(feature.description || '');
      }
    } else {
      setNewFeatureName('');
      setNewFeatureDescription('');
    }
  }, [selectedFeatureIndex, character.features]);

  const handleAddFeature = () => {
    if (newFeatureName && newFeatureDescription) {
      const newFeature: Feature = {
        name: newFeatureName,
        description: newFeatureDescription,
        source: featureSource || 'custom',
      };

      const updatedFeatures = character.features ? [...character.features, newFeature] : [newFeature];
      onUpdate({ features: updatedFeatures });
      setNewFeatureName('');
      setNewFeatureDescription('');
      setFeatureSource('');
    }
  };

  const handleEditFeature = () => {
    if (selectedFeatureIndex !== null && character.features && Array.isArray(character.features)) {
      const updatedFeatures = [...character.features];
      if (typeof updatedFeatures[selectedFeatureIndex] === 'object' && updatedFeatures[selectedFeatureIndex] !== null) {
        (updatedFeatures[selectedFeatureIndex] as Feature).name = newFeatureName;
        (updatedFeatures[selectedFeatureIndex] as Feature).description = newFeatureDescription;
      }
      onUpdate({ features: updatedFeatures });
      setEditMode(false);
      setSelectedFeatureIndex(null);
      setNewFeatureName('');
      setNewFeatureDescription('');
    }
  };

  const handleDeleteFeature = () => {
    if (selectedFeatureIndex !== null && character.features && Array.isArray(character.features)) {
      const updatedFeatures = [...character.features];
      updatedFeatures.splice(selectedFeatureIndex, 1);
      onUpdate({ features: updatedFeatures });
      setSelectedFeatureIndex(null);
      setEditMode(false);
    }
  };

  const handleFeatureSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFeatureSource(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Список особенностей */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Особенности</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] pr-4">
              <ul className="space-y-2">
                {character.features && Array.isArray(character.features) ? (
                  character.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`p-2 rounded cursor-pointer ${selectedFeatureIndex === index ? 'bg-secondary/50' : 'hover:bg-secondary/20'}`}
                      onClick={() => {
                        setSelectedFeatureIndex(index);
                        setEditMode(true);
                      }}
                    >
                      {typeof feature === 'object' && feature !== null ? feature.name : feature}
                    </li>
                  ))
                ) : (
                  <li>Нет особенностей</li>
                )}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Форма для добавления/редактирования */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>{editMode ? 'Редактировать особенность' : 'Добавить особенность'}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Источник</label>
              <select
                value={character.features ? 
                  (typeof character.features === 'string' ? character.features : 'custom') : ''
                }
                onChange={handleFeatureSourceChange}
                className="border p-2 rounded"
              >
                <option value="">Выберите источник</option>
                <option value="race">Раса</option>
                <option value="class">Класс</option>
                <option value="background">Предыстория</option>
                <option value="custom">Свои</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <Input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="Название особенности"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <Textarea
                value={newFeatureDescription}
                onChange={(e) => setNewFeatureDescription(e.target.value)}
                placeholder="Описание особенности"
                className="h-24"
              />
            </div>
            <div className="flex justify-between">
              {editMode ? (
                <>
                  <Button variant="secondary" onClick={handleEditFeature}>
                    Сохранить
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteFeature}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddFeature}>Добавить</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturesTab;
