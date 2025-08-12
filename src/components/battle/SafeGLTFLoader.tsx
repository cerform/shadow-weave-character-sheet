import React, { Suspense, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

interface SafeGLTFLoaderProps {
  url: string;
  position: [number, number, number];
  scale?: number | [number, number, number];
  fallback?: React.ReactNode;
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

// Internal component that uses useGLTF
const GLTFModel: React.FC<{ url: string; position: [number, number, number]; scale: [number, number, number] }> = ({ 
  url, 
  position, 
  scale 
}) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} position={position} scale={scale} castShadow receiveShadow />;
};

// Main safe GLTF loader component
export const SafeGLTFLoader: React.FC<SafeGLTFLoaderProps> = ({ 
  url, 
  position, 
  scale, 
  fallback 
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
        <GLTFModel url={url} position={position} scale={s} />
      </Suspense>
    </GLTFErrorBoundary>
  );
};