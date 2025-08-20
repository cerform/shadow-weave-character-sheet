// src/components/battle/Token3DGallery.tsx
import React, { useState, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Box, Search, Download } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Model3DPreview } from './Model3DPreview';

interface Token3DModel {
  id: string;
  name: string;
  url: string;
  type: 'character' | 'monster' | 'object';
  thumbnail?: string;
}

interface Token3DGalleryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (model: Token3DModel) => void;
}

const defaultModels: Token3DModel[] = [
  {
    id: 'humanoid-warrior',
    name: 'Человек-воин',
    url: 'https://threejs.org/examples/models/gltf/Soldier/Soldier.glb',
    type: 'character'
  },
  {
    id: 'dragon',
    name: 'Дракон',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Dragon/glTF/Dragon.gltf',
    type: 'monster'
  },
  {
    id: 'horse',
    name: 'Конь',
    url: 'https://threejs.org/examples/models/gltf/Horse.glb',
    type: 'character'
  },
  {
    id: 'robot',
    name: 'Робот',
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    type: 'character'
  }
];

export const Token3DGallery: React.FC<Token3DGalleryProps> = ({ 
  open, 
  onClose, 
  onSelect 
}) => {
  const [models, setModels] = useState<Token3DModel[]>(defaultModels);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'character' | 'monster' | 'object'>('all');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || model.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddCustomModel = () => {
    if (customUrl && customName) {
      const newModel: Token3DModel = {
        id: `custom-${Date.now()}`,
        name: customName,
        url: customUrl,
        type: 'character'
      };
      setModels([...models, newModel]);
      setCustomUrl('');
      setCustomName('');
    }
  };

  const handleDownloadFromURL = (url: string, name: string) => {
    // Функция для скачивания модели по URL
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Галерея 3D моделей
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Поиск и фильтры */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск моделей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">Все типы</option>
              <option value="character">Персонажи</option>
              <option value="monster">Монстры</option>
              <option value="object">Объекты</option>
            </select>
          </div>

          {/* Добавление кастомной модели */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <h3 className="font-medium">Добавить свою модель</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="model-name">Название</Label>
                    <Input
                      id="model-name"
                      placeholder="Название модели"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model-url">URL модели</Label>
                    <Input
                      id="model-url"
                      placeholder="https://example.com/model.glb"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCustomModel} className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Сетка моделей */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <Card key={model.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Превью модели */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <Suspense fallback={null}>
                          <ambientLight intensity={0.6} />
                          <directionalLight position={[10, 10, 5]} intensity={1} />
                          <Model3DPreview url={model.url} />
                          <OrbitControls 
                            enablePan={false} 
                            enableZoom={false}
                            autoRotate
                            autoRotateSpeed={2}
                          />
                        </Suspense>
                      </Canvas>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">{model.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{model.type}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => onSelect(model)}
                        className="flex-1 text-sm"
                      >
                        Выбрать
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDownloadFromURL(model.url, model.name)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Box className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Модели не найдены</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};