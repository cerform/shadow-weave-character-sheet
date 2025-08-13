import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Settings, RotateCcw, Eye, EyeOff, Map, Box as BoxIcon, Sword } from 'lucide-react';
import EquipmentManager from './EquipmentManager';
import { useToast } from '@/hooks/use-toast';
import Token3D from './Token3D';
import SimpleTokenEditor from './SimpleTokenEditor';
import * as THREE from 'three';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'helmet' | 'boots' | 'accessory';
  modelPath?: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

interface Token {
  id: string;
  name: string;
  type: 'player' | 'monster' | 'npc' | 'boss';
  x: number;
  y: number;
  z?: number;
  color: string;
  size: number;
  hp?: number;
  maxHp?: number;
  ac?: number;
  avatar?: string;
  notes?: string;
  conditions?: string[];
  isActive?: boolean;
  controlledBy?: string;
  isVisible?: boolean;
  equipment?: Equipment[];
}

interface BattleMap3DProps {
  isDM?: boolean;
}

const BattleMap3D: React.FC<BattleMap3DProps> = ({ isDM = false }) => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'top'>('orbit');

  // Добавление нового токена
  const addToken = () => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: `Токен ${tokens.length + 1}`,
      type: 'monster',
      x: Math.random() * 400 + 200,
      y: Math.random() * 400 + 200,
      color: '#ef4444',
      size: 1,
      hp: 30,
      maxHp: 30,
      ac: 13,
      isVisible: true
    };
    setTokens(prev => [...prev, newToken]);
    toast({
      title: "Токен добавлен",
      description: `${newToken.name} добавлен на карту`,
    });
  };

  // Добавление набора тестовых токенов
  const addTestTokens = () => {
    const testTokens: Token[] = [
      {
        id: 'player1',
        name: 'Воин',
        type: 'player',
        x: 300,
        y: 300,
        color: '#3b82f6',
        size: 1,
        hp: 120,
        maxHp: 120,
        ac: 18,
        isVisible: true,
        equipment: [
          {
            id: 'sword1',
            name: 'Длинный меч',
            type: 'weapon',
            position: { x: 0.5, y: 0.5, z: 0 },
            scale: { x: 0.3, y: 0.3, z: 0.3 }
          },
          {
            id: 'armor1',
            name: 'Кольчуга',
            type: 'armor',
            position: { x: 0, y: 0.2, z: 0 },
            scale: { x: 0.8, y: 0.8, z: 0.8 }
          }
        ]
      },
      {
        id: 'player2',
        name: 'Маг',
        type: 'player',
        x: 350,
        y: 300,
        color: '#8b5cf6',
        size: 1,
        hp: 80,
        maxHp: 80,
        ac: 12,
        isVisible: true,
        equipment: [
          {
            id: 'staff1',
            name: 'Посох мага',
            type: 'weapon',
            position: { x: -0.5, y: 0.8, z: 0 },
            scale: { x: 0.2, y: 0.5, z: 0.2 }
          },
          {
            id: 'robes1',
            name: 'Мантия мага',
            type: 'armor',
            position: { x: 0, y: 0.3, z: 0 },
            scale: { x: 0.9, y: 0.9, z: 0.9 }
          }
        ]
      },
      {
        id: 'monster1',
        name: 'Орк Воин',
        type: 'monster',
        x: 500,
        y: 400,
        color: '#ef4444',
        size: 1,
        hp: 45,
        maxHp: 45,
        ac: 13,
        isVisible: true
      },
      {
        id: 'boss1',
        name: 'Древний Дракон',
        type: 'boss',
        x: 600,
        y: 500,
        color: '#dc2626',
        size: 2,
        hp: 350,
        maxHp: 350,
        ac: 22,
        isVisible: true
      }
    ];
    setTokens(prev => [...prev, ...testTokens]);
    toast({
      title: "Тестовые токены добавлены",
      description: "Добавлено 4 тестовых токена",
    });
  };

  // Обработка клика по токену
  const handleTokenClick = (token: Token) => {
    if (isDM) {
      setSelectedToken(token);
      setEditingToken(token);
    }
  };

  // Обработка перемещения токена
  const handleTokenMove = (tokenId: string, newPosition: { x: number; y: number; z?: number }) => {
    setTokens(prev => 
      prev.map(token => 
        token.id === tokenId 
          ? { ...token, x: newPosition.x, y: newPosition.y, z: newPosition.z || 0 }
          : token
      )
    );
  };

  // Обработка изменения экипировки
  const handleEquipmentChange = (tokenId: string, newEquipment: Equipment[]) => {
    setTokens(prev => 
      prev.map(token => 
        token.id === tokenId 
          ? { ...token, equipment: newEquipment }
          : token
      )
    );
    toast({
      title: "Экипировка обновлена",
      description: "Экипировка персонажа успешно изменена",
    });
  };

  // Сохранение изменений токена
  const handleSaveToken = (updatedToken: Token) => {
    setTokens(prev => 
      prev.map(token => 
        token.id === updatedToken.id ? updatedToken : token
      )
    );
    setEditingToken(null);
    setSelectedToken(null);
    toast({
      title: "Токен обновлен",
      description: `${updatedToken.name} успешно обновлен`,
    });
  };

  // Удаление токена
  const handleDeleteToken = (tokenId: string) => {
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    setEditingToken(null);
    setSelectedToken(null);
    toast({
      title: "Токен удален",
      description: "Токен успешно удален с карты",
    });
  };

  // Очистка карты
  const clearTokens = () => {
    setTokens([]);
    setSelectedToken(null);
    setEditingToken(null);
    toast({
      title: "Карта очищена",
      description: "Все токены удалены с карты",
    });
  };

  // 3D Сцена
  const Scene3D = () => (
    <Canvas shadows>
      {/* Камера */}
      <PerspectiveCamera 
        makeDefault 
        position={cameraMode === 'top' ? [0, 20, 0] : [10, 10, 10]} 
        fov={60}
      />
      
      {/* Освещение */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />

      {/* Окружение */}
      {showEnvironment && (
        <Environment preset="sunset" background />
      )}

      {/* Сетка */}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4edd"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}

      {/* Основание карты */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#2a2a2a" opacity={0.8} transparent />
      </mesh>

      {/* Токены */}
      {tokens.map(token => (
        <Token3D
          key={token.id}
          token={{
            ...token,
            position: { x: token.x, y: token.y, z: token.z || 0 }
          }}
          onClick={() => handleTokenClick(token)}
          onMove={(newPosition) => handleTokenMove(token.id, newPosition)}
          isDM={isDM}
          isSelected={selectedToken?.id === token.id}
          isHovered={hoveredTokenId === token.id}
        />
      ))}

      {/* Контролы камеры */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={cameraMode === 'orbit'}
        maxPolarAngle={cameraMode === 'top' ? 0 : Math.PI / 2}
        minDistance={5}
        maxDistance={50}
      />
    </Canvas>
  );

  return (
    <div className="h-full w-full relative">
      {/* Панель управления */}
      <Card className="absolute top-4 left-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <BoxIcon className="h-4 w-4" />
            3D Боевая карта
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Кнопки действий */}
          {isDM && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={addToken}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Токен
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={addTestTokens}
                className="border-slate-600 text-slate-300"
              >
                Тест
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={clearTokens}
                className="border-slate-600 text-slate-300"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Настройки отображения */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Сетка</Label>
              <Switch 
                checked={showGrid} 
                onCheckedChange={setShowGrid}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Окружение</Label>
              <Switch 
                checked={showEnvironment} 
                onCheckedChange={setShowEnvironment}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 text-xs">Вид сверху</Label>
              <Switch 
                checked={cameraMode === 'top'} 
                onCheckedChange={(checked) => setCameraMode(checked ? 'top' : 'orbit')}
              />
            </div>
          </div>

          {/* Информация о выбранном токене */}
          {selectedToken && (
            <div className="mt-3 p-2 bg-slate-700/50 rounded border border-slate-600">
              <p className="text-white text-xs font-semibold">{selectedToken.name}</p>
              <p className="text-slate-300 text-xs">
                {selectedToken.hp}/{selectedToken.maxHp} HP | AC {selectedToken.ac}
              </p>
              <Badge 
                variant="secondary" 
                className="text-xs mt-1"
                style={{ backgroundColor: selectedToken.color }}
              >
                {selectedToken.type}
              </Badge>
              
              {/* Управление экипировкой для игроков */}
              {isDM && selectedToken.type === 'player' && (
                <div className="mt-2">
                  <EquipmentManager
                    currentEquipment={selectedToken.equipment || []}
                    availableEquipment={[
                      { id: 'sword', name: 'Меч', type: 'weapon', stats: { damage: '1d8+3' } },
                      { id: 'shield', name: 'Щит', type: 'armor', stats: { ac: 2 } },
                      { id: 'helmet', name: 'Шлем', type: 'helmet', stats: { ac: 1 } },
                      { id: 'boots', name: 'Сапоги', type: 'boots', stats: { bonus: 'Скорость +5' } },
                      { id: 'ring', name: 'Кольцо силы', type: 'accessory', stats: { bonus: 'Сила +1' } }
                    ]}
                    onEquipmentChange={(equipment) => handleEquipmentChange(selectedToken.id, equipment)}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика */}
      <Card className="absolute top-4 right-4 z-10 bg-slate-800/90 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="text-white text-sm">
            <p>Токенов: {tokens.length}</p>
            <p>Игроков: {tokens.filter(t => t.type === 'player').length}</p>
            <p>Монстров: {tokens.filter(t => t.type === 'monster').length}</p>
            <p>Боссов: {tokens.filter(t => t.type === 'boss').length}</p>
          </div>
        </CardContent>
      </Card>

      {/* 3D Сцена */}
      <div className="w-full h-full">
        <Scene3D />
      </div>

      {/* Редактор токена */}
      {editingToken && (
        <SimpleTokenEditor
          token={{
            ...editingToken,
            type: editingToken.type === 'boss' ? 'monster' : editingToken.type
          }}
          onSave={handleSaveToken}
          onDelete={() => handleDeleteToken(editingToken.id)}
          onCancel={() => {
            setEditingToken(null);
            setSelectedToken(null);
          }}
        />
      )}
    </div>
  );
};

export default BattleMap3D;