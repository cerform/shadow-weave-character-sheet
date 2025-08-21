import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { getAccessibleCells, gridToWorld, type GridPosition } from '@/utils/movementUtils';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

interface MovementIndicatorProps {
  tokenId: string;
  visible: boolean;
  onCellClick?: (position: GridPosition) => void;
}

export const MovementIndicator: React.FC<MovementIndicatorProps> = ({ tokenId, visible, onCellClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tokens = useUnifiedBattleStore(s => s.tokens);
  
  const token = tokens.find(t => t.id === tokenId);
  
  const accessibleCells = useMemo(() => {
    if (!token || !visible || token.hasMovedThisTurn) return [];
    
    const speed = token.speed || 6;
    return getAccessibleCells(
      token.position,
      speed,
      tokens,
      tokenId
    );
  }, [token, tokens, tokenId, visible]);

  useFrame((state) => {
    if (groupRef.current && visible && accessibleCells.length > 0) {
      // Мягкая пульсация
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      groupRef.current.scale.setScalar(pulse);
    }
  });

  if (!visible || !token || token.hasMovedThisTurn || accessibleCells.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {accessibleCells.map((cell, index) => {
        const worldPos = gridToWorld(cell);
        const opacity = 0.4;
        
        return (
          <mesh
            key={`movement-${cell.x}-${cell.z}`}
            position={[worldPos[0], 0.01, worldPos[2]]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onCellClick?.(cell);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              (e.object as any).material.color.setHex(0x60a5fa);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              (e.object as any).material.color.setHex(0x3b82f6);
            }}
          >
            <circleGeometry args={[0.4, 16]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};