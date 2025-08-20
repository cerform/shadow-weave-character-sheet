// src/components/battle/hooks/useFogPlane.ts
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { FogPlane } from '@/systems/fog/FogPlane';

export function useFogPlane(mapId = 'main-map', tileSize = 1) {
  const { scene } = useThree();
  const inst = useRef<FogPlane | null>(null);
  const unsub = useRef<(() => void) | undefined>();

  useEffect(() => {
    const fp = new FogPlane(mapId, tileSize);
    inst.current = fp;
    
    (async () => { 
      try {
        await fp.init(scene); 
        unsub.current = fp.subscribe();
        console.log('Fog plane initialized successfully');
      } catch (error) {
        console.error('Failed to initialize fog plane:', error);
      }
    })();

    return () => {
      unsub.current?.();
      fp.dispose(scene);
      inst.current = null;
    };
  }, [scene, mapId, tileSize]);

  useFrame((state, delta) => {
    inst.current?.tick(delta, state.clock.elapsedTime);
  });
}