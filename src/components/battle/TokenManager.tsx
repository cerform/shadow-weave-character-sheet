
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Token {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'player' | 'npc' | 'monster';
  hp?: number;
  maxHp?: number;
}

interface TokenManagerProps {
  tokens: Token[];
  selectedTokenId?: string | null;
  onTokenUpdate: (tokenId: string, updates: Partial<Token>) => void;
  onTokenDelete: (tokenId: string) => void;
  onTokenAdd: (token: Omit<Token, 'id'>) => void;
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
  const [newToken, setNewToken] = useState<Omit<Token, 'id'>>({
    name: '',
    x: 100,
    y: 100,
    color: '#FF0000',
    size: 1,
    type: 'npc'
  });

  const handleAddToken = () => {
    if (newToken.name.trim()) {
      onTokenAdd(newToken);
      setNewToken({
        name: '',
        x: 100,
        y: 100,
        color: '#FF0000',
        size: 1,
        type: 'npc'
      });
      setIsAddingToken(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-500';
      case 'monster': return 'bg-red-500';
      case 'npc': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Токены ({tokens.length})</span>
          <Button
            size="sm"
            onClick={() => setIsAddingToken(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Форма добавления токена */}
        {isAddingToken && (
          <div className="p-3 border rounded-lg bg-muted/30 space-y-2">
            <Input
              placeholder="Имя токена"
              value={newToken.name}
              onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={newToken.type}
                onValueChange={(value: 'player' | 'npc' | 'monster') => 
                  setNewToken({ ...newToken, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Игрок</SelectItem>
                  <SelectItem value="npc">NPC</SelectItem>
                  <SelectItem value="monster">Монстр</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="color"
                value={newToken.color}
                onChange={(e) => setNewToken({ ...newToken, color: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="HP"
                value={newToken.hp || ''}
                onChange={(e) => setNewToken({ 
                  ...newToken, 
                  hp: parseInt(e.target.value) || undefined,
                  maxHp: parseInt(e.target.value) || undefined
                })}
              />
              <Input
                type="number"
                placeholder="Размер"
                min="0.5"
                max="3"
                step="0.5"
                value={newToken.size}
                onChange={(e) => setNewToken({ ...newToken, size: parseFloat(e.target.value) || 1 })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddToken}>
                Добавить
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingToken(false)}>
                Отмена
              </Button>
            </div>
          </div>
        )}

        {/* Список токенов */}
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {tokens.map((token) => (
            <div
              key={token.id}
              className={`p-2 border rounded cursor-pointer transition-colors ${
                selectedTokenId === token.id 
                  ? 'border-primary bg-primary/10' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onTokenSelect(token.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: token.color }}
                  />
                  <span className="font-medium text-sm">{token.name}</span>
                  <Badge variant="secondary" className={`text-xs ${getTypeColor(token.type)}`}>
                    {token.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {token.hp !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      {token.hp}/{token.maxHp}
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTokenDelete(token.id);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {selectedTokenId === token.id && (
                <div className="mt-2 pt-2 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Имя"
                      value={token.name}
                      onChange={(e) => onTokenUpdate(token.id, { name: e.target.value })}
                      className="text-xs h-7"
                    />
                    <Input
                      type="color"
                      value={token.color}
                      onChange={(e) => onTokenUpdate(token.id, { color: e.target.value })}
                      className="h-7"
                    />
                  </div>
                  {token.hp !== undefined && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="HP"
                        value={token.hp}
                        onChange={(e) => onTokenUpdate(token.id, { hp: parseInt(e.target.value) || 0 })}
                        className="text-xs h-7"
                      />
                      <Input
                        type="number"
                        placeholder="Max HP"
                        value={token.maxHp}
                        onChange={(e) => onTokenUpdate(token.id, { maxHp: parseInt(e.target.value) || 0 })}
                        className="text-xs h-7"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Позиция: ({Math.round(token.x)}, {Math.round(token.y)})
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {tokens.length === 0 && !isAddingToken && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Нет токенов на карте</p>
            <p className="text-xs">Нажмите + чтобы добавить</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenManager;
