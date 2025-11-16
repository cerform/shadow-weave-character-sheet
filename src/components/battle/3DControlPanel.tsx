import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Users, 
  Eye, 
  EyeOff, 
  Plus, 
  Settings, 
  Circle,
  Square,
  Triangle,
  Trash2,
  Edit,
  Save
} from 'lucide-react';

interface Token3D {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
  shape: 'cylinder' | 'cube' | 'sphere';
  size: number;
  hp: number;
  maxHp: number;
  type: 'player' | 'monster' | 'npc' | 'boss';
}

interface ControlPanel3DProps {
  tokens: Token3D[];
  onTokenAdd: (token: Omit<Token3D, 'id'>) => void;
  onTokenUpdate: (id: string, updates: Partial<Token3D>) => void;
  onTokenDelete: (id: string) => void;
  fogEnabled: boolean;
  onFogToggle: () => void;
  fogBrushSize: number;
  onFogBrushSizeChange: (size: number) => void;
  gridVisible: boolean;
  onGridToggle: () => void;
}

const ControlPanel3D: React.FC<ControlPanel3DProps> = ({
  tokens,
  onTokenAdd,
  onTokenUpdate,
  onTokenDelete,
  fogEnabled,
  onFogToggle,
  fogBrushSize,
  onFogBrushSizeChange,
  gridVisible,
  onGridToggle
}) => {
  const [newToken, setNewToken] = useState<{
    name: string;
    x: number;
    y: number;
    z: number;
    color: string;
    shape: 'cylinder' | 'cube' | 'sphere';
    size: number;
    hp: number;
    maxHp: number;
    type: 'player' | 'monster' | 'npc' | 'boss';
  }>({
    name: '',
    x: 0,
    y: 0,
    z: 0,
    color: '#ff0000',
    shape: 'cylinder',
    size: 1,
    hp: 10,
    maxHp: 10,
    type: 'monster'
  });
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [editingToken, setEditingToken] = useState<Token3D | null>(null);

  const handleAddToken = () => {
    if (!newToken.name) return;
    
    onTokenAdd(newToken);
    setNewToken({
      name: '',
      x: 0,
      y: 0,
      z: 0,
      color: '#ff0000',
      shape: 'cylinder',
      size: 1,
      hp: 10,
      maxHp: 10,
      type: 'monster'
    });
  };

  const handleEditToken = (token: Token3D) => {
    setEditingToken({ ...token });
  };

  const handleSaveEdit = () => {
    if (!editingToken) return;
    
    onTokenUpdate(editingToken.id, editingToken);
    setEditingToken(null);
  };

  return (
    <div className="absolute left-4 top-20 z-20 w-80">
      <Card className="bg-slate-800/95 border-slate-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Панель управления 3D</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tokens" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="tokens" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Токены
              </TabsTrigger>
              <TabsTrigger value="fog" className="text-xs">
                <Eye className="h-4 w-4 mr-1" />
                Туман
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-4 w-4 mr-1" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="space-y-4 mt-4">
              {/* Добавление токена */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white">Добавить токен</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="token-name" className="text-xs text-slate-300">Имя</Label>
                    <Input
                      id="token-name"
                      value={newToken.name}
                      onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                      placeholder="Имя токена"
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="token-color" className="text-xs text-slate-300">Цвет</Label>
                    <Input
                      id="token-color"
                      type="color"
                      value={newToken.color}
                      onChange={(e) => setNewToken({ ...newToken, color: e.target.value })}
                      className="h-8 w-full bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-slate-300">X</Label>
                    <Input
                      type="number"
                      value={newToken.x}
                      onChange={(e) => setNewToken({ ...newToken, x: Number(e.target.value) })}
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Y</Label>
                    <Input
                      type="number"
                      value={newToken.y}
                      onChange={(e) => setNewToken({ ...newToken, y: Number(e.target.value) })}
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Z</Label>
                    <Input
                      type="number"
                      value={newToken.z}
                      onChange={(e) => setNewToken({ ...newToken, z: Number(e.target.value) })}
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={newToken.shape === 'cylinder' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewToken({ ...newToken, shape: 'cylinder' })}
                    className="h-8"
                  >
                    <Circle className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={newToken.shape === 'cube' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewToken({ ...newToken, shape: 'cube' })}
                    className="h-8"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={newToken.shape === 'sphere' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewToken({ ...newToken, shape: 'sphere' })}
                    className="h-8"
                  >
                    <Triangle className="h-3 w-3" />
                  </Button>
                </div>

                <Button onClick={handleAddToken} className="w-full h-8" disabled={!newToken.name}>
                  <Plus className="h-3 w-3 mr-1" />
                  Добавить токен
                </Button>
              </div>

              {/* Список токенов */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white">Активные токены ({tokens.length})</h3>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {tokens.map((token) => (
                    <div key={token.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="text-xs text-white truncate">{String(token.name || 'Token')}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditToken(token)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTokenDelete(token.id)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fog" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white">Туман войны</Label>
                  <Button
                    variant={fogEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={onFogToggle}
                    className="h-8"
                  >
                    {fogEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {fogEnabled ? 'Вкл' : 'Выкл'}
                  </Button>
                </div>

                {fogEnabled && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-slate-300">Размер кисти: {fogBrushSize}</Label>
                      <Slider
                        value={[fogBrushSize]}
                        onValueChange={(value) => onFogBrushSizeChange(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-1"
                      />
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• Ctrl + клик: очистить туман</p>
                      <p>• Shift + клик: добавить туман</p>
                      <p>• Колесо мыши: изменить размер кисти</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-white">Сетка</Label>
                  <Button
                    variant={gridVisible ? "default" : "outline"}
                    size="sm"
                    onClick={onGridToggle}
                    className="h-8"
                  >
                    {gridVisible ? 'Показать' : 'Скрыть'}
                  </Button>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong>Управление камерой:</strong></p>
                  <p>• Левая кнопка мыши: поворот</p>
                  <p>• Правая кнопка мыши: панорама</p>
                  <p>• Колесо мыши: масштаб</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Модальное окно редактирования токена */}
          {editingToken && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-slate-800 p-4 rounded-lg space-y-3 w-64">
                <h3 className="text-white font-medium">Редактировать токен</h3>
                
                <div>
                  <Label className="text-xs text-slate-300">Имя</Label>
                  <Input
                    value={editingToken.name}
                    onChange={(e) => setEditingToken({ ...editingToken, name: e.target.value })}
                    className="h-8 text-xs bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-slate-300">HP</Label>
                    <Input
                      type="number"
                      value={editingToken.hp}
                      onChange={(e) => setEditingToken({ ...editingToken, hp: Number(e.target.value) })}
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-300">Max HP</Label>
                    <Input
                      type="number"
                      value={editingToken.maxHp}
                      onChange={(e) => setEditingToken({ ...editingToken, maxHp: Number(e.target.value) })}
                      className="h-8 text-xs bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                    <Save className="h-3 w-3 mr-1" />
                    Сохранить
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingToken(null)} 
                    size="sm"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPanel3D;