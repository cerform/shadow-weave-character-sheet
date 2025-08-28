import React, { useState } from 'react';
import { Image, Upload, Search, Grid, List } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'token' | 'map' | 'prop' | 'background';
  tags: string[];
}

interface AssetLibraryProps {
  onAssetSelect: (asset: Asset) => void;
  onAssetUpload: (file: File) => void;
}

// Демо-данные для примера
const DEMO_ASSETS: Asset[] = [
  { id: '1', name: 'Гоблин', url: '/placeholder.svg', type: 'token', tags: ['монстр', 'гуманоид'] },
  { id: '2', name: 'Дракон', url: '/placeholder.svg', type: 'token', tags: ['монстр', 'дракон'] },
  { id: '3', name: 'Воин', url: '/placeholder.svg', type: 'token', tags: ['персонаж', 'воин'] },
  { id: '4', name: 'Маг', url: '/placeholder.svg', type: 'token', tags: ['персонаж', 'маг'] },
  { id: '5', name: 'Лесная поляна', url: '/placeholder.svg', type: 'map', tags: ['природа', 'лес'] },
  { id: '6', name: 'Подземелье', url: '/placeholder.svg', type: 'map', tags: ['подземелье', 'камень'] },
  { id: '7', name: 'Сундук', url: '/placeholder.svg', type: 'prop', tags: ['предмет', 'сокровища'] },
  { id: '8', name: 'Алтарь', url: '/placeholder.svg', type: 'prop', tags: ['предмет', 'магия'] },
];

export default function AssetLibrary({ onAssetSelect, onAssetUpload }: AssetLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Asset['type'] | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [assets] = useState<Asset[]>(DEMO_ASSETS);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onAssetUpload(file);
    }
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      {/* Заголовок */}
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Библиотека ассетов</h3>
        
        {/* Поиск */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск ассетов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-2 text-xs bg-secondary rounded border-0 focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Фильтры и режимы просмотра */}
        <div className="flex items-center justify-between mb-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as Asset['type'] | 'all')}
            className="text-xs bg-secondary border-0 rounded px-2 py-1 focus:ring-1 focus:ring-primary"
          >
            <option value="all">Все типы</option>
            <option value="token">Токены</option>
            <option value="map">Карты</option>
            <option value="prop">Предметы</option>
            <option value="background">Фоны</option>
          </select>
          
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded text-xs ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              <Grid className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded text-xs ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Кнопка загрузки */}
        <label className="flex items-center gap-2 w-full p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded cursor-pointer text-xs transition-colors">
          <Upload className="h-3 w-3" />
          Загрузить ассет
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Список ассетов */}
      <div className="flex-1 overflow-y-auto p-2">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
                className="group cursor-pointer bg-secondary hover:bg-secondary/80 rounded p-2 transition-colors"
              >
                <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-xs font-medium truncate">{asset.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{asset.type}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onAssetSelect(asset)}
                className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{asset.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{asset.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredAssets.length === 0 && (
          <div className="text-center text-muted-foreground text-xs py-8">
            Ассеты не найдены
          </div>
        )}
      </div>
    </div>
  );
}