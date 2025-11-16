import { Html, useGLTF } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState, useMemo } from "react";
import { useUnifiedBattleStore } from "@/stores/unifiedBattleStore";
import { type EnhancedToken } from "@/stores/enhancedBattleStore";
import { canMoveToPosition, snapToGrid, gridToWorld, type GridPosition } from "@/utils/movementUtils";
import { MovementIndicator } from "./MovementIndicator";
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
// ИСПРАВЛЕНО: useGLTF вызывается ВНЕ try-catch для предотвращения React Error #185
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
  
  // ✅ КРИТИЧНО: Хук ВСЕГДА вызывается, независимо от ошибок
  let gltf;
  try {
    gltf = useGLTF(modelPath);
  } catch (error) {
    gltf = null;
  }
  
  // Условный РЕНДЕРИНГ, а не условный ХУК
  if (!gltf || !gltf.scene) {
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
  
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={[0, 0, 0]}
      scale={[scale, scale, scale]}
      castShadow
      receiveShadow
    />
  );
};

export const EnhancedBattleToken3D: React.FC<EnhancedBattleToken3DProps> = ({ token }) => {
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
  
  // Определяем тип модели на основе имени или класса токена
  const getModelType = (token: EnhancedToken): keyof typeof MODEL_PATHS => {
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
  };
  
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

  const handleTokenClick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    // Выбираем токен и показываем сетку перемещения
    selectToken(token.id);
    
    // Показываем сетку перемещения если токен еще не двигался
    if (!token.hasMovedThisTurn) {
      setShowMovementGrid(true);
    }
  };


  const handleCellClick = (cell: GridPosition) => {
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
  };

  return (
    <group position={token.position} ref={meshRef}>
      {/* Индикатор доступных ходов - показываем для выбранного токена */}
      <MovementIndicator 
        tokenId={token.id}
        visible={isSelected && !token.hasMovedThisTurn && showMovementGrid}
        onCellClick={handleCellClick}
      />
      
      {/* 3D модель персонажа */}
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
        <Character3DModel
          modelType={getModelType(token)}
          position={token.position}
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

      {/* UI информация над токеном */}
      <Html position={[0, 2, 0]} center>
        <div className="bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap pointer-events-none">
          <div className="font-medium">{token.name}</div>
          <div className="text-xs">
            {token.hp}/{token.maxHp} HP | AC {token.ac}
          </div>
          {token.conditions && token.conditions.length > 0 && (
            <div className="text-xs text-yellow-400">
              {token.conditions.join(', ')}
            </div>
          )}
          {token.hasMovedThisTurn && (
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