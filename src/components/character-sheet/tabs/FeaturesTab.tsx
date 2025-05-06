
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Character } from '@/types/character';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

interface FeaturesTabProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

// Интерфейс для функционала добавления новых особенностей
interface NewFeature {
  name: string;
  description: string;
  level?: number;
  type: 'racial' | 'class' | 'background' | 'feat';
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ character, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<NewFeature>({
    name: '',
    description: '',
    level: character.level || 1,
    type: 'class'
  });
  
  // Получение текущих особенностей из персонажа
  const racialFeatures = character.racialFeatures || [];
  const classFeatures = character.classFeatures || [];
  const backgroundFeatures = character.backgroundFeatures || [];
  const feats = character.feats || [];

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewFeature(prev => ({
      ...prev,
      [name]: name === 'level' ? parseInt(value, 10) : value
    }));
  };

  // Обработчик добавления новой особенности
  const handleAddFeature = () => {
    if (!newFeature.name || !newFeature.description) return;
    
    const featureToAdd = {
      name: newFeature.name,
      description: newFeature.description,
      level: newFeature.level
    };
    
    let updatedCharacter: Partial<Character> = {};
    
    // Добавляем особенность в соответствующий массив
    if (newFeature.type === 'racial') {
      updatedCharacter.racialFeatures = [...racialFeatures, featureToAdd];
    } else if (newFeature.type === 'class') {
      updatedCharacter.classFeatures = [...classFeatures, featureToAdd];
    } else if (newFeature.type === 'background') {
      updatedCharacter.backgroundFeatures = [...backgroundFeatures, featureToAdd];
    } else if (newFeature.type === 'feat') {
      updatedCharacter.feats = [...feats, featureToAdd];
    }
    
    // Обновляем персонажа
    onUpdate(updatedCharacter);
    
    // Сбрасываем форму
    setNewFeature({
      name: '',
      description: '',
      level: character.level || 1,
      type: 'class'
    });
    
    setIsAddingFeature(false);
  };

  // Главное поле для заметок о способностях (сохраняем оригинальный функционал)
  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    onUpdate({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="racial">Расовые</TabsTrigger>
          <TabsTrigger value="class">Классовые</TabsTrigger>
          <TabsTrigger value="background">Предыстория</TabsTrigger>
          <TabsTrigger value="notes">Заметки</TabsTrigger>
        </TabsList>
        
        {/* Все особенности */}
        <TabsContent value="all" className="space-y-4">
          {!isAddingFeature && (
            <Button 
              onClick={() => setIsAddingFeature(true)}
              className="mb-4 bg-amber-600 hover:bg-amber-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить особенность
            </Button>
          )}
          
          {isAddingFeature && (
            <Card className="mb-6 border-amber-600/50">
              <CardHeader>
                <CardTitle>Добавление новой особенности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-1">Тип особенности</label>
                  <select 
                    name="type"
                    value={newFeature.type}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                  >
                    <option value="racial">Расовая особенность</option>
                    <option value="class">Классовая особенность</option>
                    <option value="background">Особенность предыстории</option>
                    <option value="feat">Черта</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Название</label>
                  <input 
                    type="text"
                    name="name"
                    value={newFeature.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Введите название особенности"
                  />
                </div>
                {newFeature.type === 'class' && (
                  <div>
                    <label className="block mb-1">Уровень</label>
                    <input 
                      type="number"
                      name="level"
                      value={newFeature.level}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                      min="1"
                      max="20"
                    />
                  </div>
                )}
                <div>
                  <label className="block mb-1">Описание</label>
                  <Textarea 
                    name="description"
                    value={newFeature.description}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Опишите способность..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddingFeature(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleAddFeature}
                    disabled={!newFeature.name || !newFeature.description}
                  >
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Расовые особенности */}
          {racialFeatures.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">
                Особенности расы {character.race}
              </h3>
              <div className="space-y-2">
                {racialFeatures.map((feature, index) => (
                  <Card key={index} className="bg-gray-800/70 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 text-lg">{feature.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-200">
                      <p className="whitespace-pre-line">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Классовые особенности */}
          {classFeatures.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">
                Особенности класса {character.class}
              </h3>
              <div className="space-y-2">
                {classFeatures.map((feature, index) => (
                  <Card key={index} className="bg-gray-800/70 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 text-lg">
                        {feature.name} {feature.level ? `(Ур. ${feature.level})` : ''}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-200">
                      <p className="whitespace-pre-line">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Особенности предыстории */}
          {backgroundFeatures.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">
                Особенности предыстории {character.background}
              </h3>
              <div className="space-y-2">
                {backgroundFeatures.map((feature, index) => (
                  <Card key={index} className="bg-gray-800/70 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 text-lg">{feature.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-200">
                      <p className="whitespace-pre-line">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Черты персонажа */}
          {feats.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-amber-400 mb-3">
                Черты персонажа
              </h3>
              <div className="space-y-2">
                {feats.map((feat, index) => (
                  <Card key={index} className="bg-gray-800/70 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-300 text-lg">{feat.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-200">
                      <p className="whitespace-pre-line">{feat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Если нет особенностей */}
          {racialFeatures.length === 0 && 
           classFeatures.length === 0 && 
           backgroundFeatures.length === 0 && 
           feats.length === 0 && !isAddingFeature && (
            <div className="p-8 text-center border border-gray-700 rounded-lg">
              <p className="text-gray-400 mb-4">
                У вашего персонажа пока нет добавленных особенностей или умений
              </p>
              <p className="text-gray-500">
                Нажмите кнопку "Добавить особенность" чтобы добавить новые
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Расовые особенности */}
        <TabsContent value="racial" className="space-y-4">
          {/* Кнопка добавления для расовых особенностей */}
          {!isAddingFeature && (
            <Button 
              onClick={() => {
                setNewFeature(prev => ({ ...prev, type: 'racial' }));
                setIsAddingFeature(true);
              }}
              className="mb-4 bg-amber-600 hover:bg-amber-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить расовую особенность
            </Button>
          )}
          
          {/* Форма добавления особенности */}
          {isAddingFeature && newFeature.type === 'racial' && (
            <Card className="mb-6 border-amber-600/50">
              {/* ... контент формы для расовых особенностей (аналогично предыдущей) */}
              <CardHeader>
                <CardTitle>Добавление расовой особенности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-1">Название</label>
                  <input 
                    type="text"
                    name="name"
                    value={newFeature.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Введите название особенности"
                  />
                </div>
                <div>
                  <label className="block mb-1">Описание</label>
                  <Textarea 
                    name="description"
                    value={newFeature.description}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Опишите способность..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddingFeature(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleAddFeature}
                    disabled={!newFeature.name || !newFeature.description}
                  >
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Список расовых особенностей */}
          {racialFeatures.length > 0 ? (
            <div className="space-y-2">
              {racialFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-800/70 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-300 text-lg">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-200">
                    <p className="whitespace-pre-line">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-gray-700 rounded-lg">
              <p className="text-gray-400">Нет расовых особенностей</p>
            </div>
          )}
        </TabsContent>
        
        {/* Классовые особенности */}
        <TabsContent value="class" className="space-y-4">
          {/* Кнопка и форма для классовых особенностей (аналогично расовым) */}
          {!isAddingFeature && (
            <Button 
              onClick={() => {
                setNewFeature(prev => ({ ...prev, type: 'class' }));
                setIsAddingFeature(true);
              }}
              className="mb-4 bg-amber-600 hover:bg-amber-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить классовую особенность
            </Button>
          )}
          
          {isAddingFeature && newFeature.type === 'class' && (
            <Card className="mb-6 border-amber-600/50">
              <CardHeader>
                <CardTitle>Добавление классовой особенности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-1">Название</label>
                  <input 
                    type="text"
                    name="name"
                    value={newFeature.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Введите название особенности"
                  />
                </div>
                <div>
                  <label className="block mb-1">Уровень</label>
                  <input 
                    type="number"
                    name="level"
                    value={newFeature.level}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block mb-1">Описание</label>
                  <Textarea 
                    name="description"
                    value={newFeature.description}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Опишите способность..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddingFeature(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleAddFeature}
                    disabled={!newFeature.name || !newFeature.description}
                  >
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Список классовых особенностей */}
          {classFeatures.length > 0 ? (
            <div className="space-y-2">
              {classFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-800/70 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-300 text-lg">
                      {feature.name} {feature.level ? `(Ур. ${feature.level})` : ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-200">
                    <p className="whitespace-pre-line">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-gray-700 rounded-lg">
              <p className="text-gray-400">Нет классовых особенностей</p>
            </div>
          )}
        </TabsContent>
        
        {/* Особенности предыстории */}
        <TabsContent value="background" className="space-y-4">
          {/* Кнопка и форма для особенностей предыстории (аналогично предыдущим) */}
          {!isAddingFeature && (
            <Button 
              onClick={() => {
                setNewFeature(prev => ({ ...prev, type: 'background' }));
                setIsAddingFeature(true);
              }}
              className="mb-4 bg-amber-600 hover:bg-amber-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить особенность предыстории
            </Button>
          )}
          
          {isAddingFeature && newFeature.type === 'background' && (
            <Card className="mb-6 border-amber-600/50">
              <CardHeader>
                <CardTitle>Добавление особенности предыстории</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-1">Название</label>
                  <input 
                    type="text"
                    name="name"
                    value={newFeature.name}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Введите название особенности"
                  />
                </div>
                <div>
                  <label className="block mb-1">Описание</label>
                  <Textarea 
                    name="description"
                    value={newFeature.description}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    placeholder="Опишите особенность..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setIsAddingFeature(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleAddFeature}
                    disabled={!newFeature.name || !newFeature.description}
                  >
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Список особенностей предыстории */}
          {backgroundFeatures.length > 0 ? (
            <div className="space-y-2">
              {backgroundFeatures.map((feature, index) => (
                <Card key={index} className="bg-gray-800/70 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-amber-300 text-lg">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-200">
                    <p className="whitespace-pre-line">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-gray-700 rounded-lg">
              <p className="text-gray-400">Нет особенностей предыстории</p>
            </div>
          )}
        </TabsContent>
        
        {/* Заметки (оригинальный функционал) */}
        <TabsContent value="notes">
          <div className="grid gap-4">
            <div>
              <Textarea
                name="features"
                placeholder="Классовые особенности, умения и другие особенности персонажа..."
                value={character.features || ""}
                onChange={handleNotesChange}
                className="min-h-[400px] bg-gray-800/50 border-gray-700 text-white"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeaturesTab;
