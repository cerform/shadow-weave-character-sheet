// Система управления камерой
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { interactionManager, InteractionMode } from '@/systems/interaction/InteractionModeManager';

export const CameraControlSystem: React.FC = () => {
  console.log('🎮 CameraControlSystem: Component initializing...');
  const { camera, gl } = useThree(); 
  const orbitControlsRef = useRef<any>(null);
  console.log('🎮 CameraControlSystem: useThree hook called, camera:', camera, 'gl:', gl);

  // Подробное отслеживание всех событий мыши на canvas
  useEffect(() => {
    console.log('🎮 CameraControlSystem: useEffect для событий мыши запускается...');
    const canvas = gl.domElement;
    console.log('🖱️ Canvas получен:', canvas);
    console.log('🖱️ Canvas className:', canvas.className);
    console.log('🖱️ Canvas parent:', canvas.parentElement);
    console.log('🖱️ Canvas style:', canvas.style.cssText);
    console.log('🖱️ Canvas rect:', canvas.getBoundingClientRect());
    
    const handleMouseDown = (e: MouseEvent) => {
      const buttonNames = ['Left', 'Middle', 'Right', 'Back', 'Forward'];
      console.log('🖱️ MOUSE DOWN:', {
        button: e.button,
        buttonName: buttonNames[e.button] || `Unknown(${e.button})`,
        buttons: e.buttons,
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        target: e.target?.constructor?.name,
        orbitsEnabled: orbitControlsRef.current?.enabled,
        timestamp: Date.now()
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      const buttonNames = ['Left', 'Middle', 'Right', 'Back', 'Forward'];
      console.log('🖱️ MOUSE UP:', {
        button: e.button,
        buttonName: buttonNames[e.button] || `Unknown(${e.button})`,
        buttons: e.buttons,
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target?.constructor?.name,
        orbitsEnabled: orbitControlsRef.current?.enabled,
        timestamp: Date.now()
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons > 0) {
        const activeButtons = [];
        if (e.buttons & 1) activeButtons.push('Left');
        if (e.buttons & 2) activeButtons.push('Right'); 
        if (e.buttons & 4) activeButtons.push('Middle');
        if (e.buttons & 8) activeButtons.push('Back');
        if (e.buttons & 16) activeButtons.push('Forward');
        
        console.log('🖱️ MOUSE MOVE (with buttons):', {
          buttons: e.buttons,
          activeButtons: activeButtons.join(', '),
          clientX: e.clientX,
          clientY: e.clientY,
          movementX: e.movementX,
          movementY: e.movementY,
          orbitsEnabled: orbitControlsRef.current?.enabled,
          orbitsState: orbitControlsRef.current ? {
            enablePan: orbitControlsRef.current.enablePan,
            enableRotate: orbitControlsRef.current.enableRotate,
            enableZoom: orbitControlsRef.current.enableZoom,
            mouseButtons: orbitControlsRef.current.mouseButtons
          } : null
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      console.log('🖱️ WHEEL:', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        deltaMode: e.deltaMode,
        clientX: e.clientX,
        clientY: e.clientY,
        orbitsEnabled: orbitControlsRef.current?.enabled,
        timestamp: Date.now()
      });
    };

    const handleContextMenu = (e: MouseEvent) => {
      console.log('🖱️ CONTEXT MENU:', {
        clientX: e.clientX,
        clientY: e.clientY,
        button: e.button,
        target: e.target?.constructor?.name,
        prevented: e.defaultPrevented,
        timestamp: Date.now()
      });
    };

    const handlePointerDown = (e: PointerEvent) => {
      console.log('🖱️ POINTER DOWN:', {
        pointerId: e.pointerId,
        pointerType: e.pointerType,
        button: e.button,
        buttons: e.buttons,
        clientX: e.clientX,
        clientY: e.clientY,
        pressure: e.pressure,
        isPrimary: e.isPrimary,
        timestamp: Date.now()
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.buttons > 0) {
        console.log('🖱️ POINTER MOVE (with buttons):', {
          pointerId: e.pointerId,
          pointerType: e.pointerType,
          buttons: e.buttons,
          clientX: e.clientX,
          clientY: e.clientY,
          movementX: e.movementX,
          movementY: e.movementY,
          pressure: e.pressure,
          timestamp: Date.now()
        });
      }
    };

    // Добавляем все слушатели БЕЗ capture для правильной обработки
    console.log('🖱️ Добавляем event listeners...');
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);

    console.log('🖱️ Mouse event listeners attached to canvas:', canvas);
    console.log('🖱️ Canvas listeners test - triggering manual event...');
    
    // Тестируем, работают ли слушатели
    setTimeout(() => {
      console.log('🖱️ Canvas после добавления listeners, проверяем наличие событий');
    }, 1000);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      console.log('🖱️ Mouse event listeners removed');
    };
  }, [gl.domElement]);

  // Устанавливаем фиксированную позицию камеры
  useEffect(() => {
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Управляем OrbitControls с детальным логированием
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      
      console.log('🎮 OrbitControls configuration:', {
        enabled: orbitControlsRef.current.enabled,
        enablePan: orbitControlsRef.current.enablePan,
        enableRotate: orbitControlsRef.current.enableRotate,
        enableZoom: orbitControlsRef.current.enableZoom,
        mouseButtons: orbitControlsRef.current.mouseButtons,
        touches: orbitControlsRef.current.touches
      });
    }
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
        RIGHT: null                    // ПКМ - отключено (для контекстного меню)
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,       // Один палец - поворот
        TWO: THREE.TOUCH.DOLLY_PAN     // Два пальца - зум и панорамирование
      }}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
};