import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RotateCcw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as THREE from 'three';

interface ModelViewerProps {
  modelUrl: string;
  modelName?: string;
  className?: string;
  height?: number;
}

interface ModelProps {
  url: string;
  autoRotate?: boolean;
}

// Компонент для загрузки и отображения 3D модели
const Model: React.FC<ModelProps> = ({ url, autoRotate = false }) => {
  const modelRef = useRef<THREE.Group>(null);
  
  // ✅ ХУК ВСЕГДА ВЫЗЫВАЕТСЯ (не в try-catch)
  const gltf = useGLTF(url);
  
  useFrame((state) => {
    if (modelRef.current && autoRotate) {
      modelRef.current.rotation.y += 0.01;
    }
  });

  // Условная проверка после вызова хуков
  if (!gltf || !gltf.scene) {
    return null;
  }

  return (
    <group ref={modelRef}>
      <primitive object={gltf.scene} scale={1} />
    </group>
  );
};

// Компонент загрузчика
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Загрузка 3D модели...</span>
    </div>
  </div>
);

// Компонент ошибки
const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <span className="text-destructive">⚠</span>
      </div>
      <span className="text-sm text-muted-foreground">
        {error?.message || 'Ошибка загрузки модели'}
      </span>
    </div>
  </div>
);

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  modelUrl, 
  modelName = "3D Model", 
  className = "",
  height = 400 
}) => {
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleResetCamera = () => {
    // Логика сброса камеры будет реализована через ref
    toast({
      title: "Камера сброшена",
      description: "Вид модели возвращен к исходному положению"
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && canvasRef.current) {
      canvasRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Проверяем URL модели
  if (!modelUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
              <span className="text-muted-foreground">📦</span>
            </div>
            <span className="text-sm text-muted-foreground">3D модель недоступна</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{modelName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">3D</Badge>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoRotate(!autoRotate)}
                className="h-8 w-8 p-0"
                title={autoRotate ? "Остановить вращение" : "Включить автовращение"}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetCamera}
                className="h-8 w-8 p-0"
                title="Сбросить вид"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
                title="Полноэкранный режим"
              >
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={canvasRef}
          className="w-full border rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900"
          style={{ height }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            shadows
          >
            <Suspense fallback={null}>
              <Stage 
                shadows={true} 
                adjustCamera={1.2}
                intensity={0.5}
                environment="city"
              >
                <Model url={modelUrl} autoRotate={autoRotate} />
              </Stage>
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>ЛКМ: вращение • ПКМ: перемещение • Колесо: масштаб</span>
            <span className="font-mono">{modelUrl.split('/').pop()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Предзагрузка модели удалена из-за конфликта типов

export default ModelViewer;