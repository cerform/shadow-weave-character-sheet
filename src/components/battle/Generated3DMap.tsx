import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Grid3X3, Mountain, Download, Plus, Users } from 'lucide-react';
import Token3D from './Token3D';
import SimpleTokenEditor from './SimpleTokenEditor';

interface Generated3DMapProps {
  mapData: {
    originalImage: string;
    heightMap: string;
    textureMap: string;
    dimensions: { width: number; height: number };
    settings: {
      heightIntensity: number;
      smoothness: number;
      generateHeightFromColors: boolean;
      invertHeight: boolean;
      gridSize: number;
    };
  };
  tokens?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    size: number;
    hp?: number;
    maxHp?: number;
    type: 'player' | 'monster' | 'npc' | 'boss';
    avatar?: string;
  }>;
  onTokenUpdate?: (tokens: any[]) => void;
  isDM?: boolean;
}

// Компонент 3D террейна
const TerrainMesh: React.FC<{
  textureUrl: string;
  heightMapUrl: string;
  dimensions: { width: number; height: number };
  settings: any;
  heightScale: number;
}> = ({ textureUrl, heightMapUrl, dimensions, settings, heightScale }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.PlaneGeometry | null>(null);
  
  // Проверяем и создаем дефолтные значения для URL
  const safeTextureUrl = textureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  const safeHeightMapUrl = heightMapUrl || safeTextureUrl;
  
  // Загружаем текстуры только если URL определены
  const texture = useLoader(THREE.TextureLoader, safeTextureUrl);
  const heightTexture = useLoader(THREE.TextureLoader, safeHeightMapUrl);

  useEffect(() => {
    if (!safeHeightMapUrl || !dimensions.width || !dimensions.height) return;
    
    // Создаем геометрию плоскости с высоким разрешением
    const segments = Math.min(256, Math.max(64, Math.max(dimensions.width, dimensions.height) / 4));
    const planeGeometry = new THREE.PlaneGeometry(
      dimensions.width / 10, // Масштабируем размер
      dimensions.height / 10,
      segments,
      segments
    );

    // Создаем canvas для чтения данных карты высот
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = segments + 1;
      canvas.height = segments + 1;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Применяем высоты к вершинам
      const positions = planeGeometry.attributes.position as THREE.BufferAttribute;
      
      for (let i = 0; i < positions.count; i++) {
        const x = Math.floor((i % (segments + 1)) / (segments + 1) * canvas.width);
        const y = Math.floor(Math.floor(i / (segments + 1)) / (segments + 1) * canvas.height);
        const pixelIndex = (y * canvas.width + x) * 4;
        
        // Получаем высоту из красного канала (grayscale)
        const height = pixels[pixelIndex] / 255;
        const scaledHeight = height * heightScale * (settings?.heightIntensity || 50) / 100;
        
        positions.setZ(i, scaledHeight);
      }
      
      positions.needsUpdate = true;
      planeGeometry.computeVertexNormals();
      setGeometry(planeGeometry);
    };
    
    img.src = safeHeightMapUrl;
  }, [safeHeightMapUrl, dimensions, settings, heightScale]);

  // Настраиваем текстуру
  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
    }
  }, [texture]);

  if (!geometry) {
    // Возвращаем простую плоскость если геометрия не загружена
    return (
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[dimensions.width / 10 || 10, dimensions.height / 10 || 10]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Generated3DMap: React.FC<Generated3DMapProps> = ({ mapData, tokens = [], onTokenUpdate, isDM = false }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'top'>('orbit');
  const [heightScale, setHeightScale] = useState(5);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [localTokens, setLocalTokens] = useState(tokens);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [showTokenEditor, setShowTokenEditor] = useState(false);

  // Обновляем локальные токены при изменении пропса
  useEffect(() => {
    setLocalTokens(tokens);
  }, [tokens]);

  // Функции для работы с токенами
  const handleTokenClick = (token: any) => {
    if (isDM) {
      setSelectedToken(token);
      setShowTokenEditor(true);
    }
  };

  const handleAddToken = () => {
    if (isDM) {
      const newToken = {
        id: `token_${Date.now()}`,
        name: 'Новый токен',
        x: 0,
        y: 0,
        color: '#ff0000',
        size: 50,
        hp: 30,
        maxHp: 30,
        type: 'monster' as const
      };
      const updatedTokens = [...localTokens, newToken];
      setLocalTokens(updatedTokens);
      onTokenUpdate?.(updatedTokens);
    }
  };

  const handleTokenSave = (tokenData: any) => {
    const updatedTokens = localTokens.map(token => 
      token.id === tokenData.id ? { ...token, ...tokenData } : token
    );
    setLocalTokens(updatedTokens);
    onTokenUpdate?.(updatedTokens);
    setShowTokenEditor(false);
    setSelectedToken(null);
  };

  const handleTokenDelete = (tokenId: string) => {
    const updatedTokens = localTokens.filter(token => token.id !== tokenId);
    setLocalTokens(updatedTokens);
    onTokenUpdate?.(updatedTokens);
    setShowTokenEditor(false);
    setSelectedToken(null);
  };

  // 3D Сцена
  const Scene3D = () => (
    <Canvas shadows camera={{ position: [20, 20, 20], fov: 60 }}>
      {/* Освещение */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[20, 20, 10]} 
        intensity={lightIntensity} 
        castShadow 
      />
      <pointLight position={[0, 10, 0]} intensity={0.3} />

      {/* Сетка */}
      {showGrid && (
        <Grid
          position={[0, 0.01, 0]}
          args={[mapData.dimensions.width / 5, mapData.dimensions.height / 5]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4edd"
          fadeDistance={100}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Террейн */}
      <TerrainMesh
        textureUrl={mapData.textureMap || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='}
        heightMapUrl={mapData.heightMap || mapData.textureMap || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='}
        dimensions={mapData.dimensions}
        settings={mapData.settings}
        heightScale={heightScale}
      />

      {/* Токены */}
      {localTokens.map(token => {
        console.log('🔍 Rendering token:', token);
        console.log('🔍 MapData dimensions:', mapData.dimensions);
        
        // Безопасно проверяем размеры карты
        const mapWidth = mapData.dimensions?.width || 800;
        const mapHeight = mapData.dimensions?.height || 600;
        
        // Преобразуем координаты для 3D сцены
        const x = ((token.x || 0) - mapWidth / 2) / 10;
        const y = ((token.y || 0) - mapHeight / 2) / 10;
        const z = 1;

        const tokenData = {
          id: token.id || `token_${Date.now()}`,
          name: token.name || 'Unnamed Token',
          type: (token.type as 'player' | 'monster' | 'npc' | 'boss') || 'monster',
          color: token.color || '#3b82f6',
          position: { x, y, z },
          hp: token.hp || 30,
          maxHp: token.maxHp || 30,
          size: token.size || 50,
          avatar: token.avatar
        };

        console.log('🔍 Token data for 3D:', tokenData);

        return (
          <Token3D
            key={tokenData.id}
            token={tokenData}
            onClick={() => handleTokenClick(token)}
            isDM={isDM}
            isSelected={selectedToken?.id === token.id}
          />
        );
      })}

      {/* Контролы камеры */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, 0, 0]}
      />
    </Canvas>
  );

  return (
    <div className="h-full w-full relative">
      {/* Панель управления */}
      <Card className="absolute top-4 left-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Mountain className="h-4 w-4" />
            Настройки 3D карты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Настройки отображения */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Сетка</Label>
              <Switch 
                checked={showGrid} 
                onCheckedChange={setShowGrid}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Каркас</Label>
              <Switch 
                checked={showWireframe} 
                onCheckedChange={setShowWireframe}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Вид сверху</Label>
              <Switch 
                checked={cameraMode === 'top'} 
                onCheckedChange={(checked) => setCameraMode(checked ? 'top' : 'orbit')}
              />
            </div>
          </div>

          {/* Масштаб высоты */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-slate-300 text-xs">Высота рельефа</Label>
              <span className="text-slate-400 text-xs">{heightScale}</span>
            </div>
            <Slider
              value={[heightScale]}
              onValueChange={(value) => setHeightScale(value[0])}
              max={20}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Интенсивность освещения */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-slate-300 text-xs">Освещение</Label>
              <span className="text-slate-400 text-xs">{lightIntensity.toFixed(1)}</span>
            </div>
            <Slider
              value={[lightIntensity]}
              onValueChange={(value) => setLightIntensity(value[0])}
              max={3}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Информация о карте */}
      <Card className="absolute top-4 right-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="text-white text-sm space-y-1">
            <p className="font-semibold">Информация о карте</p>
            <p className="text-slate-300">Размер: {mapData.dimensions.width}×{mapData.dimensions.height}</p>
            <p className="text-slate-300">Клетка: {mapData.settings.gridSize}м</p>
            <p className="text-slate-300">Рельеф: {mapData.settings.heightIntensity}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Панель токенов */}
      {isDM && (
        <Card className="absolute bottom-4 left-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Токены ({localTokens.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleAddToken}
              className="w-full bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить токен
            </Button>
            <div className="text-slate-300 text-xs">
              Кликните по токену для редактирования
            </div>
          </CardContent>
        </Card>
      )}

      {/* Редактор токенов в модальном окне */}
      {showTokenEditor && selectedToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-white text-lg mb-4">Редактировать токен</h3>
            <SimpleTokenEditor
              token={selectedToken}
              onSave={handleTokenSave}
              onDelete={() => handleTokenDelete(selectedToken.id)}
              onCancel={() => {
                setShowTokenEditor(false);
                setSelectedToken(null);
              }}
            />
            <Button 
              onClick={() => {
                setShowTokenEditor(false);
                setSelectedToken(null);
              }}
              variant="outline"
              className="mt-4 w-full"
            >
              Закрыть
            </Button>
          </div>
        </div>
      )}

      {/* 3D Сцена */}
      <div className="w-full h-full">
        <Scene3D />
      </div>
    </div>
  );
};

export default Generated3DMap;