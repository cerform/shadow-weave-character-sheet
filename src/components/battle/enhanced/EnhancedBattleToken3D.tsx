import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { useEnhancedBattleStore, type EnhancedToken } from "@/stores/enhancedBattleStore";
import { canMoveToPosition, snapToGrid } from "@/utils/movementUtils";
import * as THREE from "three";

interface EnhancedBattleToken3DProps {
  token: EnhancedToken;
}

export const EnhancedBattleToken3D: React.FC<EnhancedBattleToken3DProps> = ({ token }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const { 
    tokens, 
    activeId, 
    selectedTokenId,
    updateToken, 
    selectToken,
    addCombatEvent 
  } = useEnhancedBattleStore();
  
  const isActive = activeId === token.id;
  const isSelected = selectedTokenId === token.id;
  const speed = token.speed || 6;
  
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

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    
    // Выбираем токен
    selectToken(token.id);
    
    // Начинаем перетаскивание только если это активный токен
    if (isActive && !token.hasMovedThisTurn) {
      setDragging(true);
      (event.target as any).setPointerCapture(event.pointerId);
      
      // Показываем сетку перемещения
      useEnhancedBattleStore.getState().setShowMovementGrid(true);
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging || !isActive) return;
    
    event.stopPropagation();
    
    // Получаем позицию мыши в мире через raycasting с плоскостью
    const mouse = new THREE.Vector2(
      (event.nativeEvent.clientX / window.innerWidth) * 2 - 1,
      -(event.nativeEvent.clientY / window.innerHeight) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, event.camera);
    
    // Создаем плоскость на уровне земли
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
      const newPosition = snapToGrid([
        intersectionPoint.x,
        0,
        intersectionPoint.z
      ]);
      
      console.log('Trying to move to:', newPosition);
      
      // Проверяем, можем ли переместиться в эту позицию
      if (canMoveToPosition(
        token.position,
        newPosition,
        speed,
        tokens,
        token.id,
        token.hasMovedThisTurn
      )) {
        console.log('Movement allowed, updating position');
        // Обновляем позицию токена
        updateToken(token.id, { position: newPosition });
      } else {
        console.log('Movement not allowed');
      }
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (dragging) {
      setDragging(false);
      (event.target as any).releasePointerCapture(event.pointerId);
      
      // Скрываем сетку перемещения
      useEnhancedBattleStore.getState().setShowMovementGrid(false);
      
      // Отмечаем, что токен переместился в этом ходу
      updateToken(token.id, { hasMovedThisTurn: true });
      
      // Добавляем событие в лог
      addCombatEvent({
        actor: token.name,
        action: 'Перемещение',
        description: `${token.name} переместился на новую позицию`
      });
    }
  };

  // Цвет токена
  const tokenColor = token.isEnemy ? "#ef4444" : "#22c55e";
  const emissiveColor = isSelected ? "#fbbf24" : (isActive ? "#3b82f6" : "#000000");
  
  return (
    <group position={token.position}>
      {/* Основной токен */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshStandardMaterial 
          color={tokenColor}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 0.3 : (isActive ? 0.2 : 0)}
        />
      </mesh>

      {/* Кольцо активного токена */}
      {isActive && (
        <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 16]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Тень */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.2}
        />
      </mesh>

      {/* UI информация */}
      <Html position={[0, 1, 0]} center>
        <div className="pointer-events-none">
          {/* Имя токена */}
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 mb-1 text-center">
            <span className="text-xs font-medium">{token.name}</span>
            {isActive && (
              <span className="ml-2 text-xs text-primary font-bold">Ход</span>
            )}
          </div>
          
          {/* HP полоса */}
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 mb-1">
            <div className="flex items-center gap-1 text-xs">
              <span>HP:</span>
              <div className="w-16 h-2 bg-muted rounded overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all"
                  style={{
                    width: `${(token.hp / token.maxHp) * 100}%`,
                    backgroundColor: token.hp > token.maxHp * 0.5 ? '#22c55e' : 
                                   token.hp > token.maxHp * 0.25 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <span>{token.hp}/{token.maxHp}</span>
            </div>
          </div>

          {/* AC и скорость */}
          <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 mb-1">
            <div className="flex items-center gap-2 text-xs">
              <span>AC: {token.ac}</span>
              <span>Скорость: {speed}</span>
            </div>
          </div>

          {/* Состояния */}
          {token.conditions.length > 0 && (
            <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1">
              <div className="flex flex-wrap gap-1">
                {token.conditions.map((condition, index) => (
                  <span 
                    key={index}
                    className="bg-orange-500 text-white text-xs px-1 rounded"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Индикатор движения */}
          {isActive && token.hasMovedThisTurn && (
            <div className="bg-blue-500/80 backdrop-blur-sm rounded px-2 py-1 mt-1">
              <span className="text-xs text-white">Переместился</span>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};