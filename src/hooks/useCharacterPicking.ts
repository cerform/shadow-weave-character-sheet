import { useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CharacterManager } from '@/utils/CharacterManager';

export function useCharacterPicking(scene: THREE.Scene, manager: CharacterManager) {
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pickFromPointer = useCallback((
    event: MouseEvent,
    camera: THREE.Camera
  ): string | null => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length === 0) {
      setSelectedId(null);
      return null;
    }

    const intersectedObject = intersects[0].object;
    const handle = manager.findCharacterByObject(intersectedObject);
    
    const characterId = handle?.id ?? null;
    setSelectedId(characterId);
    return characterId;
  }, [scene, manager, raycaster]);

  const selectCharacter = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const getSelectedCharacter = useCallback(() => {
    return selectedId ? manager.getHandle(selectedId) : null;
  }, [selectedId, manager]);

  return {
    selectedId,
    setSelectedId: selectCharacter,
    pickFromPointer,
    getSelectedCharacter
  };
}