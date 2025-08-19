import React from 'react';
import { useBattle3DControlStore } from '@/stores/battle3DControlStore';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

export const ModeIndicator3D: React.FC = () => {
  const { currentMode, keysPressed } = useBattle3DControlStore();
  const { fogSettings } = useFogOfWarStore();

  const getModeInfo = () => {
    if (keysPressed.shift && fogSettings.enabled) {
      return { icon: '🌫️', text: 'Открыть туман', color: 'bg-green-600' };
    }
    if (keysPressed.alt && fogSettings.enabled) {
      return { icon: '🌫️', text: 'Скрыть туман', color: 'bg-red-600' };
    }
    if (keysPressed.ctrl) {
      return { icon: '🤚', text: 'Переместить туман', color: 'bg-blue-600' };
    }
    if (keysPressed.space) {
      return { icon: '🎥', text: 'Навигация камеры', color: 'bg-purple-600' };
    }

    switch (currentMode) {
      case 'navigation':
        return { icon: '🧭', text: 'Навигация', color: 'bg-slate-600' };
      case 'token':
        return { icon: '🎭', text: 'Управление токенами', color: 'bg-blue-600' };
      case 'fog':
        return { icon: '🌫️', text: 'Туман войны', color: 'bg-purple-600' };
      case 'asset':
        return { icon: '🏗️', text: 'Управление ассетами', color: 'bg-orange-600' };
      default:
        return { icon: '🧭', text: 'Навигация', color: 'bg-slate-600' };
    }
  };

  const { icon, text, color } = getModeInfo();

  return (
    <div className="absolute bottom-4 left-4 z-50">
      <div className={`${color} text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm`}>
        <span>{icon}</span>
        <span className="font-medium">{text}</span>
      </div>
      
      {/* Подсказки по клавишам */}
      <div className="mt-2 text-xs text-white/70 space-y-1">
        <div><kbd className="px-1 py-0.5 bg-black/30 rounded">1</kbd> Навигация</div>
        <div><kbd className="px-1 py-0.5 bg-black/30 rounded">2</kbd> Токены</div>
        {fogSettings.enabled && (
          <div><kbd className="px-1 py-0.5 bg-black/30 rounded">3</kbd> Туман</div>
        )}
        <div><kbd className="px-1 py-0.5 bg-black/30 rounded">4</kbd> Ассеты</div>
        <div><kbd className="px-1 py-0.5 bg-black/30 rounded">Esc</kbd> Сброс</div>
      </div>
    </div>
  );
};