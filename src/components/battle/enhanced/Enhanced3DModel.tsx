import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Group } from 'three';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { useDraggable3D } from '@/hooks/useDraggable3D';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SimpleTokenModel, getSimpleModelType } from './SimpleTokenModel';

interface Enhanced3DModelProps {
  token: EnhancedToken;
  modelUrl?: string;
}

export const Enhanced3DModel: React.FC<Enhanced3DModelProps> = ({ token, modelUrl }) => {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
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
  
  // Load 3D model
  useEffect(() => {
    if (!modelUrl) {
      console.log(`⚠️ No modelUrl provided for ${token.name}`);
      return;
    }
    
    setLoading(true);
    
    console.log(`🔄 Loading model for ${token.name}:`, modelUrl);
    
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        console.log(`✅ Model loaded successfully for ${token.name}`);
        setModel(gltf.scene);
        setLoading(false);
      },
      (progress) => {
        console.log(`📊 Loading progress for ${token.name}:`, progress);
      },
      (error) => {
        console.error(`❌ Failed to load model for ${token.name}:`, error);
        console.error(`❌ Model URL was:`, modelUrl);
        setLoading(false);
        // Оставляем model = null для fallback геометрии
      }
    );
  }, [modelUrl, token.name]);

  // Логика перетаскивания для выбранного токена
  const canMove = isSelected;
  const {
    groupRef: draggableRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(
    canMove,
    (mapX: number, mapZ: number) => {
      // Сохраняем Y координату неизменной
      moveToken(token.id, [mapX, token.position[1], mapZ]);
    },
    (dragging: boolean) => {
      console.log(`Dragging ${token.name}:`, dragging);
    },
    () => selectToken(token.id)
  );

  // Gentle floating animation for active token
  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (isActive && !isDragging) {
      // Плавное покачивание для активного токена
      groupRef.current.position.y = token.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      groupRef.current.position.x = token.position[0];
      groupRef.current.position.z = token.position[2];
    } else if (!isDragging) {
      // Убеждаемся, что неактивные токены остаются на своем месте
      groupRef.current.position.set(token.position[0], token.position[1], token.position[2]);
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
      {/* 3D Model or fallback cylinder */}
      <group
        ref={draggableRef}
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
        {model ? (
          // Use the loaded 3D model
          <primitive 
            object={model} 
            scale={[1, 1, 1]} 
            position={[0, 0, 0]}
          />
        ) : loading ? (
          // Loading state - small indicator only
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </mesh>
        ) : !model ? (
          // Fallback: красивая простая модель вместо кубика
          <SimpleTokenModel
            type={getSimpleModelType(token.name, token.isEnemy)}
            color={tokenColor}
            size={tokenSize}
            emissive={hovered || isDragging ? tokenColor : '#000000'}
            emissiveIntensity={hovered || isDragging ? 0.3 : 0}
          />
        ) : null}
      </group>

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
          pointerEvents: isDragging ? 'none' : 'auto', // Отключаем события только во время перетаскивания
          userSelect: 'none',
          zIndex: isDragging ? 1000 : 10, // Поднимаем выше во время перетаскивания
        }}
      >
        <div className="text-center space-y-1">
          {/* Token name */}
          <div className="bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-white font-semibold text-sm">
              {token.name}
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
                {token.hp}/{token.maxHp}
              </span>
            </div>
          </div>

          {/* Conditions */}
          {token.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {token.conditions.map((condition, idx) => (
                <Badge
                  key={idx}
                  variant="destructive"
                  className="text-xs px-1 py-0"
                >
                  {condition}
                </Badge>
              ))}
            </div>
          )}

          {/* AC display */}
          <div className="bg-slate-700/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-slate-200 text-xs">
              AC {token.ac}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};