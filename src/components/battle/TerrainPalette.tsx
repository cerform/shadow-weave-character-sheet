import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mountain, 
  TreePine, 
  Waves, 
  Home, 
  Castle,
  Skull,
  Gem,
  Footprints,
  Flame,
  Snowflake
} from 'lucide-react';

interface TerrainElement {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: 'geography' | 'structures' | 'special';
  description?: string;
}

interface TerrainPaletteProps {
  onElementSelect: (element: TerrainElement) => void;
  selectedElement?: TerrainElement;
}

const TERRAIN_ELEMENTS: TerrainElement[] = [
  // Geography
  {
    id: 'mountains',
    name: 'Горы',
    icon: <Mountain className="h-4 w-4" />,
    color: '#8b5a2b',
    category: 'geography',
    description: 'Горные массивы и хребты'
  },
  {
    id: 'forests',
    name: 'Леса',
    icon: <TreePine className="h-4 w-4" />,
    color: '#16a34a',
    category: 'geography',
    description: 'Лесные массивы'
  },
  {
    id: 'water',
    name: 'Водоемы',
    icon: <Waves className="h-4 w-4" />,
    color: '#3b82f6',
    category: 'geography',
    description: 'Реки, озера, моря'
  },
  {
    id: 'plains',
    name: 'Равнины',
    icon: <div className="w-4 h-4 bg-green-500 rounded-sm" />,
    color: '#65a30d',
    category: 'geography',
    description: 'Открытые равнины и поля'
  },
  {
    id: 'desert',
    name: 'Пустыня',
    icon: <div className="w-4 h-4 bg-yellow-600 rounded-sm" />,
    color: '#ca8a04',
    category: 'geography',
    description: 'Пустынные земли'
  },
  {
    id: 'swamp',
    name: 'Болота',
    icon: <div className="w-4 h-4 bg-green-800 rounded-sm" />,
    color: '#166534',
    category: 'geography',
    description: 'Болотистая местность'
  },
  
  // Structures
  {
    id: 'village',
    name: 'Деревня',
    icon: <Home className="h-4 w-4" />,
    color: '#92400e',
    category: 'structures',
    description: 'Небольшие поселения'
  },
  {
    id: 'city',
    name: 'Город',
    icon: <Castle className="h-4 w-4" />,
    color: '#6b7280',
    category: 'structures',
    description: 'Крупные города'
  },
  {
    id: 'castle',
    name: 'Замок',
    icon: <Castle className="h-4 w-4" />,
    color: '#374151',
    category: 'structures',
    description: 'Крепости и замки'
  },
  {
    id: 'ruins',
    name: 'Руины',
    icon: <Skull className="h-4 w-4" />,
    color: '#6b7280',
    category: 'structures',
    description: 'Древние руины'
  },
  {
    id: 'tower',
    name: 'Башня',
    icon: <div className="w-4 h-4 bg-gray-600 rounded-sm" />,
    color: '#4b5563',
    category: 'structures',
    description: 'Магические башни'
  },
  
  // Special
  {
    id: 'dungeon',
    name: 'Подземелье',
    icon: <Skull className="h-4 w-4" />,
    color: '#1f2937',
    category: 'special',
    description: 'Входы в подземелья'
  },
  {
    id: 'treasure',
    name: 'Сокровища',
    icon: <Gem className="h-4 w-4" />,
    color: '#fbbf24',
    category: 'special',
    description: 'Места с сокровищами'
  },
  {
    id: 'travel',
    name: 'Дороги',
    icon: <Footprints className="h-4 w-4" />,
    color: '#78716c',
    category: 'special',
    description: 'Торговые пути'
  },
  {
    id: 'danger',
    name: 'Опасность',
    icon: <Flame className="h-4 w-4" />,
    color: '#dc2626',
    category: 'special',
    description: 'Опасные зоны'
  },
  {
    id: 'cold',
    name: 'Холод',
    icon: <Snowflake className="h-4 w-4" />,
    color: '#0ea5e9',
    category: 'special',
    description: 'Холодные регионы'
  }
];

const TerrainPalette: React.FC<TerrainPaletteProps> = ({
  onElementSelect,
  selectedElement
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('geography');

  const getElementsByCategory = (category: string) => {
    return TERRAIN_ELEMENTS.filter(element => element.category === category);
  };

  const handleElementClick = (element: TerrainElement) => {
    onElementSelect(element);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="h-5 w-5" />
          Палитра ландшафта
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geography">География</TabsTrigger>
            <TabsTrigger value="structures">Строения</TabsTrigger>
            <TabsTrigger value="special">Особые</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geography" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {getElementsByCategory('geography').map((element) => (
                <Button
                  key={element.id}
                  variant={selectedElement?.id === element.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleElementClick(element)}
                  className="flex items-center gap-2 h-auto p-3 justify-start"
                >
                  <div style={{ color: element.color }}>
                    {element.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-xs">{element.name}</div>
                    {element.description && (
                      <div className="text-xs text-muted-foreground">
                        {element.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="structures" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {getElementsByCategory('structures').map((element) => (
                <Button
                  key={element.id}
                  variant={selectedElement?.id === element.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleElementClick(element)}
                  className="flex items-center gap-2 h-auto p-3 justify-start"
                >
                  <div style={{ color: element.color }}>
                    {element.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-xs">{element.name}</div>
                    {element.description && (
                      <div className="text-xs text-muted-foreground">
                        {element.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="special" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-2">
              {getElementsByCategory('special').map((element) => (
                <Button
                  key={element.id}
                  variant={selectedElement?.id === element.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleElementClick(element)}
                  className="flex items-center gap-2 h-auto p-3 justify-start"
                >
                  <div style={{ color: element.color }}>
                    {element.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-xs">{element.name}</div>
                    {element.description && (
                      <div className="text-xs text-muted-foreground">
                        {element.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {selectedElement && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div style={{ color: selectedElement.color }}>
                {selectedElement.icon}
              </div>
              <Badge variant="secondary">{selectedElement.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedElement.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TerrainPalette;