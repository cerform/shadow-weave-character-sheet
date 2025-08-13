import React, { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';
import { monsterTypes } from '@/data/monsterTypes';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Edit, Heart, Trash2, Settings, Video, Ruler } from 'lucide-react';
import EquipmentManager from './EquipmentManager';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import DraggableToken3D from './DraggableToken3D';
import DraggableMonsterModel from './DraggableMonsterModel';
import { supabase } from '@/integrations/supabase/client';
import { publicModelUrl } from '@/utils/storageUrls';
import { SafeGLTFLoader } from './SafeGLTFLoader';

interface AssetModel {
  id: string;
  storage_path: string; // path in 'models' bucket
  x: number; // map pixel coords (0..1200)
  y: number; // map pixel coords (0..800)
  scale?: number | [number, number, number];
  rotationY?: number; // radians
  animate?: boolean; // idle animation toggle
  controlledBy?: string; // кто управляет (например, 'dm' | 'player1')
  ownerId?: string; // владелец (опционально)
}

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'helmet' | 'boots';
  modelPath?: string;
  stats?: {
    damage?: string;
    ac?: number;
    bonus?: string;
  };
}

interface Simple3DMapProps {
  mapImageUrl?: string;
  tokens?: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    color: string;
    size: number;
    type: string;
    monsterType?: string;
    hp?: number;
    maxHp?: number;
    ac?: number;
    speed?: number;
    controlledBy?: string;
    equipment?: Equipment[];
  }>;
  assetModels?: AssetModel[]; // доп. 3D ассеты из Supabase Storage
  onTokenSelect?: (tokenId: string | null) => void;
  selectedTokenId?: string | null;
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onTokenUpdate?: (tokenId: string, updates: Partial<any>) => void;
  onAssetMove?: (id: string, x: number, y: number) => void;
  onAssetUpdate?: (id: string, updates: Partial<AssetModel>) => void;
  onAssetDelete?: (id: string) => void;
  isDM?: boolean;
  // NEW: визуальная сетка и клик по плоскости (для калибровки)
  showGrid?: boolean;
  gridSizePx?: number; // размер клетки в "пикселях карты" (0..1200 x 0..800)
  onPlaneClick?: (mapX: number, mapY: number) => void;
}

// Компонент плоскости с текстурой карты (интерактивная)
const TexturedPlane: React.FC<{ imageUrl?: string; onClick?: (mapX: number, mapY: number) => void }>
= ({ imageUrl, onClick }) => {
  let texture = null;
  
  try {
    if (imageUrl) {
      texture = useLoader(THREE.TextureLoader, imageUrl);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
    }
  } catch (error) {
    console.warn('Failed to load texture:', error);
  }

  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
      // Позволяем кликом отдавать координаты карты в пикселях (1200x800)
      onClick={(e) => {
        if (!onClick) return;
        const p = e.point; // world coords
        const mapX = Math.max(0, Math.min(1200, ((p.x + 12) / 24) * 1200));
        const mapY = Math.max(0, Math.min(800, ((-p.z + 8) / 16) * 800));
        onClick(mapX, mapY);
      }}
    >
      <planeGeometry args={[24, 16]} />
      <meshStandardMaterial 
        map={texture} 
        color={texture ? '#ffffff' : '#4a5568'}
      />
    </mesh>
  );
};

// Компонент для безопасной загрузки ассетов
const AssetModelNode: React.FC<{ path: string; position: [number, number, number]; scale?: number | [number, number, number]; }>
= ({ path, position, scale }) => {
  const url = useMemo(() => publicModelUrl(path), [path]);
  
  return (
    <SafeGLTFLoader 
      url={url} 
      position={position} 
      scale={scale}
      fallback={
        <mesh position={position} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      }
    />
  );
};

// Перетаскиваемая 3D‑модель ассета (с глобальным drag, как у токенов)
const DraggableAssetModel: React.FC<{ asset: AssetModel; position: [number, number, number]; onMove?: (x: number, y: number) => void; isDM?: boolean; onDragChange?: (dragging: boolean) => void; isSelected?: boolean; onSelect?: () => void; }>
= ({ asset, position, onMove, isDM, onDragChange, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl } = useThree();

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouse = useMemo(() => new THREE.Vector2(), []);

  const canMove = isDM || asset.controlledBy === 'player1';

  // Apply external rotation updates and idle animation
  React.useEffect(() => {
    if (groupRef.current && typeof asset.rotationY === 'number') {
      groupRef.current.rotation.y = asset.rotationY;
    }
  }, [asset.rotationY]);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (asset.animate) {
      groupRef.current.rotation.y += 0.01;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    } else {
      groupRef.current.position.y = position[1];
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect?.();
    if (canMove) {
      setIsDragging(true);
      gl.domElement.style.cursor = 'grabbing';
      try { onDragChange?.(true); } catch {}
    }
  };
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const p = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, p)) {
        const boundedX = Math.max(-12, Math.min(12, p.x));
        const boundedZ = Math.max(-8, Math.min(8, p.z));
        if (groupRef.current) {
          groupRef.current.position.x = boundedX;
          groupRef.current.position.z = boundedZ;
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      gl.domElement.style.cursor = 'default';
      try { onDragChange?.(false); } catch {}
      if (groupRef.current) {
        const newPos = groupRef.current.position;
        const mapX = ((newPos.x + 12) / 24) * 1200;
        const mapY = ((-newPos.z + 8) / 16) * 800;
        const boundedMapX = Math.max(0, Math.min(1200, mapX));
        const boundedMapY = Math.max(0, Math.min(800, mapY));
        onMove?.(boundedMapX, boundedMapY);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, camera, gl.domElement, onMove]);

  return (
    <group ref={groupRef} position={position}>
      {/* Невидимая зона захвата */}
      <mesh
        position={[0, 0.5, 0]}
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerEnter={() => {
          if (canMove) gl.domElement.style.cursor = 'grab';
        }}
        onPointerLeave={() => {
          if (!isDragging) gl.domElement.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <Suspense fallback={<mesh position={[0,0,0]}><cylinderGeometry args={[0.3,0.3,0.6,8]} /><meshStandardMaterial color="#6b7280" /></mesh>}>
        <AssetModelNode path={asset.storage_path} position={[0, 0, 0]} scale={asset.scale} />
      </Suspense>
    </group>
  );
};

// Компонент экипировки для токена
const TokenEquipment: React.FC<{ equipment: Equipment[] }> = ({ equipment }) => {
  return (
    <>
      {equipment.map((item) => {
        const equipmentColor = item.type === 'weapon' ? '#fbbf24' : 
                              item.type === 'armor' ? '#6b7280' : 
                              item.type === 'helmet' ? '#3b82f6' : '#8b5cf6';
        
        const equipmentPosition = getDefaultEquipmentPosition(item.type);
        
        return (
          <group key={item.id} position={[equipmentPosition.x, equipmentPosition.y, equipmentPosition.z]}>
            {getEquipmentGeometry(item.type, equipmentColor)}
          </group>
        );
      })}
    </>
  );
};

// Получение позиции экипировки по умолчанию
const getDefaultEquipmentPosition = (type: string) => {
  switch (type) {
    case 'weapon': return { x: 0.3, y: 0.3, z: 0 };
    case 'armor': return { x: 0, y: 0.1, z: 0 };
    case 'helmet': return { x: 0, y: 0.8, z: 0 };
    case 'boots': return { x: 0, y: -0.2, z: 0 };
    default: return { x: 0, y: 0, z: 0 };
  }
};

// Получение геометрии экипировки
const getEquipmentGeometry = (type: string, color: string) => {
  switch (type) {
    case 'weapon':
      return (
        <mesh>
          <cylinderGeometry args={[0.03, 0.03, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'armor':
      return (
        <mesh>
          <boxGeometry args={[0.6, 0.7, 0.2]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      );
    case 'helmet':
      return (
        <mesh>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case 'boots':
      return (
        <mesh>
          <boxGeometry args={[0.2, 0.15, 0.3]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
};

// Компонент для интерактивного токена
const InteractiveToken3D: React.FC<{
  token: any;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onMove?: (x: number, z: number) => void;
  isDM?: boolean;
}> = ({ token, position, isSelected, isHovered, onSelect, onMove, isDM }) => {
  const meshRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
    if (isDM || token.controlledBy === 'player1') {
      setIsDragging(true);
      document.body.style.cursor = 'grabbing';
    }
  };

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      
      // Выполняем raycast для определения позиции на плоскости
      const intersects = e.intersections;
      if (intersects && intersects.length > 0) {
        const intersection = intersects[0];
        const point = intersection.point;
        
        // Конвертируем 3D координаты обратно в 2D координаты карты
        const mapX = ((point.x + 12) / 24) * 1200;
        const mapY = ((-point.z + 8) / 16) * 800;
        
        // Ограничиваем границами карты
        const boundedX = Math.max(0, Math.min(mapX, 1200));
        const boundedY = Math.max(0, Math.min(mapY, 800));
        
        console.log('🎯 Token dropped at:', { x: boundedX, y: boundedY });
        onMove?.(boundedX, boundedY);
      }
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !onMove) return;
    
    const intersects = e.intersections;
    if (intersects && intersects.length > 0) {
      const intersection = intersects[0];
      const point = intersection.point;
      
      // Обновляем позицию токена в реальном времени
      if (meshRef.current) {
        meshRef.current.position.x = point.x;
        meshRef.current.position.z = point.z;
      }
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {/* Главный токен */}
      <mesh 
        castShadow
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => {
          if (isDM || token.controlledBy === 'player1') {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerLeave={() => {
          if (!isDragging) {
            document.body.style.cursor = 'default';
          }
        }}
      >
        <cylinderGeometry args={[0.4, 0.4, 0.8, 12]} />
        <meshStandardMaterial 
          color={token.color || '#3b82f6'} 
          emissive={isSelected ? '#444444' : '#000000'}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>
      
      {/* Экипировка токена */}
      {token.equipment && token.equipment.length > 0 && (
        <TokenEquipment equipment={token.equipment} />
      )}
      
      {/* Название токена */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {token.name}
      </Text>

      {/* HP бар над токеном */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <group position={[0, 1.6, 0]}>
          {/* Фон HP бара */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          {/* HP бар */}
          <mesh position={[-(1 - (token.hp / token.maxHp)) / 2, 0, 0.02]}>
            <planeGeometry args={[token.hp / token.maxHp, 0.08]} />
            <meshBasicMaterial color={
              token.hp > token.maxHp * 0.5 ? '#22c55e' : 
              token.hp > token.maxHp * 0.25 ? '#eab308' : '#ef4444'
            } />
          </mesh>
          {/* HP текст */}
          <Text
            position={[0, -0.15, 0.03]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {`${token.hp}/${token.maxHp}`}
          </Text>
        </group>
      )}
      
      {/* Тень под токеном */}
      <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Выделение при наведении или выборе */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial 
            color={isSelected ? '#fbbf24' : '#ffffff'} 
            opacity={0.6} 
            transparent 
          />
        </mesh>
      )}
    </group>
  );
};

// Компонент панели управления токеном
const TokenControlPanel: React.FC<{
  token: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}> = ({ token, onUpdate, onClose }) => {
  const [hp, setHp] = useState(token.hp || 0);
  const [maxHp, setMaxHp] = useState(token.maxHp || 0);
  const [ac, setAc] = useState(token.ac || 0);
  const [name, setName] = useState(token.name || '');

  const handleSave = () => {
    onUpdate({ hp, maxHp, ac, name });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Редактировать токен</h3>
      
      <div className="space-y-2">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hp">HP</Label>
          <Input
            id="hp"
            type="number"
            value={hp}
            onChange={(e) => setHp(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxHp">Max HP</Label>
          <Input
            id="maxHp"
            type="number"
            value={maxHp}
            onChange={(e) => setMaxHp(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ac">Armor Class</Label>
        <Input
          id="ac"
          type="number"
          value={ac}
          onChange={(e) => setAc(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Сохранить</Button>
        <Button variant="outline" onClick={onClose}>Отмена</Button>
      </div>
    </div>
  );
};

const Simple3DMap: React.FC<Simple3DMapProps> = ({ 
  mapImageUrl, 
  tokens = [], 
  assetModels = [],
  onTokenSelect,
  selectedTokenId,
  onTokenMove,
  onTokenUpdate,
  onAssetMove,
  onAssetUpdate,
  onAssetDelete,
  isDM = false,
  showGrid = true,
  gridSizePx = 50,
  onPlaneClick,
  ...rest
}) => {
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  console.log('🗺️ Simple3DMap rendering with:', { mapImageUrl, tokensCount: tokens.length });

  const selectedToken = tokens.find(t => t.id === selectedTokenId);
  const selectedAsset = useMemo(() => assetModels.find(a => a.id === selectedAssetId) || null, [assetModels, selectedAssetId]);

  const handleTokenMove = (tokenId: string, mapX: number, mapY: number) => {
    console.log('🏃 Token move in 3D:', { tokenId, mapX, mapY });
    onTokenMove?.(tokenId, mapX, mapY);
  };

  const handleDamage = (amount: number) => {
    if (!selectedToken || !onTokenUpdate) return;
    const newHp = Math.max(0, selectedToken.hp - amount);
    onTokenUpdate(selectedToken.id, { hp: newHp });
  };

  const handleHeal = (amount: number) => {
    if (!selectedToken || !onTokenUpdate) return;
    const newHp = Math.min(selectedToken.maxHp, selectedToken.hp + amount);
    onTokenUpdate(selectedToken.id, { hp: newHp });
  };
  
  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [12, 8, 12], fov: 60 }}
        shadows
      >
        <Suspense fallback={null}>
          {/* Освещение */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Плоскость с текстурой карты */}
          <TexturedPlane imageUrl={mapImageUrl} />

          {/* 3D ассеты из Storage */}
          {assetModels.map((a) => {
            const x = ((a.x || 0) / 1200) * 24 - 12;
            const z = ((a.y || 0) / 800) * 16 - 8;
            return (
              <DraggableAssetModel
                key={a.id}
                asset={a}
                position={[x, 0.2, -z]}
                onMove={(mx, my) => onAssetMove?.(a.id, mx, my)}
                onDragChange={(v) => setIsDraggingAny(v)}
                isSelected={selectedAssetId === a.id}
                onSelect={() => setSelectedAssetId(prev => prev === a.id ? null : a.id)}
                isDM={isDM}
              />
            );
          })}
          
          {/* Токены с правильным позиционированием */}
          {tokens.map((token, index) => {
            // Конвертируем координаты из пикселей в 3D координаты
            const x = ((token.x || 0) / 1200) * 24 - 12;
            const z = ((token.y || 0) / 800) * 16 - 8;
            
            // Добавляем небольшое смещение по Y для предотвращения наложения
            const yOffset = 0.1 + (index * 0.05); // Каждый токен немного выше предыдущего
            
            // Используем перетаскиваемые 3D модели монстров, если тип указан
            if (token.monsterType && monsterTypes[token.monsterType]) {
              return (
                <DraggableMonsterModel
                  key={token.id}
                  token={token}
                  position={[x, yOffset, -z]}
                  isSelected={selectedTokenId === token.id}
                  isHovered={hoveredToken === token.id}
                  onSelect={() => onTokenSelect?.(selectedTokenId === token.id ? null : token.id)}
                  onMove={(mapX, mapY) => handleTokenMove(token.id, mapX, mapY)}
                  isDM={isDM}
                  onDragChange={(v) => setIsDraggingAny(v)}
                />
              );
            }
            
            // Fallback для обычных токенов без монстра
            return (
              <DraggableToken3D
                key={token.id}
                token={token}
                position={[x, yOffset, -z]}
                isSelected={selectedTokenId === token.id}
                onSelect={() => onTokenSelect?.(selectedTokenId === token.id ? null : token.id)}
                onMove={(mapX, mapY) => handleTokenMove(token.id, mapX, mapY)}
                isDM={isDM}
                onDragChange={(v) => setIsDraggingAny(v)}
              />
            );
          })}
          
          {/* Контролы */}
          <OrbitControls 
            enabled={!isDraggingAny}
            enablePan 
            enableZoom 
            enableRotate
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* UI панель управления */}
      {selectedToken && isDM && (
        <div className="absolute top-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg space-y-2 max-w-sm">
          <h4 className="font-bold">{selectedToken.name}</h4>
          <div className="text-sm">HP: {selectedToken.hp}/{selectedToken.maxHp}</div>
          <div className="text-sm">AC: {selectedToken.ac}</div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleDamage(5)}
            >
              <Minus className="w-3 h-3" />
              -5 HP
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleHeal(5)}
            >
              <Plus className="w-3 h-3" />
              +5 HP
            </Button>
          </div>

          {/* Экипировка */}
          <EquipmentManager
            currentEquipment={selectedToken.equipment || []}
            availableEquipment={[
              { id: '1', name: 'Железный меч', type: 'weapon', stats: { damage: '1d8+3' } },
              { id: '2', name: 'Кольчуга', type: 'armor', stats: { ac: 14 } },
              { id: '3', name: 'Щит', type: 'accessory', stats: { ac: 2 } },
              { id: '4', name: 'Шлем рыцаря', type: 'helmet', stats: { ac: 1, bonus: '+1 к Восприятию' } },
              { id: '5', name: 'Быстрые сапоги', type: 'boots', stats: { bonus: '+10 футов скорости' } },
            ]}
            onEquipmentChange={(equipment) => onTokenUpdate?.(selectedToken.id, { equipment })}
          />

          <Dialog open={showTokenEditor} onOpenChange={setShowTokenEditor}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full">
                <Edit className="w-3 h-3 mr-2" />
                Редактировать
              </Button>
            </DialogTrigger>
            <DialogContent>
              <TokenControlPanel
                token={selectedToken}
                onUpdate={(updates) => onTokenUpdate?.(selectedToken.id, updates)}
                onClose={() => setShowTokenEditor(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Панель управления ассетом */}
      {selectedAsset && isDM && (
        <div className="absolute bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg space-y-2">
          <h4 className="font-bold">Ассет</h4>
          <div className="text-xs opacity-80 max-w-[40vw] truncate">{selectedAsset.storage_path}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={() => onAssetDelete?.(selectedAsset.id)}>
              <Trash2 className="w-3 h-3 mr-1" /> Удалить ассет
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simple3DMap;