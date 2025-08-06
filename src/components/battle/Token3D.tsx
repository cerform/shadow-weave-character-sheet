import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import * as THREE from 'three';

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
  };
  onClick?: () => void;
  isDM?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}

const Token3D: React.FC<Token3DProps> = ({ 
  token, 
  onClick, 
  isDM = false, 
  isSelected = false, 
  isHovered = false 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

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

  // Цвет токена
  const tokenColor = useMemo(() => new THREE.Color(token.color), [token.color]);

  // Модель токена в зависимости от типа
  const TokenModel = () => {
    const baseSize = token.size * 0.5;
    
    switch (token.type) {
      case 'player':
        // Игрок - цилиндр с короной
        return (
          <group>
            <Cylinder args={[baseSize, baseSize, 1, 8]} position={[0, 0.5, 0]}>
              <meshStandardMaterial color={tokenColor} />
            </Cylinder>
            {/* Корона */}
            <Cone args={[baseSize * 0.8, 0.3, 8]} position={[0, 1.2, 0]}>
              <meshStandardMaterial color="#ffd700" />
            </Cone>
          </group>
        );
      
      case 'monster':
        // Монстр - неровная сфера
        return (
          <group>
            <Sphere args={[baseSize, 8, 6]} position={[0, baseSize, 0]}>
              <meshStandardMaterial 
                color={tokenColor} 
                roughness={0.8}
                metalness={0.2}
              />
            </Sphere>
            {/* Шипы */}
            {[...Array(6)].map((_, i) => (
              <Cone 
                key={i}
                args={[0.1, 0.3, 4]} 
                position={[
                  Math.cos((i / 6) * Math.PI * 2) * baseSize * 0.8,
                  baseSize + Math.sin((i / 6) * Math.PI * 2) * 0.2,
                  Math.sin((i / 6) * Math.PI * 2) * baseSize * 0.8
                ]}
                rotation={[
                  Math.cos((i / 6) * Math.PI * 2) * 0.5,
                  0,
                  Math.sin((i / 6) * Math.PI * 2) * 0.5
                ]}
              >
                <meshStandardMaterial color="#8b0000" />
              </Cone>
            ))}
          </group>
        );
      
      case 'npc':
        // NPC - простой куб
        return (
          <Box args={[baseSize * 2, 1, baseSize * 2]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color={tokenColor} />
          </Box>
        );
      
      case 'boss':
        // Босс - большая сложная модель
        return (
          <group>
            <Sphere args={[baseSize * 1.2, 12, 8]} position={[0, baseSize * 1.2, 0]}>
              <meshStandardMaterial 
                color={tokenColor} 
                roughness={0.3}
                metalness={0.7}
                emissive={new THREE.Color(token.color).multiplyScalar(0.2)}
              />
            </Sphere>
            {/* Энергетические орбы вокруг босса */}
            {[...Array(8)].map((_, i) => (
              <Sphere 
                key={i}
                args={[0.1, 8, 6]} 
                position={[
                  Math.cos((i / 8) * Math.PI * 2) * baseSize * 2,
                  baseSize + Math.sin(Date.now() * 0.001 + i) * 0.3,
                  Math.sin((i / 8) * Math.PI * 2) * baseSize * 2
                ]}
              >
                <meshStandardMaterial 
                  color="#ff6b6b" 
                  emissive="#ff6b6b"
                  emissiveIntensity={0.5}
                />
              </Sphere>
            ))}
          </group>
        );
      
      default:
        return (
          <Sphere args={[baseSize, 8, 6]} position={[0, baseSize, 0]}>
            <meshStandardMaterial color={tokenColor} />
          </Sphere>
        );
    }
  };

  // HP бар над токеном
  const HPBar = () => {
    if (!token.hp || !token.maxHp) return null;
    
    const hpPercentage = token.hp / token.maxHp;
    const barWidth = token.size;
    const barHeight = 0.1;
    
    return (
      <group position={[0, token.size * 1.5, 0]}>
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
          outlineWidth={0.02}
          outlineColor="black"
        >
          {`${token.hp}/${token.maxHp}`}
        </Text>
      </group>
    );
  };

  return (
    <group
      ref={groupRef}
      position={[token.position.x / 50, 0, token.position.y / 50]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Тень под токеном */}
      <Cylinder 
        args={[token.size * 0.8, token.size * 0.8, 0.01, 16]} 
        position={[0, 0.01, 0]}
      >
        <meshStandardMaterial color="#000000" opacity={0.3} transparent />
      </Cylinder>

      {/* Основная модель токена */}
      <mesh ref={meshRef}>
        <TokenModel />
      </mesh>

      {/* HP бар */}
      <HPBar />

      {/* Имя токена */}
      <Text
        position={[0, token.size * 1.8, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
        font="/fonts/helvetiker_bold.typeface.json"
      >
        {token.name}
      </Text>

      {/* Индикатор выделения */}
      {(isSelected || isHovered) && (
        <Cylinder 
          args={[token.size * 1.2, token.size * 1.2, 0.02, 16]} 
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