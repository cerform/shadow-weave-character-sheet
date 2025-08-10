import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';
import { monsterTypes } from '@/data/monsterTypes';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Edit, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DraggableToken3D from './DraggableToken3D';

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
  }>;
  onTokenSelect?: (tokenId: string | null) => void;
  selectedTokenId?: string | null;
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onTokenUpdate?: (tokenId: string, updates: Partial<any>) => void;
  isDM?: boolean;
}

// Компонент плоскости с текстурой карты (интерактивная)
const TexturedPlane: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
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
      // Делаем плоскость интерактивной для получения координат
      onPointerMove={(e) => {
        // Этот обработчик нужен для корректной работы raycasting
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
  onTokenSelect,
  selectedTokenId,
  onTokenMove,
  onTokenUpdate,
  isDM = false
}) => {
  const [hoveredToken, setHoveredToken] = useState<string | null>(null);
  const [showTokenEditor, setShowTokenEditor] = useState(false);
  
  console.log('🗺️ Simple3DMap rendering with:', { mapImageUrl, tokensCount: tokens.length });

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

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
          
          {/* Токены */}
          {tokens.map((token) => {
            // Конвертируем координаты из пикселей в 3D координаты
            const x = ((token.x || 0) / 1200) * 24 - 12;
            const z = ((token.y || 0) / 800) * 16 - 8;
            
            // Всегда используем 3D модели монстров, если тип указан
            if (token.monsterType && monsterTypes[token.monsterType]) {
              return (
                <group key={token.id}>
                  <MonsterModel
                    type={token.monsterType}
                    position={[x, 0.4, -z]}
                    isSelected={selectedTokenId === token.id}
                    isHovered={hoveredToken === token.id}
                    onClick={() => onTokenSelect?.(selectedTokenId === token.id ? null : token.id)}
                  />
                  
                  {/* HP бар над 3D моделью */}
                  {token.hp !== undefined && token.maxHp !== undefined && (
                    <group position={[x, 1.8, -z]}>
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
                  
                  {/* Название токена */}
                  <Text
                    position={[x, 2.2, -z]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="black"
                  >
                    {token.name}
                  </Text>
                </group>
              );
            }
            
            // Fallback для обычных токенов без монстра
            return (
              <DraggableToken3D
                key={token.id}
                token={token}
                position={[x, 0.4, -z]}
                isSelected={selectedTokenId === token.id}
                onSelect={() => onTokenSelect?.(selectedTokenId === token.id ? null : token.id)}
                onMove={(mapX, mapY) => handleTokenMove(token.id, mapX, mapY)}
                isDM={isDM}
              />
            );
          })}
          
          {/* Контролы */}
          <OrbitControls 
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
        <div className="absolute top-4 right-4 bg-slate-800 text-white p-4 rounded-lg shadow-lg space-y-2">
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
    </div>
  );
};

export default Simple3DMap;