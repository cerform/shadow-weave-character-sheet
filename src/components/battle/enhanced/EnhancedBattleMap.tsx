import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAssetEquipStore } from '@/stores/assetEquipStore';
import { CharacterManager } from '@/utils/CharacterManager';
import { useCharacterPicking } from '@/hooks/useCharacterPicking';
import { Enhanced3DModel } from './Enhanced3DModel';
import { MovementGrid } from './MovementGrid';
import { FogOfWarCanvas } from './FogOfWarCanvas';
import { FogBrushCursor } from './FogBrushCursor';
import { TokenContextMenu } from './TokenContextMenu';
import { TokenUI } from './TokenUI';
import { determineMonsterType } from '@/utils/tokenModelMapping';
import { publicModelUrl } from '@/utils/storageUrls';
import { useTexture } from '@react-three/drei';

// Component for handling asset loading and character management
function SceneContent() {
  const { scene, camera, gl } = useThree();
  const managerRef = useRef<CharacterManager>();
  const { queue, processNext, setProcessing } = useAssetEquipStore();
  const { 
    selectToken, 
    hideContextMenu, 
    tokens, 
    setTokens,
    updateToken 
  } = useEnhancedBattleStore();
  const loader = useMemo(() => new GLTFLoader(), []);

  // Initialize character manager
  if (!managerRef.current) {
    managerRef.current = new CharacterManager(scene);
  }

  const { pickFromPointer } = useCharacterPicking(scene, managerRef.current);

  // Process asset queue
  useEffect(() => {
    if (queue.length === 0) return;

    const processAssets = async () => {
      setProcessing(true);
      const item = processNext();
      if (!item) {
        setProcessing(false);
        return;
      }

      try {
        const gltf = await loader.loadAsync(item.url);
        const model = gltf.scene;

        if (item.type === 'character') {
          const manager = managerRef.current!;
          
          // Replace existing character model with new 3D model
          const existingHandle = manager.getHandle(item.id);
          if (existingHandle) {
            // Remove the old base model but keep the group and position
            const oldPosition = existingHandle.group.position.clone();
            existingHandle.group.remove(existingHandle.baseModel);
            
            // Mark new model as character part
            model.traverse((obj: any) => {
              obj.userData.kind = "char";
              obj.userData.characterId = item.id;
            });
            
            existingHandle.baseModel = model;
            existingHandle.group.add(model);
            existingHandle.group.position.copy(oldPosition);
            console.log(`🔄 Replaced base model for character ${item.id}`);
          } else {
            // Create new character
            const handle = manager.addCharacter(item.id, model);
            const existingToken = tokens.find(t => t.id === item.id);
            if (existingToken) {
              handle.group.position.set(...existingToken.position);
            } else if (item.offset) {
              handle.group.position.set(...item.offset);
            }
            console.log(`✨ Created new character ${item.id}`);
          }
          
        } else if (item.type === 'equipment' && item.targetCharId && item.slot) {
          const manager = managerRef.current!;
          const targetHandle = manager.getHandle(item.targetCharId);
          
          if (!targetHandle) {
            console.error(`❌ Target character ${item.targetCharId} not found for equipment`);
            return;
          }
          
          try {
            // CRITICAL: Equipment is never added to scene directly, only to character
            await manager.equipToSlot(
              item.targetCharId,
              item.slot,
              model,
              {
                boneName: item.boneName,
                offset: item.offset ? new THREE.Vector3(...item.offset) : undefined,
                rotation: item.rotation ? new THREE.Euler(...item.rotation) : undefined,
                scale: item.scale || 1,
                cloneAsset: true
              }
            );
            console.log(`⚔️ Equipped ${item.slot} to character ${item.targetCharId}`);
          } catch (error) {
            console.error(`❌ Failed to equip ${item.slot}:`, error);
          }
        }
      } catch (error) {
        console.error('Failed to load asset:', error);
      }

      setProcessing(false);
    };

    processAssets();
  }, [queue, processNext, setProcessing, loader, tokens, updateToken]);

  // Handle character selection
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const characterId = pickFromPointer(event, camera);
      if (characterId) {
        selectToken(characterId);
      } else {
        hideContextMenu();
      }
    };

    gl.domElement.addEventListener('mousedown', handleClick);
    return () => gl.domElement.removeEventListener('mousedown', handleClick);
  }, [pickFromPointer, camera, gl, selectToken, hideContextMenu]);

  return null;
}

// Компонент для отображения карты как текстуры
const MapPlane: React.FC<{ mapUrl: string }> = ({ mapUrl }) => {
  const texture = useTexture(mapUrl);
  
  return (
    <mesh
      receiveShadow
      position={[0, -0.15, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} transparent opacity={0.9} />
    </mesh>
  );
};

interface EnhancedBattleMapProps {
  mapUrl?: string;
}

export const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({ mapUrl }) => {
  const {
    tokens,
    activeId,
    selectedTokenId,
    showMovementGrid,
    hideContextMenu,
    fogEnabled,
    fogEditMode,
    toggleFog,
    setFogEditMode,
    clearFog,
  } = useEnhancedBattleStore();

  // Only show visible tokens
  const visibleTokens = tokens.filter(token => token.isVisible !== false);
  const activeToken = tokens.find(token => token.id === activeId);
  const selectedToken = tokens.find(token => token.id === selectedTokenId);

  // Movement grid target (active token or selected token)
  const movementTarget = activeToken || selectedToken;

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden">
      {/* 3D Scene Container */}
      <div className="w-full h-full relative">
        {/* 3D Scene */}
        <Canvas
          shadows
          camera={{ position: [10, 12, 10], fov: 50 }}
          onClick={() => hideContextMenu()}
          onPointerMissed={() => hideContextMenu()}
        >
          <SceneContent />
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

          {/* Ground plane with map texture or default color */}
          {mapUrl ? (
            <React.Suspense fallback={
              <mesh
                receiveShadow
                position={[0, -0.15, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#1e293b" transparent opacity={0.8} />
              </mesh>
            }>
              <MapPlane mapUrl={mapUrl} />
            </React.Suspense>
          ) : (
            <mesh
              receiveShadow
              position={[0, -0.15, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#1e293b" transparent opacity={0.8} />
            </mesh>
          )}

          {/* Movement grid */}
          {movementTarget && showMovementGrid && (
            <MovementGrid
              center={movementTarget.position}
              radius={6}
              visible={showMovementGrid}
            />
          )}

          {/* Enhanced 3D Tokens */}
        {visibleTokens.map((token) => {
          // Для токенов используем modelUrl если есть, иначе генерируем по типу
          let modelUrl: string | undefined;
          
          if (token.modelUrl) {
            // Используем modelUrl из токена (из библиотеки ассетов)
            modelUrl = token.modelUrl;
          } else {
            // Генерируем URL по типу монстра
            const monsterType = determineMonsterType(token.name);
            // Используем более простую структуру путей
            modelUrl = publicModelUrl(`models/${monsterType}/model.glb`);
          }
          
          console.log(`🎭 Rendering token ${token.name} with modelUrl:`, modelUrl);

          return (
            <Enhanced3DModel
              key={token.id}
              token={token}
              modelUrl={modelUrl}
            />
          );
        })}

          {/* Token UI overlays */}
          {visibleTokens.map((token) => (
            <TokenUI 
              key={`ui-${token.id}`} 
              tokenId={token.id} 
              position={token.position} 
            />
          ))}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.1}
            target={activeToken ? activeToken.position : [0, 0, 0]}
          />
        </Canvas>

        {/* Fog of War overlay - ограничен только областью Canvas */}
        <FogOfWarCanvas />
      </div>
      
      {/* Fog brush cursor */}
      <div className="z-50">
        <FogBrushCursor />
      </div>

      {/* Context menu */}
      <div className="z-50">
        <TokenContextMenu />
      </div>

      {/* Battle info overlay */}
      <div className="absolute top-4 left-4 z-50 space-y-2">{/* z-50 чтобы быть выше тумана */}
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

      {/* Status indicators and controls */}
      <div className="absolute bottom-4 left-4 z-50 space-y-2">{/* z-50 чтобы быть выше тумана */}
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
        
        {/* Fog of War controls */}
        <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => {
                console.log('🌫️ Toggling fog:', !fogEnabled);
                toggleFog();
              }}
              className={`px-2 py-1 rounded text-xs ${
                fogEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {fogEnabled ? '🌫️ Туман ВКЛ' : '🌫️ Туман ВЫКЛ'}
            </button>
            {fogEnabled && (
              <>
                <button
                  onClick={() => {
                    console.log('🌫️ Toggling edit mode:', !fogEditMode);
                    setFogEditMode(!fogEditMode);
                  }}
                  className={`px-2 py-1 rounded text-xs ${
                    fogEditMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {fogEditMode ? '🖌️ Редактирование' : '🗺️ Просмотр'}
                </button>
                <button
                  onClick={() => {
                    console.log('🌫️ Clearing fog');
                    clearFog();
                    // Принудительно очищаем canvas
                    const canvas = document.querySelector('canvas[style*="z-index: 10"]') as HTMLCanvasElement;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }
                    }
                  }}
                  className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700"
                >
                  🧹 Очистить
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};