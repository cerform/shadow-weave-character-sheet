import { useEffect, useCallback } from 'react';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';

interface UseBattle3DControlsProps {
  canvasElement?: HTMLElement;
  isDM?: boolean;
}

export const useBattle3DControls = ({ canvasElement, isDM = false }: UseBattle3DControlsProps = {}) => {
  const {
    setKeyPressed,
    setMouseState,
    setCanvasFocused,
    setMode,
    shouldHandleFogInteraction,
    shouldHandleTokenInteraction,
    shouldHandleCameraControls,
    keysPressed,
    currentMode,
  } = useBattle3DControlStore();

  // Обработчик клавиатуры
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    console.log('⌨️ Key down in useBattle3DControls:', {
      key: e.key,
      code: e.code,
      shift: e.shiftKey,
      alt: e.altKey,
      ctrl: e.ctrlKey,
      canvasElement: canvasElement?.tagName,
      timestamp: Date.now()
    });
    
    // Предотвращаем дефолтное поведение для важных клавиш
    if (['Shift', 'Alt', 'Control', ' '].includes(e.key)) {
      console.log('⌨️ Preventing default for key:', e.key);
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'Shift':
        console.log('⌨️ Setting shift key to true');
        setKeyPressed('shift', true);
        break;
      case 'Alt':
        console.log('⌨️ Setting alt key to true');
        setKeyPressed('alt', true);
        break;
      case 'Control':
        console.log('⌨️ Setting ctrl key to true');
        setKeyPressed('ctrl', true);
        break;
      case ' ':
        console.log('⌨️ Setting space key to true');
        setKeyPressed('space', true);
        break;
      case 'Escape':
        console.log('⌨️ Escape pressed - resetting to navigation mode');
        // Сброс всех выделений и возврат к навигации
        setMode('navigation');
        break;
      case '1':
        console.log('⌨️ Key 1 pressed - setting navigation mode');
        setMode('navigation');
        break;
      case '2':
        console.log('⌨️ Key 2 pressed - setting token mode');
        setMode('token');
        break;
      case '3':
        console.log('⌨️ Key 3 pressed - setting fog mode');
        setMode('fog');
        break;
      case '4':
        console.log('⌨️ Key 4 pressed - setting camera mode');
        setMode('camera');
        break; 
      case '5':
        console.log('⌨️ Key 5 pressed - setting asset mode');
        setMode('asset');
        break;
    }
  }, [isDM, setKeyPressed, setMode, canvasElement]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Shift':
        setKeyPressed('shift', false);
        break;
      case 'Alt':
        setKeyPressed('alt', false);
        break;
      case 'Control':
        setKeyPressed('ctrl', false);
        break;
      case ' ':
        setKeyPressed('space', false);
        break;
    }
  }, [currentMode, keysPressed, setKeyPressed, setMode]);

  // Обработчики мыши
  const handleMouseDown = useCallback((e: MouseEvent) => {
    console.log('🖱️ Mouse down in useBattle3DControls:', {
      button: e.button,
      target: (e.target as HTMLElement)?.tagName,
      canvasElement: canvasElement?.tagName,
      isCanvasTarget: e.target === canvasElement,
      clientX: e.clientX,
      clientY: e.clientY,
      timestamp: Date.now()
    });
    
    // Проверяем, что нажата левая кнопка мыши
    if (e.button !== 0) {
      console.log('🖱️ Not left button - ignoring');
      return;
    }
    
    console.log('🖱️ Setting mouse state - down: true, dragging: false');
    setMouseState(true, false);
  }, [setMouseState, canvasElement]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Логируем каждое 10-е движение мыши чтобы не засорять консоль
    if (Math.random() < 0.1) {
      console.log('🖱️ Mouse move in useBattle3DControls:', {
        movementX: e.movementX,
        movementY: e.movementY,
        keysPressed: keysPressed,
        timestamp: Date.now()
      });
    }
    
    // Обновляем дельта мыши только при активном движении
    if (keysPressed.shift || keysPressed.alt || keysPressed.ctrl || keysPressed.space) {
      const delta = { x: e.movementX, y: e.movementY };
      console.log('🖱️ Setting mouse state - modifier key active, dragging:', delta);
      setMouseState(true, true, delta);
    }
  }, [setMouseState, keysPressed]);

  const handleMouseUp = useCallback(() => {
    console.log('🖱️ Mouse up in useBattle3DControls - setting mouse state to false');
    setMouseState(false, false);
  }, [setMouseState]);

  // Обработчики фокуса канваса
  const handleCanvasFocus = useCallback(() => {
    setCanvasFocused(true);
  }, [setCanvasFocused]);

  const handleCanvasBlur = useCallback(() => {
    setCanvasFocused(false);
  }, [setCanvasFocused]);

  // Установка слушателей событий
  useEffect(() => {
    console.log('🎧 Setting up event listeners in useBattle3DControls:', {
      canvasElement: canvasElement?.tagName,
      hasCanvasElement: !!canvasElement,
      timestamp: Date.now()
    });
    
    // Глобальные слушатели клавиатуры
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Слушатели мыши
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    if (canvasElement) {
      console.log('🎧 Adding canvas-specific event listeners');
      canvasElement.addEventListener('mousedown', handleMouseDown);
      canvasElement.addEventListener('focus', handleCanvasFocus);
      canvasElement.addEventListener('blur', handleCanvasBlur);
      
      // Делаем канвас фокусируемым
      canvasElement.setAttribute('tabindex', '0');
    } else {
      console.log('🎧 No canvas element - skipping canvas-specific listeners');
    }

    return () => {
      console.log('🎧 Cleaning up event listeners in useBattle3DControls');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (canvasElement) {
        canvasElement.removeEventListener('mousedown', handleMouseDown);
        canvasElement.removeEventListener('focus', handleCanvasFocus);
        canvasElement.removeEventListener('blur', handleCanvasBlur);
      }
    };
  }, [
    canvasElement,
    handleKeyDown,
    handleKeyUp,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasFocus,
    handleCanvasBlur,
  ]);

  return {
    currentMode,
    keysPressed,
    shouldHandleFogInteraction,
    shouldHandleTokenInteraction,
    shouldHandleCameraControls,
  };
};