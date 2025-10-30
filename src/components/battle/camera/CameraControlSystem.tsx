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

    // Включаем управление камерой сразу при инициализации
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('📷 Camera controls initialized and enabled');
    }

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <OrbitControls
      ref={orbitControlsRef}
      enabled={true} // Включено по умолчанию
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2} // Ограничиваем поворот, чтобы камера не уходила под карту
      target={[0, 0, 0]}
      zoomSpeed={1.5} // Увеличиваем скорость зума
      panSpeed={1.2} // Увеличиваем скорость панорамирования
    />
  );
};