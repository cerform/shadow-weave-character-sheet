import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';

interface Battle3DSceneProps {
  sessionId: string;
  className?: string;
  mapBackground?: string | null;
}

function GridPlane({ mapBackground }: { mapBackground?: string | null }) {
  return (
    <group>
      {/* Map background plane */}
      {mapBackground && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial>
            <primitive object={new THREE.TextureLoader().load(mapBackground)} attach="map" />
          </meshBasicMaterial>
        </mesh>
      )}
      
      {/* Grid overlay */}
      <Grid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6f6f6f"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d4edd"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
    </group>
  );
}

function BattleEntity({ entity }: { entity: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Простая анимация дыхания
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.y = scale;
    }
  });

  return (
    <group position={[entity.pos_x, entity.pos_y, entity.pos_z]}>
      {/* Базовая геометрия - куб как placeholder для модели */}
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial 
          color={entity.is_player_character ? "#4ade80" : "#ef4444"} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Имя над головой */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {entity.name}
      </Text>
      
      {/* HP Bar */}
      <group position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-(1 - (entity.hp_current / entity.hp_max)) / 2, 0, 0.02]} scale={[entity.hp_current / entity.hp_max, 1, 1]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color={entity.hp_current > entity.hp_max * 0.5 ? "#22c55e" : entity.hp_current > entity.hp_max * 0.25 ? "#eab308" : "#ef4444"} />
        </mesh>
      </group>
    </group>
  );
}

function Scene3D({ sessionId, mapBackground }: { sessionId: string; mapBackground?: string | null }) {
  const { scene } = useThree();
  const [entities, setEntities] = useState<any[]>([]);
  
  // Загружаем сущности из базы данных
  useEffect(() => {
    if (!sessionId) return;

    const loadEntities = async () => {
      try {
        const { data, error } = await supabase
          .from('battle_entities')
          .select('*')
          .eq('session_id', sessionId);

        if (error) {
          console.error('Failed to load entities:', error);
          return;
        }

        console.log(`📦 Loaded ${data?.length || 0} battle entities for 3D scene`);
        setEntities(data || []);
      } catch (error) {
        console.error('Failed to load entities:', error);
      }
    };

    // Подписка на изменения в реальном времени
    const channel = supabase
      .channel('battle-entities-3d')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_entities',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('🔄 3D Scene - Battle entity change:', payload);
          loadEntities();
        }
      )
      .subscribe();

    loadEntities();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <>
      {/* Освещение */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Сетка боевого поля */}
      <GridPlane mapBackground={mapBackground} />
      
      {/* Рендерим всех сущностей */}
      {entities.map((entity) => (
        <BattleEntity key={entity.id} entity={entity} />
      ))}
      
      {/* Камера контролы */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

export function Battle3DScene({ sessionId, className = '', mapBackground }: Battle3DSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        shadows
        className="bg-gradient-to-b from-slate-900 to-slate-800"
      >
        <Scene3D sessionId={sessionId} mapBackground={mapBackground} />
      </Canvas>
    </div>
  );
}