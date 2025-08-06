// src/components/battle/3DMapScene.tsx

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { Vector3 } from 'three';
import FogOfWarLayer from './FogOfWarLayer';
import Token3D from './Token3D';
import ControlPanel3D from './3DControlPanel';

interface MapPlaneProps {
  textureUrl: string;
  width: number;
  height: number;
  gridSize: number;
}

const MapPlane: React.FC<MapPlaneProps> = ({ textureUrl, width, height }) => {
  const texture = useTexture(textureUrl);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const LightSetup = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
      />
    </>
  );
};

const GridHelperPlane: React.FC<{ width: number; height: number; size: number }> = ({
  width,
  height,
  size,
}) => {
  // Создаем простую сетку с помощью gridHelper или линий
  return (
    <group>
      {/* Используем встроенный gridHelper */}
      <gridHelper 
        args={[Math.max(width, height), Math.max(width, height) / size]} 
        position={[0, 0.01, 0]}
      />
    </group>
  );
};

interface Token3DType {
  id: string;
  name: string;
  type: 'player' | 'monster' | 'npc' | 'boss';
  color: string;
  position: { x: number; y: number; z?: number };
  hp?: number;
  maxHp?: number;
  size: number;
  avatar?: string;
}

interface MapSceneProps {
  imageUrl: string;
  gridSize?: number;
  gridWidth?: number;
  gridHeight?: number;
  isDM?: boolean;
}

const MapScene: React.FC<MapSceneProps> = ({
  imageUrl,
  gridSize = 1,
  gridWidth = 24,
  gridHeight = 20,
  isDM = false,
}) => {
  const width = gridWidth * gridSize;
  const height = gridHeight * gridSize;
  
  // Состояние для токенов
  const [tokens, setTokens] = useState<Token3DType[]>([
    {
      id: '1',
      name: 'Goblin Scout',
      type: 'monster',
      color: '#dc2626',
      position: { x: 100, y: 100, z: 0 },
      hp: 7,
      maxHp: 12,
      size: 1
    },
    {
      id: '2', 
      name: 'Sir Gareth',
      type: 'player',
      color: '#2563eb',
      position: { x: 150, y: 400, z: 0 },
      hp: 22,
      maxHp: 30,
      size: 1
    },
    {
      id: '3',
      name: 'Lyralei',
      type: 'player', 
      color: '#7c3aed',
      position: { x: 100, y: 450, z: 0 },
      hp: 18,
      maxHp: 18,
      size: 1
    }
  ]);

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [fogEnabled, setFogEnabled] = useState(true);
  const [fogBrushSize, setFogBrushSize] = useState(3);
  const [gridVisible, setGridVisible] = useState(true);

  const handleTokenAdd = (newToken: Omit<Token3DType, 'id'>) => {
    const token: Token3DType = {
      ...newToken,
      id: Date.now().toString(),
      type: newToken.type || 'monster',
      size: newToken.size || 1
    };
    setTokens(prev => [...prev, token]);
  };

  const handleTokenUpdate = (id: string, updates: Partial<Token3DType>) => {
    setTokens(prev => prev.map(token => 
      token.id === id ? { ...token, ...updates } : token
    ));
  };

  const handleTokenDelete = (id: string) => {
    setTokens(prev => prev.filter(token => token.id !== id));
    if (selectedTokenId === id) {
      setSelectedTokenId(null);
    }
  };

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 30, 30], fov: 50 }}
        style={{ width: '100%', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <MapPlane textureUrl={imageUrl} width={width} height={height} gridSize={gridSize} />
          {gridVisible && (
            <GridHelperPlane width={width} height={height} size={gridSize} />
          )}
          {fogEnabled && (
            <FogOfWarLayer
              width={width}
              height={height}
              resolution={256}
              isDM={isDM}
              revealBrushSize={fogBrushSize}
            />
          )}
          {/* Рендер токенов */}
          {tokens.map((token) => (
            <Token3D
              key={token.id}
              token={token}
              onClick={() => setSelectedTokenId(token.id)}
              isDM={isDM}
              isSelected={selectedTokenId === token.id}
            />
          ))}
        </Suspense>
        <LightSetup />
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>

      {/* Панель управления */}
      {isDM && (
        <ControlPanel3D
          tokens={tokens.map(token => ({
            id: token.id,
            name: token.name,
            x: token.position.x,
            y: token.position.y,
            z: token.position.z || 0,
            color: token.color,
            shape: 'cylinder', // По умолчанию
            size: token.size,
            hp: token.hp || 10,
            maxHp: token.maxHp || 10,
            type: token.type
          }))}
          onTokenAdd={(newToken) => handleTokenAdd({
            name: newToken.name,
            type: newToken.type,
            color: newToken.color,
            position: { x: newToken.x, y: newToken.y, z: newToken.z },
            hp: newToken.hp,
            maxHp: newToken.maxHp,
            size: newToken.size
          })}
          onTokenUpdate={(id, updates) => {
            if (updates.x !== undefined || updates.y !== undefined || updates.z !== undefined) {
              handleTokenUpdate(id, {
                position: {
                  x: updates.x || tokens.find(t => t.id === id)?.position.x || 0,
                  y: updates.y || tokens.find(t => t.id === id)?.position.y || 0,
                  z: updates.z || tokens.find(t => t.id === id)?.position.z || 0
                }
              });
            }
            if (updates.hp !== undefined) handleTokenUpdate(id, { hp: updates.hp });
            if (updates.maxHp !== undefined) handleTokenUpdate(id, { maxHp: updates.maxHp });
            if (updates.name !== undefined) handleTokenUpdate(id, { name: updates.name });
          }}
          onTokenDelete={handleTokenDelete}
          fogEnabled={fogEnabled}
          onFogToggle={() => setFogEnabled(!fogEnabled)}
          fogBrushSize={fogBrushSize}
          onFogBrushSizeChange={setFogBrushSize}
          gridVisible={gridVisible}
          onGridToggle={() => setGridVisible(!gridVisible)}
        />
      )}
    </>
  );
};

export default MapScene;