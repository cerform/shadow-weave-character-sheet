import React, { useEffect, useRef } from 'react';

export const MouseDebugger: React.FC = () => {
  const debugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const buttonNames = ['Left', 'Middle', 'Right'];
      const buttonName = buttonNames[e.button] || `Button${e.button}`;
      
      console.log(`🖱️ MouseDown: ${buttonName} button (${e.button})`, {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      const buttonNames = ['Left', 'Middle', 'Right'];
      const buttonName = buttonNames[e.button] || `Button${e.button}`;
      
      console.log(`🖱️ MouseUp: ${buttonName} button (${e.button})`, {
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Логируем только если какая-то кнопка нажата
      if (e.buttons > 0) {
        const activeButtons = [];
        if (e.buttons & 1) activeButtons.push('Left');
        if (e.buttons & 2) activeButtons.push('Right');
        if (e.buttons & 4) activeButtons.push('Middle');
        
        console.log(`🖱️ MouseMove with buttons: ${activeButtons.join(', ')} (${e.buttons})`, {
          clientX: e.clientX,
          clientY: e.clientY,
          movementX: e.movementX,
          movementY: e.movementY
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      console.log('🖱️ Wheel event:', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        deltaZ: e.deltaZ,
        target: e.target
      });
    };

    const handleContextMenu = (e: MouseEvent) => {
      console.log('🖱️ Context menu event prevented', {
        target: e.target
      });
    };

    // Добавляем слушатели на window для глобального отслеживания
    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('wheel', handleWheel, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    console.log('🖱️ Mouse debugger initialized');

    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      console.log('🖱️ Mouse debugger cleanup');
    };
  }, []);

  return (
    <div 
      ref={debugRef}
      className="fixed top-4 right-4 z-50 bg-black/50 text-white p-2 rounded text-xs max-w-xs"
    >
      <div>🖱️ Mouse Debug Active</div>
      <div className="text-xs opacity-60">Check console for events</div>
    </div>
  );
};