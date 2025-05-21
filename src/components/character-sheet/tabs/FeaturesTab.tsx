import React, { useState, useMemo } from 'react';
import { Character, Feature } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  const [filter, setFilter] = useState<string>('all');
  const [newFeature, setNewFeature] = useState<Feature>({
    name: '',
    source: 'class',
    description: '',
    level: character.level || 1
  });
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('features');
  
  // Safe conversion of features to ensure it's an array and with the right format
  const normalizeFeatures = (features: any[] | string[] | undefined): Feature[] => {
    if (!features || features.length === 0) return [];
    
    return features.map(feat => {
      if (typeof feat === 'string') {
        return {
          name: feat,
          source: 'Unknown',
          description: ''
        };
      }
      return feat as Feature;
    });
  };

  const features = useMemo(() => {
    return normalizeFeatures(character.features as any[]);
  }, [character.features]);

  const filteredFeatures = useMemo(() => {
    if (filter === 'all') return features;
    return features.filter(feature => feature.source === filter);
  }, [features, filter]);

  const handleAddFeature = () => {
    if (!newFeature.name.trim()) return;

    const updatedFeatures = [...features, { ...newFeature }];
    onUpdate({ features: updatedFeatures });
    
    // Reset form
    setNewFeature({
      name: '',
      source: 'class',
      description: '',
      level: character.level || 1
    });
  };

  const handleDeleteFeature = (index: number) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    onUpdate({ features: updatedFeatures });
  };

  const handleEditFeature = (feature: Feature, index: number) => {
    setEditingFeature({ ...feature });
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    if (!editingFeature || editingIndex === null) return;

    const updatedFeatures = [...features];
    updatedFeatures[editingIndex] = editingFeature;
    onUpdate({ features: updatedFeatures });
    
    // Reset editing state
    setEditingFeature(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingFeature(null);
    setEditingIndex(null);
  };

  // Handle racial traits
  const raceFeatures = useMemo(() => {
    return character.raceFeatures || [];
  }, [character.raceFeatures]);

  // Handle class features
  const classFeatures = useMemo(() => {
    return character.classFeatures || [];
  }, [character.classFeatures]);

  // Handle feats
  const feats = useMemo(() => {
    return character.feats || [];
  }, [character.feats]);

  // Handle background features
  const backgroundFeatures = useMemo(() => {
    return character.backgroundFeatures || [];
  }, [character.backgroundFeatures]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="features">Особенности</TabsTrigger>
          <TabsTrigger value="racial">Расовые черты</TabsTrigger>
          <TabsTrigger value="class">Классовые умения</TabsTrigger>
          <TabsTrigger value="feats">Черты</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Особенности персонажа</h3>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Фильтр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все особенности</SelectItem>
                <SelectItem value="race">Расовые</SelectItem>
                <SelectItem value="class">Классовые</SelectItem>
                <SelectItem value="background">Предыстория</SelectItem>
                <SelectItem value="feat">Черты</SelectItem>
                <SelectItem value="item">Предметы</SelectItem>
                <SelectItem value="other">Прочее</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {filteredFeatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет особенностей для отображения
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeatures.map((feature, index) => (
                  <Collapsible key={index} className="border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <CollapsibleTrigger className="flex-1 text-left font-medium">
                          {feature.name}
                        </CollapsibleTrigger>
                        <Badge variant="outline" className="ml-2">
                          {feature.source}
                        </Badge>
                        {feature.level && (
                          <Badge variant="secondary" className="ml-1">
                            Ур. {feature.level}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditFeature(feature, index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteFeature(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <CollapsibleContent className="p-3 text-sm">
                      {feature.description || "Нет описания"}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {editingFeature ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-medium">Редактирование особенности</h4>
                <div className="space-y-3">
                  <Input 
                    placeholder="Название особенности" 
                    value={editingFeature.name}
                    onChange={(e) => setEditingFeature({...editingFeature, name: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select 
                      value={editingFeature.source} 
                      onValueChange={(value) => setEditingFeature({...editingFeature, source: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="race">Раса</SelectItem>
                        <SelectItem value="class">Класс</SelectItem>
                        <SelectItem value="background">Предыстория</SelectItem>
                        <SelectItem value="feat">Черта</SelectItem>
                        <SelectItem value="item">Предмет</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      type="number" 
                      placeholder="Уровень" 
                      value={editingFeature.level || ''}
                      onChange={(e) => setEditingFeature({
                        ...editingFeature, 
                        level: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                  
                  <Textarea 
                    placeholder="Описание особенности" 
                    value={editingFeature.description}
                    onChange={(e) => setEditingFeature({...editingFeature, description: e.target.value})}
                    rows={4}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-medium">Добавить новую особенность</h4>
                <div className="space-y-3">
                  <Input 
                    placeholder="Название особенности" 
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Select 
                      value={newFeature.source} 
                      onValueChange={(value) => setNewFeature({...newFeature, source: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Источник" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="race">Раса</SelectItem>
                        <SelectItem value="class">Класс</SelectItem>
                        <SelectItem value="background">Предыстория</SelectItem>
                        <SelectItem value="feat">Черта</SelectItem>
                        <SelectItem value="item">Предмет</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      type="number" 
                      placeholder="Уровень" 
                      value={newFeature.level || ''}
                      onChange={(e) => setNewFeature({
                        ...newFeature, 
                        level: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                    />
                  </div>
                  
                  <Textarea 
                    placeholder="Описание особенности" 
                    value={newFeature.description}
                    onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                    rows={4}
                  />
                  
                  <Button onClick={handleAddFeature} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить особенность
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="racial" className="space-y-4">
          <h3 className="text-lg font-semibold">Расовые черты</h3>
          
          <div className="space-y-3">
            {raceFeatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                Нет расовых черт для отображения
              </div>
            ) : (
              raceFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{feature.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description || "Нет описания"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="class" className="space-y-4">
          <h3 className="text-lg font-semibold">Классовые умения</h3>
          
          <div className="space-y-3">
            {classFeatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                Нет классовых умений для отображения
              </div>
            ) : (
              classFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{feature.name}</h4>
                          {feature.level && (
                            <Badge variant="outline">Уровень {feature.level}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.description || "Нет описания"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="feats" className="space-y-4">
          <h3 className="text-lg font-semibold">Черты</h3>
          
          <div className="space-y-3">
            {feats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                Нет черт для отображения
              </div>
            ) : (
              feats.map((feat, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{feat.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feat.description || "Нет описания"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturesTab;
