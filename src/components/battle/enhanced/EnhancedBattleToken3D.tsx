import React from "react";
import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo, memo, useCallback } from "react";
import { useUnifiedBattleStore } from "@/stores/unifiedBattleStore";
import { type EnhancedToken } from "@/stores/enhancedBattleStore";
import { canMoveToPosition, snapToGrid, gridToWorld, type GridPosition } from "@/utils/movementUtils";
import { MovementIndicator } from "./MovementIndicator";
import { Model3DErrorBoundary } from "./Model3DErrorBoundary";
import { Character3DModel, type ModelType } from "./ModelLoader";
import * as THREE from "three";

interface EnhancedBattleToken3DProps {
  token: EnhancedToken;
}

// Убрано - теперь используется ModelLoader.tsx с отдельными компонентами для каждой модели

export const EnhancedBattleToken3D = memo<EnhancedBattleToken3DProps>(({ token }) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const { 
    tokens, 
    activeId, 
    selectedTokenId,
    updateToken, 
    selectToken,
    addCombatEvent,
    showMovementGrid,
    setShowMovementGrid
  } = useUnifiedBattleStore();
  
  const isActive = activeId === token.id;
  const isSelected = selectedTokenId === token.id;
  const speed = token.speed || 6;
  
  // Определяем тип модели на основе имени или класса токена - мемоизируем
  const modelType = useMemo<ModelType>(() => {
    const name = token.name.toLowerCase();
    const tokenClass = token.class?.toLowerCase() || '';
    
    if (name.includes('goblin') || tokenClass.includes('goblin')) return 'goblin';
    if (name.includes('skeleton') || tokenClass.includes('skeleton')) return 'skeleton';
    if (name.includes('orc') || tokenClass.includes('orc')) return 'orc';
    if (name.includes('dragon') || tokenClass.includes('dragon')) return 'dragon';
    if (tokenClass.includes('fighter') || tokenClass.includes('warrior')) return 'fighter';
    if (tokenClass.includes('wizard') || tokenClass.includes('mage')) return 'wizard';
    if (tokenClass.includes('rogue') || tokenClass.includes('thief')) return 'rogue';
    if (tokenClass.includes('cleric') || tokenClass.includes('priest')) return 'cleric';
    
    return 'default';
  }, [token.name, token.class]);
  
  // Анимация активного кольца
  useFrame((state) => {
    if (ringRef.current && isActive) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
    
    if (meshRef.current) {
      // Мягкое поднятие при наведении
      const targetY = hovered ? 0.1 : 0;
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  const handleTokenClick = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    // Выбираем токен и показываем сетку перемещения
    selectToken(token.id);
    
    // Показываем сетку перемещения если токен еще не двигался
    if (!token.hasMovedThisTurn) {
      setShowMovementGrid(true);
    }
  }, [token.id, token.hasMovedThisTurn, selectToken, setShowMovementGrid]);


  const handleCellClick = useCallback((cell: GridPosition) => {
    if (token.hasMovedThisTurn) return;
    
    const worldPosition = gridToWorld(cell);
    
    // Проверяем, можем ли переместиться в эту позицию
    if (canMoveToPosition(
      token.position,
      worldPosition,
      speed,
      tokens,
      token.id,
      token.hasMovedThisTurn
    )) {
      // Обновляем позицию токена
      updateToken(token.id, { 
        position: worldPosition,
        hasMovedThisTurn: true 
      });
      
      // Скрываем сетку перемещения после хода
      setShowMovementGrid(false);
      
      // Добавляем событие в лог
      addCombatEvent({
        actor: token.name,
        action: 'Перемещение',
        description: `${token.name} переместился на позицию (${cell.x}, ${cell.z})`,
        playerName: token.name
      });
      
      console.log(`Token ${token.name} moved to position:`, worldPosition);
    }
  }, [token, speed, tokens, updateToken, setShowMovementGrid, addCombatEvent]);

  return (
    <group position={token.position} ref={meshRef}>
      {/* Индикатор доступных ходов - показываем для выбранного токена */}
      <MovementIndicator 
        tokenId={token.id}
        visible={isSelected && !token.hasMovedThisTurn && showMovementGrid}
        onCellClick={handleCellClick}
      />
      
      {/* 3D модель персонажа с ErrorBoundary для предотвращения краша */}
      <group
        onClick={handleTokenClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <Model3DErrorBoundary token={token}>
          <Character3DModel
            modelType={modelType}
            scale={0.8}
            token={token}
            isActive={isActive}
            isSelected={isSelected}
            isEnemy={token.isEnemy}
          />
        </Model3DErrorBoundary>
      </group>

      {/* Кольцо активного токена */}
      {isActive && (
        <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 8]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Кольцо выбранного токена */}
      {isSelected && !isActive && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.65, 8]} />
          <meshBasicMaterial 
            color="#fbbf24" 
            transparent 
            opacity={0.4}
          />
        </mesh>
      )}

      {/* UI информация над токеном */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap pointer-events-none">
          <div className="font-medium">{String(token.name || 'Token')}</div>
          <div className="text-xs">
            {Number(token.hp || 0)}/{Number(token.maxHp || 0)} HP | AC {Number(token.ac || 0)}
          </div>
          {token.conditions && token.conditions.length > 0 && (
            <div className="text-xs text-yellow-400">
              {Array.isArray(token.conditions) ? token.conditions.map(c => String(c)).join(', ') : ''}
            </div>
          )}
          {token.hasMovedThisTurn && (
            <div className="text-xs text-blue-400">Переместился</div>
          )}
        </div>
      </Html>
    </group>
  );
});