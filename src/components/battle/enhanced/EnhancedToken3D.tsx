import React, { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh } from 'three';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { useDraggable3D } from '@/hooks/useDraggable3D';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EnhancedToken3DProps {
  token: EnhancedToken;
}

export const EnhancedToken3D: React.FC<EnhancedToken3DProps> = ({ token }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const {
    activeId,
    selectedTokenId,
    selectToken,
    showContextMenu,
    hideContextMenu,
    moveToken,
  } = useEnhancedBattleStore();

  const isActive = token.id === activeId;
  const isSelected = token.id === selectedTokenId;
  const hpPercentage = (token.hp / token.maxHp) * 100;
  
  // Логика перетаскивания для активного токена
  const canMove = isActive;
  const {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(
    canMove,
    (mapX: number, mapY: number) => {
      // Простое прямое перемещение в 3D пространстве
      const newX = (mapX - 400) / 40; // Центрируем и масштабируем
      const newZ = (mapY - 300) / 40; // Центрируем и масштабируем
      moveToken(token.id, [newX, token.position[1], newZ]);
    },
    (dragging: boolean) => {
      // Обновляем состояние перетаскивания
      console.log(`Dragging ${token.name}:`, dragging);
    },
    () => selectToken(token.id)
  );

  // Gentle floating animation for active token
  useFrame((state) => {
    if (meshRef.current && isActive && !isDragging) {
      meshRef.current.position.y = token.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectToken(token.id);
  };

  const handleRightClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hideContextMenu();
    
    // Convert 3D position to screen coordinates
    const rect = e.camera.parent?.userData.domElement?.getBoundingClientRect();
    if (rect) {
      showContextMenu(
        rect.left + (e.pointer.x + 1) * rect.width / 2,
        rect.top + (-e.pointer.y + 1) * rect.height / 2,
        token.id
      );
    }
  };

  const handlePointerOver = () => setHovered(true);
  const handlePointerOut = () => setHovered(false);

  const tokenSize = (token.size || 1) * 0.6;
  const tokenColor = token.isEnemy ? '#ef4444' : '#3b82f6';
  const ringColor = isActive ? '#22c55e' : isSelected ? '#eab308' : tokenColor;

  return (
    <group ref={groupRef} position={token.position}>
      {/* Base token mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onPointerOver={(e) => {
          handlePointerOver();
          handlePointerEnter();
        }}
        onPointerOut={(e) => {
          handlePointerOut();
          handlePointerLeave();
        }}
        onPointerDown={handlePointerDown}
        scale={hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[tokenSize, tokenSize, 0.3, 24]} />
        <meshStandardMaterial
          color={tokenColor}
          emissive={hovered || isDragging ? tokenColor : '#000000'}
          emissiveIntensity={hovered || isDragging ? 0.2 : 0}
        />
      </mesh>

      {/* Selection/Active ring */}
      {(isActive || isSelected || hovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[tokenSize + 0.1, tokenSize + 0.2, 32]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={isActive ? 0.9 : 0.6}
          />
        </mesh>
      )}

      {/* Shadow */}
      <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[tokenSize * 2, tokenSize * 2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* HTML overlay with token info */}
      <Html
        center
        distanceFactor={12}
        transform={false}
        sprite
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="text-center space-y-1">
          {/* Token name */}
          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white font-semibold text-sm">
              {String(token.name || 'Token')}
            </span>
            {isActive && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Ход
              </Badge>
            )}
          </div>

          {/* HP bar */}
          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full min-w-20">
            <div className="flex items-center gap-2">
              <Progress
                value={hpPercentage}
                className="h-1 flex-1"
              />
              <span className="text-white text-xs font-mono">
                {Number(token.hp || 0)}/{Number(token.maxHp || 1)}
              </span>
            </div>
          </div>

          {/* Conditions */}
          {Array.isArray(token.conditions) && token.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {token.conditions.map((condition, idx) => (
                <Badge
                  key={idx}
                  variant="destructive"
                  className="text-xs px-1 py-0"
                >
                  {String(condition)}
                </Badge>
              ))}
            </div>
          )}

          {/* AC display */}
          <div className="bg-slate-700/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-slate-200 text-xs">
              AC {Number(token.ac || 0)}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};