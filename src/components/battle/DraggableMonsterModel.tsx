import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';
import { useDraggable3D } from '@/hooks/useDraggable3D';

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

interface DraggableMonsterModelProps {
  token: any;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
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
    case 'weapon': return { x: 0.5, y: 0.3, z: 0 };
    case 'armor': return { x: 0, y: 0.1, z: 0 };
    case 'helmet': return { x: 0, y: 1.5, z: 0 };
    case 'boots': return { x: 0, y: -0.3, z: 0 };
    default: return { x: 0, y: 0, z: 0 };
  }
};

// Получение геометрии экипировки
const getEquipmentGeometry = (type: string, color: string) => {
  switch (type) {
    case 'weapon':
      return (
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'armor':
      return (
        <mesh>
          <boxGeometry args={[0.8, 1, 0.3]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      );
    case 'helmet':
      return (
        <mesh>
          <sphereGeometry args={[0.25]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'boots':
      return (
        <mesh>
          <boxGeometry args={[0.3, 0.2, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
};

const DraggableMonsterModel: React.FC<DraggableMonsterModelProps> = ({
  token,
  position,
  isSelected,
  isHovered,
  onSelect,
  onMove,
  isDM = false,
  onDragChange,
}) => {
  const canMove = isDM || token.controlledBy === 'player1';
  
  const {
    groupRef,
    isDragging,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
  } = useDraggable3D(canMove, onMove, onDragChange, onSelect);

  console.log(`🎭 DraggableMonsterModel: ${token.name} (${token.monsterType}) can move: ${canMove}`);

  return (
    <group ref={groupRef} position={position}>
      {/* Интерактивная область для перетаскивания */}
      <mesh 
        position={[0, 0.5, 0]}
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* 3D модель монстра */}
      <MonsterModel
        type={token.monsterType}
        position={[0, 0, 0]}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={onSelect}
      />
      
      {/* Экипировка токена */}
      {token.equipment && token.equipment.length > 0 && (
        <TokenEquipment equipment={token.equipment} />
      )}

      {/* HP Bar */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <group position={[0, 2.5, 0]}>
          {/* Фон HP бара */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* HP бар */}
          <mesh position={[-(1.5 - (1.5 * token.hp / token.maxHp)) / 2, 0, 0.02]}>
            <planeGeometry args={[1.5 * token.hp / token.maxHp, 0.12]} />
            <meshBasicMaterial color={
              token.hp > token.maxHp * 0.5 ? '#22c55e' : 
              token.hp > token.maxHp * 0.25 ? '#eab308' : '#ef4444'
            } />
          </mesh>
          {/* HP текст */}
          <Text
            position={[0, -0.2, 0.03]}
            fontSize={0.12}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {`${token.hp}/${token.maxHp}`}
          </Text>
        </group>
      )}

      {/* Название монстра */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {token.name}
      </Text>

      {/* Выделение при выборе или наведении */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 16]} />
          <meshBasicMaterial 
            color={isSelected ? '#fbbf24' : '#ffffff'} 
            opacity={0.6} 
            transparent 
          />
        </mesh>
      )}

      {/* Индикатор перемещения */}
      {isDragging && (
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="#ff4444" />
        </mesh>
      )}
    </group>
  );
};

export default DraggableMonsterModel;