import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { EnhancedToken3D } from './EnhancedToken3D';
import { MovementGrid } from './MovementGrid';
import { FogOfWarCanvas } from './FogOfWarCanvas';
import { FogBrushCursor } from './FogBrushCursor';
import { TokenContextMenu } from './TokenContextMenu';

export const EnhancedBattleMap: React.FC = () => {
  const {
    tokens,
    activeId,
    selectedTokenId,
    showMovementGrid,
    hideContextMenu,
  } = useEnhancedBattleStore();

  // Only show visible tokens
  const visibleTokens = tokens.filter(token => token.isVisible !== false);
  const activeToken = tokens.find(token => token.id === activeId);
  const selectedToken = tokens.find(token => token.id === selectedTokenId);

  // Movement grid target (active token or selected token)
  const movementTarget = activeToken || selectedToken;

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [10, 12, 10], fov: 50 }}
        onClick={() => hideContextMenu()}
        onPointerMissed={() => hideContextMenu()}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        {/* Environment */}
        <Environment preset="warehouse" />

        {/* Ground grid */}
        <Grid
          position={[0, -0.1, 0]}
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#64748b"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#94a3b8"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        {/* Ground plane for shadows */}
        <mesh
          receiveShadow
          position={[0, -0.15, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1e293b" transparent opacity={0.8} />
        </mesh>

        {/* Movement grid */}
        {movementTarget && showMovementGrid && (
          <MovementGrid
            center={movementTarget.position}
            radius={6}
            visible={showMovementGrid}
          />
        )}

        {/* Tokens */}
        {visibleTokens.map((token) => (
          <EnhancedToken3D key={token.id} token={token} />
        ))}

        {/* Camera controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          target={activeToken ? activeToken.position : [0, 0, 0]}
        />
      </Canvas>

      {/* Fog of War overlay */}
      <FogOfWarCanvas />
      
      {/* Fog brush cursor */}
      <FogBrushCursor />

      {/* Context menu */}
      <TokenContextMenu />

      {/* Battle info overlay */}
      <div className="absolute top-4 left-4 z-30 space-y-2">
        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white">
          <h2 className="text-lg font-bold text-amber-400">
            Боевая карта
          </h2>
          <div className="text-sm text-slate-300">
            Токенов на поле: {visibleTokens.length}
          </div>
          {activeToken && (
            <div className="text-sm text-green-400">
              Активный: {activeToken.name}
            </div>
          )}
        </div>

        {/* Controls hint */}
        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white">
          <div className="text-xs text-slate-300 space-y-1">
            <div>🖱️ ЛКМ - выбрать токен</div>
            <div>🖱️ ПКМ - контекстное меню</div>
            <div>🎱 Колесо - приближение</div>
            <div>🖌️ Shift - открыть туман</div>
            <div>🧽 Alt - скрыть туман</div>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Бой активен</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Синхронизация ВКЛ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};