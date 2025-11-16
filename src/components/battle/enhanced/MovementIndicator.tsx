import { useMemo, useRef, useEffect } from "react";
import { InstancedMesh, Object3D, Color } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useUnifiedBattleStore } from "@/stores/unifiedBattleStore";
import { getAccessibleCells, gridToWorld, type GridPosition } from "@/utils/movementUtils";

interface MovementIndicatorProps {
  tokenId: string;
  visible: boolean;
  onCellClick?: (position: GridPosition) => void;
}

export const MovementIndicator: React.FC<MovementIndicatorProps> = ({ 
  tokenId, 
  visible, 
  onCellClick 
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const baseColor = useMemo(() => new Color("#3b82f6"), []);
  const hoverColor = useMemo(() => new Color("#60a5fa"), []);
  
  const tokens = useUnifiedBattleStore(s => s.tokens);
  const token = tokens.find(t => t.id === tokenId);
  
  // Вычисляем доступные клетки
  const accessibleCells = useMemo(() => {
    if (!token || !visible || token.hasMovedThisTurn) return [];
    
    const speed = token.speed || 6;
    const cells = getAccessibleCells(
      token.position,
      speed,
      tokens,
      tokenId
    );
    return Array.isArray(cells) ? cells : [];
  }, [token, tokens, tokenId, visible]);

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: ВСЕ ХУКИ ДОЛЖНЫ ВЫЗЫВАТЬСЯ ДО РАННЕГО ВОЗВРАТА
  // Обновляем позиции инстансов при изменении доступных клеток
  useEffect(() => {
    if (!meshRef.current || accessibleCells.length === 0) return;
    
    const mesh = meshRef.current;
    
    accessibleCells.forEach((cell, i) => {
      const worldPos = gridToWorld(cell);
      dummy.position.set(worldPos[0], 0.01, worldPos[2]);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.instanceMatrix.needsUpdate = true;
    
    // Устанавливаем базовый цвет для всех инстансов
    if (mesh.instanceColor) {
      for (let i = 0; i < accessibleCells.length; i++) {
        mesh.setColorAt(i, baseColor);
      }
      mesh.instanceColor.needsUpdate = true;
    }
  }, [accessibleCells, dummy, baseColor]);

  // Анимация пульсации
  useFrame((state) => {
    if (!meshRef.current || accessibleCells.length === 0) return;
    
    const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.95;
    meshRef.current.scale.setScalar(pulse);
  });

  // ✅ РАННИЙ ВОЗВРАТ ТОЛЬКО ПОСЛЕ ВСЕХ ХУКОВ
  if (!visible || !token || token.hasMovedThisTurn || accessibleCells.length === 0) {
    return null;
  }

  // Обработка кликов на инстансы
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    
    if (instanceId != null && instanceId < accessibleCells.length) {
      const cell = accessibleCells[instanceId];
      onCellClick?.(cell);
    }
  };

  // Обработка наведения
  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (!meshRef.current) return;
    
    const instanceId = e.instanceId;
    if (instanceId != null && meshRef.current.instanceColor) {
      meshRef.current.setColorAt(instanceId, hoverColor);
      meshRef.current.instanceColor.needsUpdate = true;
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    if (!meshRef.current) return;
    
    const instanceId = e.instanceId;
    if (instanceId != null && meshRef.current.instanceColor) {
      meshRef.current.setColorAt(instanceId, baseColor);
      meshRef.current.instanceColor.needsUpdate = true;
    }
  };

  return (
    <instancedMesh
      key={`movement-${tokenId}-${accessibleCells.length}`}
      ref={meshRef}
      args={[undefined, undefined, accessibleCells.length]}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <circleGeometry args={[0.4, 16]} />
      <meshBasicMaterial
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};
