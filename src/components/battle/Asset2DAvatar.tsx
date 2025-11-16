import React from 'react';
import { Text } from '@react-three/drei';
import { getAsset3DAvatar, findAsset3DAvatarByPath } from '@/data/asset3DAvatars';

interface Asset2DAvatarProps {
  storagePath: string;
  position: [number, number, number];
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
}

const Asset2DAvatar: React.FC<Asset2DAvatarProps> = ({ 
  storagePath, 
  position, 
  isSelected = false, 
  isHovered = false,
  onClick,
  scale = 1,
  rotation = [0, 0, 0]
}) => {
  const avatar = getAsset3DAvatar(storagePath) || findAsset3DAvatarByPath(storagePath);
  
  if (!avatar) {
    // Fallback для неизвестных ассетов
    return (
      <group position={position} scale={scale} rotation={rotation}>
        <mesh castShadow onClick={onClick}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          Unknown
        </Text>
      </group>
    );
  }

  // Размеры в зависимости от размера ассета
  const getSize = () => {
    switch (avatar.size) {
      case 'tiny': return 0.2;
      case 'small': return 0.3;
      case 'medium': return 0.5;
      case 'large': return 0.8;
      case 'huge': return 1.2;
      case 'gargantuan': return 1.8;
      default: return 0.5;
    }
  };

  const baseSize = getSize();
  const scaleMultiplier = Array.isArray(scale) ? Math.max(...scale) : scale;
  const finalSize = baseSize * scaleMultiplier;

  // Выбираем геометрию в зависимости от категории
  const getGeometry = () => {
    switch (avatar.category) {
      case 'monster':
      case 'character':
        return <cylinderGeometry args={[finalSize, finalSize, finalSize * 1.6, 12]} />;
      case 'structure':
        return <boxGeometry args={[finalSize * 1.2, finalSize * 1.8, finalSize * 1.2]} />;
      case 'item':
        return <boxGeometry args={[finalSize * 0.8, finalSize * 0.8, finalSize * 0.8]} />;
      default:
        return <cylinderGeometry args={[finalSize, finalSize, finalSize * 1.6, 12]} />;
    }
  };

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Основа ассета */}
      <mesh castShadow onClick={onClick}>
        {getGeometry()}
        <meshStandardMaterial 
          color={avatar.backgroundColor}
          emissive={isSelected ? '#333333' : '#000000'}
          transparent={isHovered}
          opacity={isHovered ? 0.8 : 1}
        />
      </mesh>

      {/* Эмодзи ассета */}
      <Text
        position={[0, finalSize * 0.6, 0]}
        fontSize={finalSize * 0.6}
        color={avatar.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {avatar.emoji}
      </Text>

      {/* Название ассета */}
      <Text
        position={[0, finalSize * 1.2, 0]}
        fontSize={finalSize * 0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {String(avatar.name || 'Avatar')}
      </Text>

      {/* Выделение при выборе */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[finalSize + 0.1, finalSize + 0.3, 16]} />
          <meshBasicMaterial 
            color={isSelected ? '#fbbf24' : '#ffffff'} 
            opacity={0.6} 
            transparent 
          />
        </mesh>
      )}

      {/* Тень под ассетом */}
      <mesh position={[0, -finalSize * 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[finalSize + 0.1, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Индикатор категории */}
      {avatar.category !== 'character' && (
        <mesh position={[finalSize * 0.8, finalSize * 0.8, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color={
            avatar.category === 'monster' ? '#ef4444' : 
            avatar.category === 'structure' ? '#6b7280' : '#3b82f6'
          } />
        </mesh>
      )}
    </group>
  );
};

export default Asset2DAvatar;