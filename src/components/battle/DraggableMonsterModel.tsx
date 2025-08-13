import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';

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