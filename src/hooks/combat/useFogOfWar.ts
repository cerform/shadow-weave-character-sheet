import { useState, useCallback } from 'react';
import { Vector3 } from 'three';

interface FogOfWarState {
  exploredAreas: Set<string>; // Grid coordinates "x,y"
  visibleAreas: Set<string>;  // Currently visible areas
  lightSources: Array<{
    id: string;
    position: Vector3;
    radius: number;
    intensity: number;
  }>;
}

export function useFogOfWar(sessionId: string) {
  const [fowState, setFowState] = useState<FogOfWarState>({
    exploredAreas: new Set(),
    visibleAreas: new Set(),
    lightSources: []
  });

  const updatePlayerVision = useCallback((
    playerPosition: Vector3,
    visionRadius: number,
    darkvision: number = 0
  ) => {
    const newVisibleAreas = new Set<string>();
    const gridRadius = Math.ceil(visionRadius / 5); // Convert feet to grid

    for (let x = -gridRadius; x <= gridRadius; x++) {
      for (let z = -gridRadius; z <= gridRadius; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= gridRadius) {
          const gridX = Math.floor(playerPosition.x / 5) + x;
          const gridZ = Math.floor(playerPosition.z / 5) + z;
          const key = `${gridX},${gridZ}`;
          newVisibleAreas.add(key);
        }
      }
    }

    setFowState(prev => ({
      ...prev,
      visibleAreas: newVisibleAreas,
      exploredAreas: new Set([...prev.exploredAreas, ...newVisibleAreas])
    }));
  }, []);

  const revealArea = useCallback((center: Vector3, radius: number) => {
    const newExploredAreas = new Set(fowState.exploredAreas);
    const gridRadius = Math.ceil(radius / 5);

    for (let x = -gridRadius; x <= gridRadius; x++) {
      for (let z = -gridRadius; z <= gridRadius; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= gridRadius) {
          const gridX = Math.floor(center.x / 5) + x;
          const gridZ = Math.floor(center.z / 5) + z;
          const key = `${gridX},${gridZ}`;
          newExploredAreas.add(key);
        }
      }
    }

    setFowState(prev => ({ ...prev, exploredAreas: newExploredAreas }));
  }, [fowState.exploredAreas]);

  const hideArea = useCallback((center: Vector3, radius: number) => {
    const newExploredAreas = new Set(fowState.exploredAreas);
    const gridRadius = Math.ceil(radius / 5);

    for (let x = -gridRadius; x <= gridRadius; x++) {
      for (let z = -gridRadius; z <= gridRadius; z++) {
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= gridRadius) {
          const gridX = Math.floor(center.x / 5) + x;
          const gridZ = Math.floor(center.z / 5) + z;
          const key = `${gridX},${gridZ}`;
          newExploredAreas.delete(key);
        }
      }
    }

    setFowState(prev => ({ ...prev, exploredAreas: newExploredAreas }));
  }, [fowState.exploredAreas]);

  const addLightSource = useCallback((
    id: string,
    position: Vector3,
    radius: number,
    intensity: number = 1
  ) => {
    setFowState(prev => ({
      ...prev,
      lightSources: [
        ...prev.lightSources.filter(light => light.id !== id),
        { id, position: position.clone(), radius, intensity }
      ]
    }));
  }, []);

  const removeLightSource = useCallback((id: string) => {
    setFowState(prev => ({
      ...prev,
      lightSources: prev.lightSources.filter(light => light.id !== id)
    }));
  }, []);

  return {
    fowState,
    updatePlayerVision,
    revealArea,
    hideArea,
    addLightSource,
    removeLightSource
  };
}