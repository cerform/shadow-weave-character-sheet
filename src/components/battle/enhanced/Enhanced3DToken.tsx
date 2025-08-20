// src/components/battle/enhanced/Enhanced3DToken.tsx
import React, { useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';

interface Enhanced3DTokenProps {
  tokenId: string;
  position: [number, number, number];
  modelUrl?: string;
  name: string;
  color: string;
  hp?: number;
  maxHp?: number;
  isDragging?: boolean;
}

export const Enhanced3DToken: React.FC<Enhanced3DTokenProps> = ({
  tokenId,
  position,
  modelUrl,
  name,
  color,
  hp,
  maxHp,
  isDragging = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(Math.random() * Math.PI * 2);
  
  const { activeId, setInitiativeOrder, initiativeOrder } = useEnhancedBattleStore();
  const { shouldHandleCameraControls } = useBattle3DControlStore();
  
  const isActive = activeId === tokenId;

  // Загружаем 3D модель или используем fallback
  let model;
  try {
    if (modelUrl) {
      const gltf: GLTF = useLoader(GLTFLoader, modelUrl);
      model = gltf.scene.clone();
      
      // Масштабируем модель под размер токена
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const scale = 1 / maxDimension;
      model.scale.setScalar(scale);
      
      // Центрируем модель
      box.setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
    }
  } catch (error) {
    console.warn('Failed to load model for token:', tokenId, error);
    model = null;
  }

  // Анимация и эффекты
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Плавное покачивание при наведении
      if (isHovered || isActive) {
        groupRef.current.position.y = position[1] + Math.sin(animationPhase) * 0.1;
        setAnimationPhase(prev => prev + delta * 3);
      } else {
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          position[1],
          delta * 5
        );
      }
      
      // Подсветка активного токена
      if (isActive && !isDragging) {
        groupRef.current.rotation.y += delta;
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (shouldHandleCameraControls) {
      // Устанавливаем токен как активный через setInitiativeOrder
      if (isActive) {
        setInitiativeOrder(initiativeOrder, null);
      } else {
        setInitiativeOrder(initiativeOrder, tokenId);
      }
    }
  };

  // Fallback геометрия если модель не загрузилась
  const FallbackGeometry = () => (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshPhongMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshPhongMaterial color={color} />
      </mesh>
    </group>
  );

  // HP бар
  const hpPercentage = hp && maxHp ? hp / maxHp : 1;
  const hpBarColor = hpPercentage > 0.6 ? '#10b981' : hpPercentage > 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* Основная модель или fallback */}
      {model ? (
        <primitive object={model} />
      ) : (
        <FallbackGeometry />
      )}
      
      {/* Кольцо выделения для активного токена */}
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.6, 0.8, 32]} />
          <meshBasicMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Подсветка при наведении */}
      {(isHovered || isActive) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[0.5, 0.9, 32]} />
          <meshBasicMaterial 
            color={isActive ? "#3b82f6" : "#64748b"} 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Имя токена */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {name}
      </Text>

      {/* HP бар */}
      {hp !== undefined && maxHp !== undefined && (
        <group position={[0, 1.0, 0]}>
          {/* Фон HP бара */}
          <mesh>
            <planeGeometry args={[0.8, 0.08]} />
            <meshBasicMaterial color="#1f2937" transparent opacity={0.8} />
          </mesh>
          {/* Заполнение HP бара */}
          <mesh position={[(-0.8 * (1 - hpPercentage)) / 2, 0, 0.001]}>
            <planeGeometry args={[0.8 * hpPercentage, 0.06]} />
            <meshBasicMaterial color={hpBarColor} />
          </mesh>
          {/* Текст HP */}
          <Text
            position={[0, 0, 0.002]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {`${hp}/${maxHp}`}
          </Text>
        </group>
      )}
    </group>
  );
};