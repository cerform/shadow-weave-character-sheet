// Панель управления туманом войны для ДМ
import React from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export const FogOfWarControls: React.FC = () => {
  const { 
    spawnPoints, 
    playerVisionRadius, 
    revealOnMove,
    maxSpawnPoints,
    clearAllFog,
    resetFog,
    removeSpawnPoint,
    assignPlayerToSpawn
  } = useFogOfWarStore();
  
  const { isDM, tokens } = useUnifiedBattleStore();
  
  if (!isDM) return null;
  
  const playerTokens = tokens.filter(t => !t.isEnemy);
  
  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="text-yellow-400 font-semibold tracking-wide uppercase text-xs">
        Туман войны
      </div>
      
      {/* Настройки */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="opacity-70 w-32">Радиус видимости</span>
          <input 
            type="range" 
            min={1} 
            max={10} 
            value={playerVisionRadius} 
            onChange={(e) => useFogOfWarStore.setState({ playerVisionRadius: parseInt(e.target.value) })}
            className="w-full"
          />
          <span className="w-8 text-right">{playerVisionRadius}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            id="revealOnMove" 
            type="checkbox" 
            checked={revealOnMove} 
            onChange={(e) => useFogOfWarStore.setState({ revealOnMove: e.target.checked })}
          />
          <label htmlFor="revealOnMove" className="text-sm">
            Открывать туман при движении игроков
          </label>
        </div>
      </div>
      
      {/* Точки спавна */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-emerald-400">
          Точки спавна игроков ({spawnPoints.length}/{maxSpawnPoints})
        </div>
        
        <div className="text-xs opacity-70 mb-2">
          Кликните по карте чтобы добавить точку спавна
        </div>
        
        {spawnPoints.length === 0 ? (
          <div className="text-xs opacity-50 italic">
            Нет точек спавна. Кликните по карте чтобы добавить.
          </div>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {spawnPoints.map((spawn, index) => (
              <div key={spawn.id} className="flex items-center gap-2 p-2 bg-neutral-800 rounded-md">
                <div className="flex-1">
                  <div className="text-xs font-medium">
                    Точка {index + 1}
                    {spawn.playerId && (
                      <span className="ml-1 text-emerald-400">
                        (занята)
                      </span>
                    )}
                  </div>
                  <div className="text-xs opacity-70">
                    {Math.round(spawn.x)}, {Math.round(spawn.y)}
                  </div>
                </div>
                
                {/* Назначение игрока */}
                <select
                  value={spawn.playerId || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      assignPlayerToSpawn(spawn.id, e.target.value);
                    }
                  }}
                  className="text-xs bg-neutral-700 border border-neutral-600 rounded px-1 py-0.5"
                >
                  <option value="">Не назначен</option>
                  {playerTokens.map(token => (
                    <option key={token.id} value={token.id}>
                      {token.name}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => removeSpawnPoint(spawn.id)}
                  className="text-red-400 hover:text-red-300 text-xs px-1"
                  title="Удалить точку спавна"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Управление туманом */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-blue-400">Управление туманом</div>
        
        <div className="flex gap-2">
          <button
            onClick={clearAllFog}
            className="px-3 py-1 rounded-md border border-neutral-600 text-xs hover:bg-neutral-700 transition-colors"
          >
            Убрать весь туман
          </button>
          
          <button
            onClick={resetFog}
            className="px-3 py-1 rounded-md border border-neutral-600 text-xs hover:bg-neutral-700 transition-colors"
          >
            Закрыть всё туманом
          </button>
        </div>
      </div>
      
      {/* Управление библиотекой моделей */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-purple-400">3D Модели Meshy.ai</div>
        
        <button
          onClick={() => {
            // Загружаем модели из категории Characters
            console.log('Загрузка D&D персонажей из Meshy.ai');
            // Можно добавить логику массовой загрузки
          }}
          className="w-full px-3 py-2 rounded-md border border-purple-600 text-purple-400 hover:bg-purple-600/10 transition-colors text-sm"
        >
          🎭 Загрузить персонажей D&D
        </button>
        
        <div className="text-xs opacity-60">
          Источник: meshy.ai/tags/dnd?category=Characters
        </div>
      </div>

      {/* Информация */}
      <div className="space-y-1 text-xs opacity-70">
        <div>🔵 Синие точки - свободные точки спавна</div>
        <div>🟢 Зелёные точки - назначенные игрокам</div>
        <div>🌫️ Игроки видят только области вокруг своих токенов</div>
        <div>⚔️ При встрече с монстрами начинается бой</div>
        <div>🎯 Используйте кнопку "Точки спавна" на карте</div>
      </div>
    </div>
  );
};