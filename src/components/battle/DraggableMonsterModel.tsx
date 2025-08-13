import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';

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
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const canMove = isDM || token.controlledBy === 'player1';

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
    
    if (canMove) {
      setIsDragging(true);
      gl.domElement.style.cursor = 'grabbing';
      try { onDragChange?.(true); } catch {}
    }
  };

  // Обработка событий мыши на уровне документа для плавного перетаскивания
  React.useEffect(() => {
    if (isDragging && groupRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
          const boundedX = Math.max(-12, Math.min(12, intersectionPoint.x));
          const boundedZ = Math.max(-8, Math.min(8, intersectionPoint.z));
          
          // Плавное движение модели в реальном времени
          if (groupRef.current) {
            groupRef.current.position.x = boundedX;
            groupRef.current.position.z = boundedZ;
            // Держим Y координату постоянной во время перетаскивания
            groupRef.current.position.y = position[1];
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        gl.domElement.style.cursor = 'default';
        try { onDragChange?.(false); } catch {}
        
        if (groupRef.current) {
          const newPos = groupRef.current.position;
          const mapX = ((newPos.x + 12) / 24) * 1200;
          const mapY = ((-newPos.z + 8) / 16) * 800;
          const boundedMapX = Math.max(0, Math.min(1200, mapX));
          const boundedMapY = Math.max(0, Math.min(800, mapY));
          
          console.log('🎯 Monster moved to:', { 
            x: boundedMapX, 
            y: boundedMapY,
            from3D: { x: newPos.x, z: newPos.z },
            tokenId: token.id
          });
          
          onMove(boundedMapX, boundedMapY);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, camera, gl.domElement, onMove, position, token.id]);

  return (
    <group ref={groupRef} position={position}>
      {/* Интерактивная область для перетаскивания */}
      <mesh 
        position={[0, 0.5, 0]}
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (canMove) {
            gl.domElement.style.cursor = 'grab';
          }
        }}
        onPointerLeave={() => {
          if (!isDragging) {
            gl.domElement.style.cursor = 'default';
          }
        }}
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
      
      {/* HP бар над моделью */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <group position={[0, 1.8, 0]}>
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
            outlineWidth={0.02}
            outlineColor="black"
          >
            {`${token.hp}/${token.maxHp}`}
          </Text>
        </group>
      )}
      
      {/* Название токена */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {token.name}
      </Text>

      {/* Визуальная обратная связь при перетаскивании */}
      {isDragging && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 16]} />
          <meshBasicMaterial 
            color="#3b82f6"
            opacity={0.5} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
};

export default DraggableMonsterModel;