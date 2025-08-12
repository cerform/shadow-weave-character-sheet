import React, { useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface DraggableToken3DProps {
  token: any;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  isDM?: boolean;
  onDragChange?: (dragging: boolean) => void;
}

const DraggableToken3D: React.FC<DraggableToken3DProps> = ({
  token,
  position,
  isSelected,
  onSelect,
  onMove,
  isDM = false,
  onDragChange,
}) => {
  const meshRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  const { camera, gl, scene } = useThree();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
    
    if (isDM || token.controlledBy === 'player1') {
      setIsDragging(true);
      setStartPosition(meshRef.current?.position.clone() || new THREE.Vector3());
      gl.domElement.style.cursor = 'grabbing';
      // Disable camera controls while dragging
      try { onDragChange?.(true); } catch {}
    }
  };
  const handlePointerMove = (e: any) => {
    if (!isDragging) return;

    // Обновляем позицию мыши
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Создаем raycast на плоскость Y=0
    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
      // Ограничиваем движение в пределах карты
      const boundedX = Math.max(-12, Math.min(12, intersectionPoint.x));
      const boundedZ = Math.max(-8, Math.min(8, intersectionPoint.z));
      
      if (meshRef.current) {
        meshRef.current.position.x = boundedX;
        meshRef.current.position.z = boundedZ;
      }
    }
  };

  const handlePointerUp = (e: any) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    gl.domElement.style.cursor = 'default';
    try { onDragChange?.(false); } catch {}
    
    if (meshRef.current) {
      const newPos = meshRef.current.position;
      
      // Конвертируем 3D координаты обратно в 2D координаты карты
      const mapX = ((newPos.x + 12) / 24) * 1200;
      const mapY = ((-newPos.z + 8) / 16) * 800;
      
      // Ограничиваем границами карты
      const boundedMapX = Math.max(0, Math.min(1200, mapX));
      const boundedMapY = Math.max(0, Math.min(800, mapY));
      
      console.log('🎯 Token moved to:', { 
        x: boundedMapX, 
        y: boundedMapY,
        from3D: { x: newPos.x, z: newPos.z }
      });
      
      onMove(boundedMapX, boundedMapY);
    }
  };

  // Обработка событий мыши на уровне документа для плавного перетаскивания
  React.useEffect(() => {
    if (isDragging) {
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
          
          if (meshRef.current) {
            meshRef.current.position.x = boundedX;
            meshRef.current.position.z = boundedZ;
          }
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        gl.domElement.style.cursor = 'default';
        try { onDragChange?.(false); } catch {}
        
        if (meshRef.current) {
          const newPos = meshRef.current.position;
          const mapX = ((newPos.x + 12) / 24) * 1200;
          const mapY = ((-newPos.z + 8) / 16) * 800;
          const boundedMapX = Math.max(0, Math.min(1200, mapX));
          const boundedMapY = Math.max(0, Math.min(800, mapY));
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
  }, [isDragging, camera, gl.domElement, onMove]);

  return (
    <group ref={meshRef} position={position}>
      {/* Главный токен */}
      <mesh 
        castShadow
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (isDM || token.controlledBy === 'player1') {
            gl.domElement.style.cursor = 'grab';
          }
        }}
        onPointerLeave={() => {
          if (!isDragging) {
            gl.domElement.style.cursor = 'default';
          }
        }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.8, 12]} />
        <meshStandardMaterial 
          color={token.color || '#3b82f6'} 
          emissive={isSelected ? '#444444' : '#000000'}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>
      
      {/* Название токена */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {token.name}
      </Text>

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
            {`${token.hp}/${token.maxHp}`}
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