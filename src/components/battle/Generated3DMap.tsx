import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Grid3X3, Mountain, Download } from 'lucide-react';

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
  
  // Загружаем текстуры
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const heightTexture = useLoader(THREE.TextureLoader, heightMapUrl);

  useEffect(() => {
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
        const scaledHeight = height * heightScale * (settings.heightIntensity / 100);
        
        positions.setZ(i, scaledHeight);
      }
      
      positions.needsUpdate = true;
      planeGeometry.computeVertexNormals();
      setGeometry(planeGeometry);
    };
    
    img.src = heightMapUrl;
  }, [heightMapUrl, dimensions, settings, heightScale]);

  // Настраиваем текстуру
  useEffect(() => {
    if (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
    }
  }, [texture]);

  if (!geometry) return null;

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

const Generated3DMap: React.FC<Generated3DMapProps> = ({ mapData, isDM = false }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'top'>('orbit');
  const [heightScale, setHeightScale] = useState(5);
  const [lightIntensity, setLightIntensity] = useState(1);

  // 3D Сцена
  const Scene3D = () => (
    <Canvas shadows>
      {/* Камера */}
      <PerspectiveCamera 
        makeDefault 
        position={cameraMode === 'top' ? [0, 50, 0] : [20, 20, 20]} 
        fov={60}
      />
      
      {/* Освещение */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[20, 20, 10]} 
        intensity={lightIntensity} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[0, 10, 0]} intensity={0.3} />

      {/* Сетка */}
      {showGrid && (
        <Grid
          position={[0, 0.01, 0]}
          args={[mapData.dimensions.width / 5, mapData.dimensions.height / 5]}
          cellSize={mapData.settings.gridSize}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={mapData.settings.gridSize * 5}
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
        textureUrl={mapData.textureMap}
        heightMapUrl={mapData.heightMap}
        dimensions={mapData.dimensions}
        settings={mapData.settings}
        heightScale={heightScale}
      />

      {/* Контролы камеры */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={cameraMode === 'orbit'}
        maxPolarAngle={cameraMode === 'top' ? 0 : Math.PI / 2}
        minDistance={5}
        maxDistance={100}
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

      {/* 3D Сцена */}
      <div className="w-full h-full">
        <Scene3D />
      </div>
    </div>
  );
};

export default Generated3DMap;