// Система управления камерой
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enabled={false}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      target={[0, 0, 0]}
    />
  );
};