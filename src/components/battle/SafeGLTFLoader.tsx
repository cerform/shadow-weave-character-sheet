import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface SafeGLTFLoaderProps {
  url: string;
  position: [number, number, number];
  scale?: number | [number, number, number];
  fallback?: React.ReactNode;
  onPointerDown?: (event: any) => void;
  onPointerEnter?: (event: any) => void;
  onPointerLeave?: (event: any) => void;
  makeInteractive?: boolean;
}

// Error boundary component for GLTF loading
class GLTFErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.warn('GLTF loading error caught by boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('GLTF Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// ✅ ИСПРАВЛЕНО: используем useLoader вместо useGLTF для динамических путей
const GLTFModel: React.FC<{ 
  url: string; 
  position: [number, number, number]; 
  scale: [number, number, number];
  onPointerDown?: (event: any) => void;
  onPointerEnter?: (event: any) => void;
  onPointerLeave?: (event: any) => void;
  makeInteractive?: boolean;
}> = ({ 
  url, 
  position, 
  scale,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  makeInteractive = false
}) => {
  // ✅ ИСПРАВЛЕНО: useLoader безопасен для динамических путей
  const gltf = useLoader(GLTFLoader, url) as THREE.Group & { scene: THREE.Group };
  
  const clonedScene = useMemo(() => {
    const cloned = gltf.scene.clone();
    
    if (makeInteractive) {
      // Рекурсивно добавляем обработчики событий ко всем мешам в модели
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Делаем все части модели интерактивными
          child.userData.isInteractive = true;
          
          // Добавляем обработчики событий если они заданы
          if (onPointerDown) {
            child.userData.onPointerDown = onPointerDown;
          }
          if (onPointerEnter) {
            child.userData.onPointerEnter = onPointerEnter;
          }
          if (onPointerLeave) {
            child.userData.onPointerLeave = onPointerLeave;
          }
        }
      });
    }
    
    return cloned;
  }, [gltf.scene, makeInteractive, onPointerDown, onPointerEnter, onPointerLeave]);
  
  const handlePointerEvent = (eventType: string) => (event: any) => {
    if (eventType === 'pointerdown' && onPointerDown) {
      onPointerDown(event);
    } else if (eventType === 'pointerenter' && onPointerEnter) {
      onPointerEnter(event);
    } else if (eventType === 'pointerleave' && onPointerLeave) {
      onPointerLeave(event);
    }
  };
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      scale={scale} 
      castShadow 
      receiveShadow
      onPointerDown={makeInteractive ? handlePointerEvent('pointerdown') : undefined}
      onPointerEnter={makeInteractive ? handlePointerEvent('pointerenter') : undefined}
      onPointerLeave={makeInteractive ? handlePointerEvent('pointerleave') : undefined}
    />
  );
};

export const SafeGLTFLoader: React.FC<SafeGLTFLoaderProps> = ({ 
  url, 
  position, 
  scale,
  fallback,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  makeInteractive = false
}) => {
  const [loadError, setLoadError] = useState(false);
  const s: [number, number, number] = Array.isArray(scale)
    ? scale
    : [Number(scale ?? 1), Number(scale ?? 1), Number(scale ?? 1)];

  // Check if URL is accessible before attempting to load
  useEffect(() => {
    const checkUrl = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          setLoadError(true);
        }
      } catch {
        setLoadError(true);
      }
    };

    checkUrl();
  }, [url]);

  const defaultFallback = (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7280" />
    </mesh>
  );

  if (loadError) {
    return <>{fallback || defaultFallback}</>;
  }

  return (
    <GLTFErrorBoundary fallback={fallback || defaultFallback}>
      <Suspense fallback={
        <mesh position={position} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      }>
        <GLTFModel 
          url={url} 
          position={position} 
          scale={s}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          makeInteractive={makeInteractive}
        />
      </Suspense>
    </GLTFErrorBoundary>
  );
};