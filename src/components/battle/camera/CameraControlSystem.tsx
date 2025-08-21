// Система управления камерой
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { interactionManager, InteractionMode } from '@/systems/interaction/InteractionModeManager';

export const CameraControlSystem: React.FC = () => {
  const { camera } = useThree();
  const orbitControlsRef = useRef<any>(null);

  // Устанавливаем фиксированную позицию камеры
  useEffect(() => {
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Управляем OrbitControls в зависимости от режима
  useEffect(() => {
    // Временно всегда включаем управление камерой для отладки
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('📷 Camera controls force enabled for debugging');
    }

    /* Отключаем InteractionModeManager временно для отладки
    const unsubscribe = interactionManager.subscribe((state) => {
      if (orbitControlsRef.current) {
        const shouldEnable = state.mode === InteractionMode.CAMERA;
        orbitControlsRef.current.enabled = shouldEnable;
        
        if (shouldEnable) {
          console.log('📷 Camera controls enabled');
        } else {
          console.log('📷 Camera controls disabled');
        }
      }
    });

    // Включаем управление камерой сразу при инициализации
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('📷 Camera controls initialized and enabled');
    }

    return () => {
      unsubscribe();
    };
    */
  }, []);

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enabled={true}
      enablePan={true}
      enableZoom={true} 
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      target={[0, 0, 0]}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,      // ЛКМ - поворот
        MIDDLE: THREE.MOUSE.PAN,       // СКМ - панорамирование 
        RIGHT: THREE.MOUSE.PAN         // ПКМ - тоже панорамирование (fallback)
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,       // Один палец - поворот
        TWO: THREE.TOUCH.DOLLY_PAN     // Два пальца - зум и панорамирование
      }}
      enableDamping={true}
      dampingFactor={0.05}
      onStart={() => console.log('🎮 OrbitControls: interaction started')}
      onChange={() => console.log('🎮 OrbitControls: camera moved')}
      onEnd={() => console.log('🎮 OrbitControls: interaction ended')}
    />
  );
};