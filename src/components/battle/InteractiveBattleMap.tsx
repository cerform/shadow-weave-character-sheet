import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Image as KonvaImage, Text } from 'react-konva';
import useImage from 'use-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Download, Upload } from 'lucide-react';
import SimpleTokenEditor from './SimpleTokenEditor';

const GRID_SIZE = 64; // Размер одной клетки в пикселях
const ROWS = 12;
const COLS = 16;

export interface Token {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
  ac?: number;
  speed?: number;
  controlledBy?: string;
  tags?: string[];
  notes?: string;
}

interface InteractiveBattleMapProps {
  isDM?: boolean;
}

const InteractiveBattleMap: React.FC<InteractiveBattleMapProps> = ({ isDM = false }) => {
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 'demo_goblin',
      name: 'Goblin Scout',
      x: GRID_SIZE * 3,
      y: GRID_SIZE * 2,
      color: '#ff4444',
      size: GRID_SIZE,
      type: 'monster',
      hp: 7,
      maxHp: 7,
      ac: 15,
      speed: 30,
      controlledBy: 'DM',
      tags: ['humanoid', 'goblinoid']
    },
    {
      id: 'demo_player',
      name: 'Adventurer',
      x: GRID_SIZE * 1,
      y: GRID_SIZE * 1,
      color: '#4444ff',
      size: GRID_SIZE,
      type: 'player',
      hp: 25,
      maxHp: 25,
      ac: 18,
      speed: 30,
      controlledBy: 'Player',
      tags: ['human', 'fighter']
    }
  ]);

  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleTokenDrag = (id: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    
    setTokens(prev => prev.map(token => 
      token.id === id ? { ...token, x: snappedX, y: snappedY } : token
    ));
  };

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    if (isDM) {
      setEditingToken(token);
    }
  };

  const handleAddToken = () => {
    const newToken: Token = {
      id: `token_${Date.now()}`,
      name: 'New Token',
      x: GRID_SIZE * 2,
      y: GRID_SIZE * 2,
      color: '#888888',
      size: GRID_SIZE,
      type: 'npc',
      hp: 10,
      maxHp: 10,
      ac: 12,
      speed: 30,
      controlledBy: 'DM',
      tags: []
    };
    setTokens(prev => [...prev, newToken]);
  };

  const handleSaveToken = (updatedToken: Token) => {
    setTokens(prev => prev.map(token => 
      token.id === updatedToken.id ? updatedToken : token
    ));
    setEditingToken(null);
  };

  const handleDeleteToken = (id: string) => {
    setTokens(prev => prev.filter(token => token.id !== id));
    setEditingToken(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex h-screen">
        {/* Левая панель с инструментами */}
        {isDM && (
          <div className="w-80 bg-slate-800 border-r border-slate-700 p-4 space-y-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleAddToken}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Token
                </Button>
                
                <Button 
                  onClick={() => setShowGrid(!showGrid)}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Upload className="w-4 h-4 mr-1" />
                    Load
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Список токенов */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Tokens ({tokens.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {tokens.map(token => (
                  <div 
                    key={token.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      selectedToken?.id === token.id 
                        ? 'bg-slate-600 border-blue-500' 
                        : 'bg-slate-800 border-slate-600 hover:bg-slate-600'
                    }`}
                    onClick={() => handleTokenClick(token)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-sm font-medium text-white">{token.name}</span>
                      </div>
                      <span className="text-xs text-slate-400 capitalize">{token.type}</span>
                    </div>
                    {token.hp !== undefined && (
                      <div className="mt-2 text-xs text-slate-300">
                        HP: {token.hp}/{token.maxHp} • AC: {token.ac}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Область карты */}
        <div className="flex-1 overflow-auto bg-slate-800 p-4">
          <div className="border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
            <Stage width={COLS * GRID_SIZE} height={ROWS * GRID_SIZE}>
              <Layer>
                {/* Фон карты */}
                <Rect
                  x={0}
                  y={0}
                  width={COLS * GRID_SIZE}
                  height={ROWS * GRID_SIZE}
                  fill="#1e293b"
                />

                {/* Сетка */}
                {showGrid && (
                  <>
                    {Array.from({ length: COLS + 1 }).map((_, i) => (
                      <Rect
                        key={`v-${i}`}
                        x={i * GRID_SIZE}
                        y={0}
                        width={1}
                        height={ROWS * GRID_SIZE}
                        fill="rgba(148, 163, 184, 0.2)"
                      />
                    ))}
                    {Array.from({ length: ROWS + 1 }).map((_, j) => (
                      <Rect
                        key={`h-${j}`}
                        x={0}
                        y={j * GRID_SIZE}
                        width={COLS * GRID_SIZE}
                        height={1}
                        fill="rgba(148, 163, 184, 0.2)"
                      />
                    ))}
                  </>
                )}

                {/* Токены */}
                {tokens.map(token => (
                  <TokenComponent
                    key={token.id}
                    token={token}
                    isSelected={selectedToken?.id === token.id}
                    onDragEnd={(x, y) => handleTokenDrag(token.id, x, y)}
                    onClick={() => handleTokenClick(token)}
                    isDraggable={isDM}
                  />
                ))}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>

      {/* Редактор токена */}
      {editingToken && (
        <SimpleTokenEditor
          token={editingToken}
          onSave={handleSaveToken}
          onDelete={() => handleDeleteToken(editingToken.id)}
          onCancel={() => setEditingToken(null)}
        />
      )}
    </div>
  );
};

// Компонент отдельного токена
interface TokenComponentProps {
  token: Token;
  isSelected: boolean;
  onDragEnd: (x: number, y: number) => void;
  onClick: () => void;
  isDraggable: boolean;
}

const TokenComponent: React.FC<TokenComponentProps> = ({ 
  token, 
  isSelected, 
  onDragEnd, 
  onClick, 
  isDraggable 
}) => {
  const [image] = useImage(token.avatar || '');
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return '#3b82f6';
      case 'monster': return '#ef4444'; 
      case 'npc': return '#10b981';
      default: return '#6b7280';
    }
  };

  const borderColor = isSelected ? '#fbbf24' : getTypeColor(token.type);
  const borderWidth = isSelected ? 3 : 2;

  return (
    <>
      {/* Основной токен */}
      {token.avatar && image ? (
        <KonvaImage
          image={image}
          x={token.x}
          y={token.y}
          width={token.size}
          height={token.size}
          draggable={isDraggable}
          onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
          onClick={onClick}
          stroke={borderColor}
          strokeWidth={borderWidth}
          cornerRadius={8}
        />
      ) : (
        <Circle
          x={token.x + token.size / 2}
          y={token.y + token.size / 2}
          radius={token.size / 2 - 4}
          fill={token.color}
          stroke={borderColor}
          strokeWidth={borderWidth}
          draggable={isDraggable}
          onDragEnd={(e) => onDragEnd(e.target.x() - token.size / 2, e.target.y() - token.size / 2)}
          onClick={onClick}
        />
      )}

      {/* Имя токена */}
      <Text
        x={token.x}
        y={token.y + token.size + 4}
        text={token.name}
        fontSize={12}
        fill="white"
        width={token.size}
        align="center"
        fontFamily="Arial"
      />

      {/* HP Bar */}
      {token.hp !== undefined && token.maxHp !== undefined && (
        <>
          {/* Фон HP бара */}
          <Rect
            x={token.x + 4}
            y={token.y - 12}
            width={token.size - 8}
            height={8}
            fill="#334155"
            cornerRadius={2}
          />
          {/* HP бар */}
          <Rect
            x={token.x + 4}
            y={token.y - 12}
            width={(token.size - 8) * (token.hp / token.maxHp)}
            height={8}
            fill={token.hp / token.maxHp > 0.5 ? '#10b981' : token.hp / token.maxHp > 0.25 ? '#f59e0b' : '#ef4444'}
            cornerRadius={2}
          />
          {/* HP текст */}
          <Text
            x={token.x}
            y={token.y - 10}
            text={`${token.hp}/${token.maxHp}`}
            fontSize={10}
            fill="white"
            width={token.size}
            align="center"
            fontFamily="Arial"
          />
        </>
      )}
    </>
  );
};

export default InteractiveBattleMap;