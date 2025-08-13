import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';
  modelPath?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

interface Token3DProps {
  token: {
    id: string;
    name: string;
    type: 'player' | 'monster' | 'npc' | 'boss';
    color: string;
    position: { x: number; y: number; z?: number };
    hp?: number;
    maxHp?: number;
    size: number;
    avatar?: string;
    equipment?: Equipment[];
  };
  onClick?: () => void;
  onMove?: (newPosition: { x: number; y: number; z?: number }) => void;
  isDM?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}

const Token3D: React.FC<Token3DProps> = ({ 
  token, 
  onClick, 
  onMove,
  isDM = false, 
  isSelected = false, 
  isHovered = false 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Проверяем безопасность данных токена
  if (!token || !token.position) {
    console.warn('🚨 Token3D: Invalid token data:', token);
    return null;
  }

  // Анимация при наведении
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isHovered) {
        meshRef.current.scale.setScalar(1.1);
      } else if (isSelected) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Цвет токена с дефолтным значением
  const tokenColor = useMemo(() => {
    try {
      return new THREE.Color(token.color || '#3b82f6');
    } catch (error) {
      console.warn('🚨 Invalid token color:', token.color);
      return new THREE.Color('#3b82f6');
    }
  }, [token.color]);

  // Модель токена в зависимости от типа
  const TokenModel = () => {
    const baseSize = (token.size || 50) * 0.01; // Нормализуем размер
    
    switch (token.type) {
      case 'player':
        return (
          <Cylinder args={[baseSize, baseSize, 1, 8]} position={[0, 0.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={tokenColor} />
          </Cylinder>
        );
      
      case 'monster':
        return (
          <Sphere args={[baseSize, 8, 6]} position={[0, baseSize, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={tokenColor} />
          </Sphere>
        );
      
      case 'npc':
        return (
          <Box args={[baseSize * 2, 1, baseSize * 2]} position={[0, 0.5, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={tokenColor} />
          </Box>
        );
      
      case 'boss':
        return (
          <Cone args={[baseSize * 1.5, 2, 6]} position={[0, 1, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={tokenColor} />
          </Cone>
        );
      
      default:
        return (
          <Sphere args={[baseSize, 8, 6]} position={[0, baseSize, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={tokenColor} />
          </Sphere>
        );
    }
  };

  // Компонент экипировки
  const EquipmentRenderer = () => {
    if (!token.equipment || token.equipment.length === 0) return null;

    return (
      <>
        {token.equipment.map((item) => {
          // Простая визуализация экипировки
          const equipmentColor = item.type === 'weapon' ? '#fbbf24' : 
                                item.type === 'armor' ? '#6b7280' : 
                                item.type === 'helmet' ? '#3b82f6' : '#8b5cf6';
          
          const equipmentPosition = item.position || getDefaultEquipmentPosition(item.type);
          const equipmentScale = item.scale || { x: 0.3, y: 0.3, z: 0.3 };
          
          return (
            <group key={item.id} position={[equipmentPosition.x, equipmentPosition.y, equipmentPosition.z]}>
              {getEquipmentGeometry(item.type, equipmentColor, equipmentScale)}
            </group>
          );
        })}
      </>
    );
  };

  // Получение позиции экипировки по умолчанию
  const getDefaultEquipmentPosition = (type: string) => {
    switch (type) {
      case 'weapon': return { x: 0.5, y: 0.5, z: 0 };
      case 'armor': return { x: 0, y: 0.2, z: 0 };
      case 'helmet': return { x: 0, y: 1.2, z: 0 };
      case 'boots': return { x: 0, y: -0.3, z: 0 };
      default: return { x: 0, y: 0, z: 0 };
    }
  };

  // Получение геометрии экипировки
  const getEquipmentGeometry = (type: string, color: string, scale: any) => {
    switch (type) {
      case 'weapon':
        return (
          <Cylinder args={[0.05, 0.05, 1]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} />
          </Cylinder>
        );
      case 'armor':
        return (
          <Box args={[0.8, 1, 0.3]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} transparent opacity={0.7} />
          </Box>
        );
      case 'helmet':
        return (
          <Sphere args={[0.3]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} />
          </Sphere>
        );
      case 'boots':
        return (
          <Box args={[0.3, 0.2, 0.4]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} />
          </Box>
        );
      default:
        return (
          <Box args={[0.2, 0.2, 0.2]} scale={[scale.x, scale.y, scale.z]}>
            <meshStandardMaterial color={color} />
          </Box>
        );
    }
  };

  // Обработка перемещения
  const { camera, raycaster } = useThree();
  
  const handlePointerDown = (e: any) => {
    if (!isDM) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !isDM || !onMove) return;
    
    const deltaX = (e.clientX - dragStart.x) * 0.01;
    const deltaY = (e.clientY - dragStart.y) * 0.01;
    
    const newPosition = {
      x: token.position.x + deltaX,
      y: token.position.y - deltaY, // Инвертируем Y для правильного направления
      z: token.position.z || 0
    };
    
    onMove(newPosition);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Добавляем слушатели мыши к окну для перемещения
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
      };
    }
  }, [isDragging, dragStart]);

  // HP бар над токеном
  const HPBar = () => {
    if (!token.hp || !token.maxHp) return null;
    
    const hpPercentage = token.hp / token.maxHp;
    const barWidth = (token.size || 50) * 0.02;
    const barHeight = 0.1;
    
    return (
      <group position={[0, 2, 0]}>
        {/* Фон бара */}
        <Box args={[barWidth, barHeight, 0.05]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#333333" />
        </Box>
        {/* HP бар */}
        <Box 
          args={[barWidth * hpPercentage, barHeight, 0.06]} 
          position={[-(barWidth * (1 - hpPercentage)) / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color={hpPercentage > 0.5 ? "#10b981" : hpPercentage > 0.25 ? "#f59e0b" : "#ef4444"} 
          />
        </Box>
        {/* Текст HP */}
        <Text
          position={[0, 0.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {`${token.hp}/${token.maxHp}`}
        </Text>
      </group>
    );
  };

  return (
    <group
      ref={groupRef}
      position={[token.position.x || 0, token.position.z || 0, token.position.y || 0]}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = isDM ? 'grab' : 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Тень под токеном */}
      <Cylinder 
        args={[0.5, 0.5, 0.01, 16]} 
        position={[0, 0.01, 0]}
      >
        <meshStandardMaterial color="#000000" opacity={0.3} transparent />
      </Cylinder>

      {/* Основная модель токена */}
      <group ref={meshRef}>
        <TokenModel />
        {/* Экипировка привязана к основной модели */}
        <EquipmentRenderer />
      </group>

      {/* HP бар */}
      <HPBar />

      {/* Имя токена */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {token.name}
      </Text>

      {/* Индикатор выделения */}
      {(isSelected || isHovered) && (
        <Cylinder 
          args={[0.8, 0.8, 0.02, 16]} 
          position={[0, 0.02, 0]}
        >
          <meshStandardMaterial 
            color={isSelected ? "#fbbf24" : "#3b82f6"} 
            opacity={0.6} 
            transparent 
          />
        </Cylinder>
      )}
    </group>
  );
};

export default Token3D;