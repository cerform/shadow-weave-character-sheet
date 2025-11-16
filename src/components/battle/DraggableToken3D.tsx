import React from 'react';
import { Text } from '@react-three/drei';
import { useDraggable3D } from '@/hooks/useDraggable3D';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';


interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'helmet' | 'boots';
  modelPath?: string;
  stats?: {
    damage?: string;
    ac?: number;
    bonus?: string;
  };
}

interface DraggableToken3DProps {
  token: any;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  isDM?: boolean;
  onDragChange?: (dragging: boolean) => void;
}

// Компонент экипировки для токена
const TokenEquipment: React.FC<{ equipment: Equipment[] }> = ({ equipment }) => {
  return (
    <>
      {equipment.map((item) => {
        const equipmentColor = item.type === 'weapon' ? '#fbbf24' : 
                              item.type === 'armor' ? '#6b7280' : 
                              item.type === 'helmet' ? '#3b82f6' : '#8b5cf6';
        
        const equipmentPosition = getDefaultEquipmentPosition(item.type);
        
        return (
          <group key={item.id} position={[equipmentPosition.x, equipmentPosition.y, equipmentPosition.z]}>
            {getEquipmentGeometry(item.type, equipmentColor)}
          </group>
        );
      })}
    </>
  );
};

// Получение позиции экипировки по умолчанию
const getDefaultEquipmentPosition = (type: string) => {
  switch (type) {
    case 'weapon': return { x: 0.3, y: 0.3, z: 0 };
    case 'armor': return { x: 0, y: 0.1, z: 0 };
    case 'helmet': return { x: 0, y: 0.8, z: 0 };
    case 'boots': return { x: 0, y: -0.2, z: 0 };
    default: return { x: 0, y: 0, z: 0 };
  }
};

// Получение геометрии экипировки
const getEquipmentGeometry = (type: string, color: string) => {
  switch (type) {
    case 'weapon':
      return (
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'armor':
      return (
        <mesh>
          <boxGeometry args={[0.6, 0.7, 0.2]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      );
    case 'helmet':
      return (
        <mesh>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'boots':
      return (
        <mesh>
          <boxGeometry args={[0.2, 0.15, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
};

const DraggableToken3D: React.FC<DraggableToken3DProps> = ({
  token,
  position,
  isSelected,
  onSelect,
  onMove,
  isDM = false,
  onDragChange,
}) => {
  const canMove = isDM || token.controlledBy === 'player1';
  const { shouldHandleTokenInteraction, setSelectedToken } = useBattle3DControlStore();
  
  const {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(canMove && shouldHandleTokenInteraction(), onMove, onDragChange, () => {
    if (shouldHandleTokenInteraction()) {
      setSelectedToken(token.id);
      onSelect();
    }
  });

  
  return (
    <group ref={groupRef} position={position}>
      {/* Главный токен с улучшенным дизайном */}
      <mesh 
        castShadow
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.8, 12]} />
        <meshStandardMaterial 
          color={token.color || '#3b82f6'} 
          emissive={isSelected ? '#444444' : '#000000'}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>

      
      {/* Экипировка токена */}
      {token.equipment && token.equipment.length > 0 && (
        <TokenEquipment equipment={token.equipment} />
      )}
      
      {/* Название токена - только если не перетаскиваем */}
      {!isDragging && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="black"
        >
          {String(token.name || 'Token')}
        </Text>
      )}

      {/* HP бар над токеном */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <group position={[0, 1.6, 0]}>
          {/* Фон HP бара */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* HP бар */}
          <mesh position={[-(1 - (token.hp / token.maxHp)) / 2, 0, 0.02]}>
            <planeGeometry args={[token.hp / token.maxHp, 0.08]} />
            <meshBasicMaterial color={
              token.hp > token.maxHp * 0.5 ? '#22c55e' : 
              token.hp > token.maxHp * 0.25 ? '#eab308' : '#ef4444'
            } />
          </mesh>
          {/* HP текст */}
          <Text
            position={[0, -0.15, 0.03]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {`${Number(token.hp || 0)}/${Number(token.maxHp || 1)}`}
          </Text>
        </group>
      )}
      
      {/* Тень под токеном */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Выделение при выборе */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial 
            color="#fbbf24"
            opacity={0.6} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
};

export default DraggableToken3D;