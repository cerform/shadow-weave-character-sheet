import { Html, useGLTF } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import React from "react";
import { useUnifiedBattleStore } from "@/stores/unifiedBattleStore";
import { type EnhancedToken } from "@/stores/enhancedBattleStore";
import { canMoveToPosition, snapToGrid, gridToWorld, type GridPosition } from "@/utils/movementUtils";
import { MovementIndicator } from "./MovementIndicator";
import { useDraggable3D } from "@/hooks/useDraggable3D";
import * as THREE from "three";

// 3D модели для разных типов персонажей
const MODEL_PATHS = {
  fighter: "/models/fighter.glb",
  wizard: "/models/wizard.glb",
  rogue: "/models/rogue.glb",
  cleric: "/models/cleric.glb",
  goblin: "/models/goblin.glb",
  skeleton: "/models/skeleton.glb",
  orc: "/models/orc.glb",
  dragon: "/models/dragon.glb",
  default: "/models/character.glb"
} as const;

interface EnhancedBattleToken3DProps {
  token: EnhancedToken;
}

// Компонент 3D модели персонажа
const Character3DModel = ({ modelType, position, isActive, isSelected, isEnemy, scale = 1, token }: {
  modelType: keyof typeof MODEL_PATHS;
  position: [number, number, number];
  isActive: boolean;
  isSelected: boolean;
  isEnemy: boolean;
  scale?: number;
  token: EnhancedToken;
}) => {
  const modelPath = MODEL_PATHS[modelType] || MODEL_PATHS.default;
  
  try {
    const { scene } = useGLTF(modelPath);
    const clonedScene = useMemo(() => scene.clone(), [scene]);
    
    return (
      <primitive 
        object={clonedScene} 
        position={[0, 0, 0]}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
      />
    );
  } catch (error) {
    // Fallback к базовой геометрии если модель не загрузилась
    const tokenColor = token.color || (isEnemy ? "#ef4444" : "#22c55e");
    const emissiveColor = isSelected ? "#fbbf24" : (isActive ? "#3b82f6" : "#000000");
    
    return (
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.2]} />
        <meshStandardMaterial 
          color={tokenColor}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 0.3 : (isActive ? 0.2 : 0)}
        />
      </mesh>
    );
  }
};

export const EnhancedBattleToken3D: React.FC<EnhancedBattleToken3DProps> = ({
  token
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const {
    selectedTokenId,
    activeId,
    tokens,
    showMovementGrid,
    setShowMovementGrid,
    selectToken,
    setActiveToken,
    updateToken,
    addCombatEvent,
    isDM
  } = useUnifiedBattleStore();

  const isSelected = selectedTokenId === token.id;
  const isActive = activeId === token.id;
  const speed = token.speed || 6;
  
  // Можем ли перемещать токен
  const canMove = (isDM || !token.isEnemy) && !token.hasMovedThisTurn;
  
  // Система перетаскивания
  const {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(
    canMove,
    (newX: number, newZ: number) => {
      // Обработка завершения перетаскивания
      const newPosition: [number, number, number] = [newX, token.position[1], newZ];
      
      console.log('🎯 Token drag completed, new position:', newPosition);
      
      // Проверяем, можем ли переместиться в эту позицию
      if (canMoveToPosition(
        token.position,
        newPosition,
        speed,
        tokens,
        token.id,
        token.hasMovedThisTurn
      )) {
        console.log('🎯 Valid move, updating token position');
        // Обновляем позицию токена
        updateToken(token.id, { 
          position: newPosition,
          hasMovedThisTurn: true 
        });
        
        // Добавляем событие в лог
        addCombatEvent({
          actor: token.name,
          action: 'Перемещение',
          description: `${token.name} переместился`,
          playerName: token.name
        });
        
        console.log(`🎯 Token ${token.name} moved to:`, newPosition);
      } else {
        console.log('🎯 Invalid move, reverting position');
        // Возвращаем токен на исходную позицию
        if (groupRef.current) {
          groupRef.current.position.set(...token.position);
        }
      }
    },
    (dragging: boolean) => {
      console.log(`🎯 Token ${token.name} dragging:`, dragging);
      if (dragging && !isSelected) {
        selectToken(token.id);
      }
    },
    () => {
      // Выбор токена при клике
      if (!isDragging) {
        selectToken(token.id);
        console.log(`🎯 Token selected: ${token.name}`);
      }
    }
  );

  // Синхронизируем позицию ref с позицией токена
  React.useEffect(() => {
    if (groupRef.current && !isDragging) {
      groupRef.current.position.set(...token.position);
    }
  }, [token.position, isDragging]);

  // Анимация кольца активного токена
  useFrame((state) => {
    if (ringRef.current && isActive) {
      ringRef.current.rotation.z = state.clock.elapsedTime;
    }
  });

  // Получаем тип модели на основе класса токена
  const getModelType = (token: EnhancedToken): keyof typeof MODEL_PATHS => {
    const name = token.name.toLowerCase();
    const tokenClass = token.class?.toLowerCase() || '';
    
    if (name.includes('goblin') || tokenClass.includes('goblin')) return 'goblin';
    if (name.includes('skeleton') || tokenClass.includes('skeleton')) return 'skeleton';
    if (name.includes('orc') || tokenClass.includes('orc')) return 'orc';
    if (name.includes('dragon') || tokenClass.includes('dragon')) return 'dragon';
    if (tokenClass.includes('fighter') || tokenClass.includes('warrior')) return 'fighter';
    if (tokenClass.includes('wizard') || tokenClass.includes('mage')) return 'wizard';
    if (tokenClass.includes('rogue') || tokenClass.includes('assassin')) return 'rogue';
    if (tokenClass.includes('cleric') || tokenClass.includes('priest')) return 'cleric';
    
    return 'default';
  };

  // Обработчик клика по клетке движения
  const handleCellClick = (cell: GridPosition) => {
    const worldPosition = gridToWorld(cell);
    
    console.log('🎯 Cell clicked:', cell);
    console.log('🎯 World position calculated:', worldPosition);
    
    // Проверяем, можем ли переместиться в эту позицию
    if (canMoveToPosition(
      token.position,
      worldPosition,
      speed,
      tokens,
      token.id,
      token.hasMovedThisTurn
    )) {
      console.log('🎯 Can move to position, updating token...');
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
      
      console.log(`🎯 Token ${token.name} moved to position:`, worldPosition);
    } else {
      console.log('🎯 Cannot move to position - blocked or too far');
    }
  };

  return (
    <group ref={groupRef} position={token.position}>
      {/* Индикатор доступных ходов - показываем для выбранного токена */}
      <MovementIndicator 
        tokenId={token.id}
        visible={isSelected && !token.hasMovedThisTurn && showMovementGrid}
        onCellClick={handleCellClick}
      />
      
      {/* 3D модель персонажа с интерактивностью */}
      <group
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerOut={handlePointerLeave}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
      >
        <Character3DModel
          modelType={getModelType(token)}
          position={[0, 0, 0]} // Позиция относительно группы
          isActive={isActive}
          isSelected={isSelected}
          isEnemy={token.isEnemy}
          scale={0.8}
          token={token}
        />
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

      {/* Подсветка при наведении или перетаскивании */}
      {(hovered || isDragging) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.8, 8]} />
          <meshBasicMaterial 
            color={canMove ? "#22c55e" : "#ef4444"}
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}

      {/* UI информация над токеном */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap pointer-events-none">
          <div className="font-medium">{token.name}</div>
          <div className="text-xs">
            {token.hp}/{token.maxHp} HP | AC {token.ac}
          </div>
          {isDragging && (
            <div className="text-xs text-green-400">Перемещение...</div>
          )}
          {token.conditions.length > 0 && (
            <div className="text-xs text-yellow-400">
              {token.conditions.join(', ')}
            </div>
          )}
          {token.hasMovedThisTurn && !isDragging && (
            <div className="text-xs text-blue-400">Переместился</div>
          )}
        </div>
      </Html>
    </group>
  );
};

// Preload 3D models
Object.values(MODEL_PATHS).forEach((path) => {
  useGLTF.preload(path);
});