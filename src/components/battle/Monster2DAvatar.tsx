import React from 'react';
import { Text } from '@react-three/drei';
import { getMonsterAvatar } from '@/data/monsterAvatars';

interface Monster2DAvatarProps {
  type: string;
  position: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

const Monster2DAvatar: React.FC<Monster2DAvatarProps> = ({ 
  type, 
  position, 
  isSelected = false, 
  isHovered = false,
  onClick 
}) => {
  const avatar = getMonsterAvatar(type);
  
  if (!avatar) {
    // Fallback для неизвестных типов
    return (
      <group position={position}>
        <mesh castShadow onClick={onClick}>
          <cylinderGeometry args={[0.4, 0.4, 0.8, 12]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </group>
    );
  }

  // Размеры в зависимости от размера монстра
  const getSize = () => {
    switch (avatar.size) {
      case 'small': return 0.3;
      case 'medium': return 0.4;
      case 'large': return 0.6;
      case 'huge': return 0.8;
      default: return 0.4;
    }
  };

  const baseSize = getSize();

  return (
    <group position={position}>
      {/* Основа токена - цилиндр с цветом монстра */}
      <mesh castShadow onClick={onClick}>
        <cylinderGeometry args={[baseSize, baseSize, 0.8, 12]} />
        <meshStandardMaterial 
          color={avatar.backgroundColor}
          emissive={isSelected ? '#333333' : '#000000'}
        />
      </mesh>

      {/* Эмодзи монстра как текст */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={baseSize * 0.8}
        color={avatar.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {avatar.emoji}
      </Text>

      {/* Выделение при выборе */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseSize + 0.2, baseSize + 0.4, 16]} />
          <meshBasicMaterial 
            color={isSelected ? '#fbbf24' : '#ffffff'} 
            opacity={0.6} 
            transparent 
          />
        </mesh>
      )}

      {/* Тень под токеном */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[baseSize + 0.1, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
};

export default Monster2DAvatar;