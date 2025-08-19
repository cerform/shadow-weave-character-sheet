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
    // Предотвращаем дефолтное поведение для важных клавиш
    if (['Shift', 'Alt', 'Control', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'Shift':
        setKeyPressed('shift', true);
        break;
      case 'Alt':
        setKeyPressed('alt', true);
        break;
      case 'Control':
        setKeyPressed('ctrl', true);
        break;
      case ' ':
        setKeyPressed('space', true);
        break;
      case 'Escape':
        // Сброс всех выделений и возврат к навигации
        setMode('navigation');
        break;
      case '1':
        setMode('navigation');
        break;
      case '2':
        setMode('token');
        break;
      case '4':
        setMode('asset');
        break;
    }
  }, [isDM, setKeyPressed, setMode]);

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
    // Проверяем, что нажата левая кнопка мыши
    if (e.button !== 0) return;
    
    setMouseState(true, false);
  }, [setMouseState]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Обновляем дельта мыши только при активном движении
    if (keysPressed.shift || keysPressed.alt || keysPressed.ctrl || keysPressed.space) {
      const delta = { x: e.movementX, y: e.movementY };
      setMouseState(true, true, delta);
    }
  }, [setMouseState, keysPressed]);

  const handleMouseUp = useCallback(() => {
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
    // Глобальные слушатели клавиатуры
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Слушатели мыши
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    if (canvasElement) {
      canvasElement.addEventListener('mousedown', handleMouseDown);
      canvasElement.addEventListener('focus', handleCanvasFocus);
      canvasElement.addEventListener('blur', handleCanvasBlur);
      
      // Делаем канвас фокусируемым
      canvasElement.setAttribute('tabindex', '0');
    }

    return () => {
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