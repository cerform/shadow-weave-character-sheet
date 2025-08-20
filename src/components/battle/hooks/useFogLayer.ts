// src/components/battle/hooks/useFogLayer.ts
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { FogRenderer } from '@/systems/fog/FogRenderer';
import { useFogStore } from '@/stores/fogStore';

export function useFogLayer(scene: THREE.Scene, mapId = 'main-map', tileSize = 5) {
  const fogRef = useRef<FogRenderer | null>(null);

  useEffect(() => {
    const fr = new FogRenderer(scene, mapId, tileSize);
    fogRef.current = fr;

    (async () => {
      try {
        await fr.init('/assets/fog/cloud.png');
        console.log('Fog renderer initialized successfully');
        fr.syncTargetsFromStore();
      } catch (error) {
        console.error('Failed to initialize fog renderer:', error);
      }
    })();

    // подписка на обновление битмапы
    const unsub = useFogStore.subscribe(
      (state) => {
        console.log('Fog store updated, syncing targets');
        // целевые значения и плавное исчезновение
        fr.syncTargetsFromStore();
      }
    );

    return () => {
      unsub();
      fr.dispose();
      fogRef.current = null;
    };
  }, [scene, mapId, tileSize]);

  useFrame((_, delta) => {
    fogRef.current?.tick(delta);
  });

  return fogRef;
}