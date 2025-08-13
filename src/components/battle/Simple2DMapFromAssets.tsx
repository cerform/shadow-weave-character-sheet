import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Copy, RefreshCw, Download, Upload, Home } from 'lucide-react';
import { toast } from 'sonner';
import Asset2DAvatar from './Asset2DAvatar';
import { useDraggable3D } from '@/hooks/useDraggable3D';
import { getAsset3DAvatar, findAsset3DAvatarByPath } from '@/data/asset3DAvatars';

interface Asset2D {
  id: string;
  storagePath: string;
  name: string;
  x: number;
  y: number;
  scale?: number | [number, number, number];
  rotationY?: number;
  category?: string;
}

interface Simple2DMapFromAssetsProps {
  assets3D: Array<{
    id: string;
    storage_path: string;
    x: number;
    y: number;
    scale?: number | [number, number, number];
    rotationY?: number;
  }>;
  tokens?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    monsterType?: string;
  }>;
  mapImageUrl?: string;
  onBack?: () => void;
}

// Компонент перетаскиваемого 2D ассета
const Draggable2DAsset: React.FC<{
  asset: Asset2D;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  isDM?: boolean;
}> = ({ asset, isSelected, onSelect, onMove, isDM = true }) => {
  const {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(isDM, onMove, undefined, onSelect);

  return (
    <group ref={groupRef} position={[asset.x / 50 - 12, 0, asset.y / 50 - 8]}>
      {/* Интерактивная область для перетаскивания */}
      <mesh 
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[1, 1, 2, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Asset2DAvatar
        storagePath={asset.storagePath}
        position={[0, 0, 0]}
        isSelected={isSelected}
        onClick={onSelect}
        scale={asset.scale || 1}
        rotation={[0, asset.rotationY || 0, 0]}
      />

      {/* Индикатор перемещения */}
      {isDragging && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.15]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      )}
    </group>
  );
};

const Simple2DMapFromAssets: React.FC<Simple2DMapFromAssetsProps> = ({
  assets3D,
  tokens = [],
  mapImageUrl,
  onBack
}) => {
  const [assets2D, setAssets2D] = useState<Asset2D[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraPosition, setCameraPosition] = useState([0, 15, 10]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Конвертируем 3D ассеты в 2D при загрузке
  useEffect(() => {
    const converted2D: Asset2D[] = assets3D.map((asset3D) => {
      const avatar = getAsset3DAvatar(asset3D.storage_path) || findAsset3DAvatarByPath(asset3D.storage_path);
      
      return {
        id: asset3D.id,
        storagePath: asset3D.storage_path,
        name: avatar?.name || 'Unknown Asset',
        x: asset3D.x,
        y: asset3D.y,
        scale: asset3D.scale,
        rotationY: asset3D.rotationY,
        category: avatar?.category || 'unknown'
      };
    });

    setAssets2D(converted2D);
  }, [assets3D]);

  // Обработка движения ассета
  const handleAssetMove = (assetId: string, x: number, y: number) => {
    setAssets2D(prev => prev.map(asset => 
      asset.id === assetId 
        ? { ...asset, x: (x + 12) * 50, y: (y + 8) * 50 }
        : asset
    ));
  };

  // Сохранение 2D карты в изображение
  const handleExportImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = '2d_battle_map.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('2D карта экспортирована');
    }
  };

  // Копирование позиций в буфер обмена
  const handleCopyPositions = () => {
    const positions = assets2D.map(asset => ({
      name: asset.name,
      storage_path: asset.storagePath,
      x: asset.x,
      y: asset.y,
      scale: asset.scale,
      rotation: asset.rotationY
    }));
    
    navigator.clipboard.writeText(JSON.stringify(positions, null, 2));
    toast.success('Позиции скопированы в буфер обмена');
  };

  // Синхронизация с 3D картой
  const handleSyncWith3D = () => {
    const sessionId = window.location.pathname.split('/').pop();
    const sKey = (name: string) => (sessionId ? `${name}:${sessionId}` : name);
    
    // Обновляем позиции в sessionStorage для синхронизации с 3D
    const updated3DAssets = assets3D.map(asset3D => {
      const asset2D = assets2D.find(a => a.id === asset3D.id);
      if (asset2D) {
        return {
          ...asset3D,
          x: asset2D.x,
          y: asset2D.y
        };
      }
      return asset3D;
    });
    
    sessionStorage.setItem(sKey('current3DAssets'), JSON.stringify(updated3DAssets));
    toast.success('Позиции синхронизированы с 3D картой');
  };

  const selectedAsset = assets2D.find(a => a.id === selectedAssetId);

  return (
    <div className="w-full h-screen bg-slate-900 text-white flex">
      {/* Боковая панель управления */}
      {showControls && (
        <Card className="w-80 h-full bg-slate-800 border-slate-700 rounded-none flex-shrink-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              🗺️ 2D Карта из 3D Ассетов
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 h-full overflow-y-auto">
            {/* Кнопки управления */}
            <div className="space-y-2">
              {onBack && (
                <Button onClick={onBack} className="w-full" variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Назад к 3D
                </Button>
              )}
              
              <Button onClick={handleSyncWith3D} className="w-full" variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Синхронизировать с 3D
              </Button>
              
              <Button onClick={handleCopyPositions} className="w-full" variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Копировать позиции
              </Button>
              
              <Button onClick={handleExportImage} className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Экспорт в PNG
              </Button>
            </div>

            {/* Настройки отображения */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="grid-toggle">Показать сетку</Label>
                <Switch
                  id="grid-toggle"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
              </div>
            </div>

            {/* Список ассетов */}
            <div className="space-y-2">
              <h4 className="font-semibold">Ассеты ({assets2D.length})</h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {assets2D.map((asset) => {
                  const avatar = getAsset3DAvatar(asset.storagePath) || findAsset3DAvatarByPath(asset.storagePath);
                  
                  return (
                    <div
                      key={asset.id}
                      className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                        selectedAssetId === asset.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                      onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{avatar?.emoji || '📦'}</span>
                        <span className="flex-1 truncate">{asset.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {avatar?.category || 'unknown'}
                        </Badge>
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        X: {Math.round(asset.x)} Y: {Math.round(asset.y)}
                      </div>
                      <div className="text-xs opacity-60 truncate">
                        {asset.storagePath}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Информация о выбранном ассете */}
            {selectedAsset && (
              <div className="p-3 bg-slate-700 rounded">
                <h5 className="font-medium mb-2">Выбранный ассет</h5>
                <div className="text-sm space-y-1">
                  <div>Название: {selectedAsset.name}</div>
                  <div>Позиция: {Math.round(selectedAsset.x)}, {Math.round(selectedAsset.y)}</div>
                  <div>Масштаб: {Array.isArray(selectedAsset.scale) ? selectedAsset.scale.join(', ') : selectedAsset.scale || 1}</div>
                  <div>Поворот: {selectedAsset.rotationY || 0}°</div>
                </div>
              </div>
            )}

            {/* Статистика */}
            <div className="text-xs text-gray-400 space-y-1">
              <div>Всего ассетов: {assets2D.length}</div>
              <div>Монстры: {assets2D.filter(a => a.category === 'monster').length}</div>
              <div>Персонажи: {assets2D.filter(a => a.category === 'character').length}</div>
              <div>Структуры: {assets2D.filter(a => a.category === 'structure').length}</div>
              <div>Предметы: {assets2D.filter(a => a.category === 'item').length}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопка сворачивания панели */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-2 z-20 bg-slate-800/80 hover:bg-slate-700"
          onClick={() => setShowControls(!showControls)}
        >
          {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* 3D Сцена с 2D аватарами */}
      <div ref={canvasRef} className="flex-1 h-full">
        <Canvas
          camera={{ 
            position: cameraPosition as [number, number, number], 
            fov: 50 
          }}
          shadows
        >
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1} 
            castShadow 
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Фон карты */}
          {mapImageUrl && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <planeGeometry args={[24, 16]} />
              <meshLambertMaterial map={null} transparent opacity={0.8} />
            </mesh>
          )}

          {/* Сетка */}
          {showGrid && (
            <gridHelper args={[24, 24, '#666666', '#444444']} position={[0, 0, 0]} />
          )}

          {/* 2D Ассеты */}
          {assets2D.map((asset) => (
            <Draggable2DAsset
              key={asset.id}
              asset={asset}
              isSelected={selectedAssetId === asset.id}
              onSelect={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
              onMove={(x, y) => handleAssetMove(asset.id, x, y)}
            />
          ))}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />

          <Environment preset="city" />
        </Canvas>
      </div>
    </div>
  );
};

export default Simple2DMapFromAssets;