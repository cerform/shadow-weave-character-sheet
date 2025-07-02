
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BattleToken } from '@/services/socket';
import { Plus, Trash2, Edit, Users, Skull, User } from 'lucide-react';

interface TokenManagerProps {
  tokens: BattleToken[];
  selectedTokenId: string | null;
  onTokenUpdate: (tokenId: string, updates: Partial<BattleToken>) => void;
  onTokenDelete: (tokenId: string) => void;
  onTokenAdd: (token: Omit<BattleToken, 'id'>) => void;
  onTokenSelect: (tokenId: string | null) => void;
}

const TokenManager: React.FC<TokenManagerProps> = ({
  tokens,
  selectedTokenId,
  onTokenUpdate,
  onTokenDelete,
  onTokenAdd,
  onTokenSelect
}) => {
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [newToken, setNewToken] = useState({
    name: '',
    type: 'npc' as BattleToken['type'],
    color: '#FF6B6B',
    size: 1,
    hp: 10,
    maxHp: 10
  });

  const handleAddToken = () => {
    if (!newToken.name.trim()) return;
    
    onTokenAdd({
      ...newToken,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200
    });
    
    setNewToken({
      name: '',
      type: 'npc',
      color: '#FF6B6B',
      size: 1,
      hp: 10,
      maxHp: 10
    });
    setIsAddingToken(false);
  };

  const selectedToken = tokens.find(t => t.id === selectedTokenId);

  const getTypeIcon = (type: BattleToken['type']) => {
    switch (type) {
      case 'player': return <User className="h-4 w-4" />;
      case 'monster': return <Skull className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const typeColors = {
    player: 'bg-blue-100 text-blue-800',
    monster: 'bg-red-100 text-red-800',
    npc: 'bg-green-100 text-green-800'
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎭 Управление токенами</span>
          <Button size="sm" onClick={() => setIsAddingToken(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Форма добавления токена */}
        {isAddingToken && (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label htmlFor="token-name">Имя токена</Label>
                <Input
                  id="token-name"
                  value={newToken.name}
                  onChange={(e) => setNewToken({...newToken, name: e.target.value})}
                  placeholder="Введите имя..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Тип</Label>
                  <Select 
                    value={newToken.type} 
                    onValueChange={(value: BattleToken['type']) => setNewToken({...newToken, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="player">🛡️ Игрок</SelectItem>
                      <SelectItem value="npc">👤 NPC</SelectItem>
                      <SelectItem value="monster">💀 Монстр</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Размер</Label>
                  <Select 
                    value={newToken.size.toString()} 
                    onValueChange={(value) => setNewToken({...newToken, size: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Средний (1x1)</SelectItem>
                      <SelectItem value="2">Большой (2x2)</SelectItem>
                      <SelectItem value="3">Огромный (3x3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="token-hp">HP</Label>
                  <Input
                    id="token-hp"
                    type="number"
                    value={newToken.hp}
                    onChange={(e) => setNewToken({...newToken, hp: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="token-max-hp">Макс HP</Label>
                  <Input
                    id="token-max-hp"
                    type="number"
                    value={newToken.maxHp}
                    onChange={(e) => setNewToken({...newToken, maxHp: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="token-color">Цвет</Label>
                <div className="flex gap-2">
                  <Input
                    id="token-color"
                    type="color"
                    value={newToken.color}
                    onChange={(e) => setNewToken({...newToken, color: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={newToken.color}
                    onChange={(e) => setNewToken({...newToken, color: e.target.value})}
                    placeholder="#FF6B6B"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddToken} className="flex-1">Добавить</Button>
                <Button variant="outline" onClick={() => setIsAddingToken(false)}>Отмена</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Список токенов */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTokenId === token.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
              }`}
              onClick={() => onTokenSelect(token.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: token.color }}
                  />
                  {getTypeIcon(token.type)}
                  <span className="font-medium">{token.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={typeColors[token.type]}>
                    {token.type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTokenDelete(token.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {token.hp !== undefined && (
                <div className="mt-2 text-sm">
                  <Badge variant="outline">
                    ❤️ {token.hp}/{token.maxHp}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Редактирование выбранного токена */}
        {selectedToken && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="text-sm">Редактирование: {selectedToken.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Имя</Label>
                <Input
                  value={selectedToken.name}
                  onChange={(e) => onTokenUpdate(selectedToken.id, { name: e.target.value })}
                />
              </div>
              
              {selectedToken.hp !== undefined && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>HP</Label>
                    <Input
                      type="number"
                      value={selectedToken.hp}
                      onChange={(e) => onTokenUpdate(selectedToken.id, { hp: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Макс HP</Label>
                    <Input
                      type="number"
                      value={selectedToken.maxHp}
                      onChange={(e) => onTokenUpdate(selectedToken.id, { maxHp: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label>Цвет</Label>
                <Input
                  type="color"
                  value={selectedToken.color}
                  onChange={(e) => onTokenUpdate(selectedToken.id, { color: e.target.value })}
                  className="w-full h-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {tokens.length === 0 && !isAddingToken && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет токенов на карте</p>
            <p className="text-sm">Добавьте токены для начала боя</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenManager;
