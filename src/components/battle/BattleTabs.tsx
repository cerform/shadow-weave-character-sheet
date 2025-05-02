
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skull, User, Crown, RefreshCw, ArrowRight } from "lucide-react";
import { Initiative, Token } from '@/stores/battleStore';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BattleTabsProps {
  tokens: Token[];
  addToken?: (token: Token) => void;
  initiative: Initiative[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  updateTokenHP: (id: number, change: number) => void;
  removeToken: (id: number) => void;
  controlsPanel?: React.ReactNode;
  onAddToken?: (type: "player" | "monster" | "boss" | "npc") => void;
  fogOfWar?: boolean;
  setFogOfWar?: (enabled: boolean) => void;
  gridSize?: { rows: number; cols: number };
  setGridSize?: (size: { rows: number; cols: number }) => void;
  isDM?: boolean;
}

const BattleTabs: React.FC<BattleTabsProps> = ({
  tokens,
  addToken,
  initiative,
  selectedTokenId,
  onSelectToken,
  updateTokenHP,
  removeToken,
  controlsPanel,
  onAddToken,
  fogOfWar,
  setFogOfWar,
  gridSize,
  setGridSize,
  isDM = true
}) => {
  const [activeTab, setActiveTab] = useState("tokens");
  
  const handleOnAddToken = (type: "player" | "monster" | "boss" | "npc") => {
    if (onAddToken && isDM) {
      onAddToken(type);
    }
  };
  
  // Сортировка токенов в группы
  const players = tokens.filter(t => t.type === "player");
  const monsters = tokens.filter(t => t.type === "monster");
  const bosses = tokens.filter(t => t.type === "boss");
  
  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tokens" className="text-xs sm:text-sm">Токены</TabsTrigger>
          <TabsTrigger value="initiative" className="text-xs sm:text-sm">Инициатива</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Настройки</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tokens">
          {isDM && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              <Button
                onClick={() => handleOnAddToken("player")}
                variant="outline"
                className="w-full flex justify-center items-center gap-1"
                size="sm"
              >
                <User size={14} />
                <span className="text-xs">Игрок</span>
              </Button>
              <Button
                onClick={() => handleOnAddToken("monster")}
                variant="outline"
                className="w-full flex justify-center items-center gap-1"
                size="sm"
              >
                <Skull size={14} />
                <span className="text-xs">Моб</span>
              </Button>
              <Button
                onClick={() => handleOnAddToken("boss")}
                variant="outline"
                className="w-full flex justify-center items-center gap-1"
                size="sm"
              >
                <Crown size={14} />
                <span className="text-xs">Босс</span>
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Секция игроков */}
            {players.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <User size={14} className="mr-1" /> Игроки ({players.length})
                </h3>
                <div className="space-y-2">
                  {players.map(token => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      isSelected={token.id === selectedTokenId}
                      onSelect={() => onSelectToken(token.id)}
                      onUpdateHP={updateTokenHP}
                      onRemove={isDM ? removeToken : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Секция мобов */}
            {monsters.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center mt-4">
                  <Skull size={14} className="mr-1" /> Монстры ({monsters.length})
                </h3>
                <div className="space-y-2">
                  {monsters.map(token => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      isSelected={token.id === selectedTokenId}
                      onSelect={() => onSelectToken(token.id)}
                      onUpdateHP={updateTokenHP}
                      onRemove={isDM ? removeToken : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Секция боссов */}
            {bosses.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center mt-4">
                  <Crown size={14} className="mr-1" /> Боссы ({bosses.length})
                </h3>
                <div className="space-y-2">
                  {bosses.map(token => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      isSelected={token.id === selectedTokenId}
                      onSelect={() => onSelectToken(token.id)}
                      onUpdateHP={updateTokenHP}
                      onRemove={isDM ? removeToken : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {tokens.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isDM 
                  ? "Добавьте токены на карту с помощью кнопок выше" 
                  : "Нет активных токенов на карте"}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="initiative">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">Порядок инициативы</h3>
              {isDM && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <RefreshCw size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </div>
            <Separator className="my-2" />
          </div>
          
          <div className="space-y-1">
            {initiative.map((item, index) => {
              const token = tokens.find(t => t.id === item.tokenId);
              if (!token) return null;
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center p-2 rounded ${
                    item.isActive ? "bg-primary/20 border border-primary" : "bg-muted/10 border"
                  } cursor-pointer`}
                  onClick={() => onSelectToken(token.id)}
                >
                  <div className="mr-2 w-6 h-6 flex items-center justify-center rounded-full bg-muted font-medium text-xs">
                    {item.roll}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0"
                      style={{
                        backgroundImage: `url(${token.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <span className="text-sm truncate">{token.name}</span>
                  </div>
                  
                  {item.isActive && (
                    <Badge variant="secondary" className="ml-1 flex-shrink-0 text-xs">
                      Ход
                    </Badge>
                  )}
                </div>
              );
            })}
            
            {initiative.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Инициатива не была брошена
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          {controlsPanel}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Компонент карточки токена
interface TokenCardProps {
  token: Token;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateHP: (id: number, change: number) => void;
  onRemove?: (id: number) => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isSelected, onSelect, onUpdateHP, onRemove }) => {
  // Процент здоровья для индикатора
  const healthPercent = Math.max(0, Math.min(100, (token.hp / token.maxHp) * 100));
  const healthColor = healthPercent > 66 ? "bg-green-500" : healthPercent > 33 ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <Card 
      className={`${isSelected ? 'border-primary border-2' : ''} hover:bg-muted/10 transition-colors cursor-pointer`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-full overflow-hidden bg-muted"
              style={{
                backgroundImage: `url(${token.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `2px solid ${token.type === 'player' ? '#4CAF50' : token.type === 'boss' ? '#F44336' : '#FF9800'}`
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div className="font-medium truncate" title={token.name}>{token.name}</div>
              {onRemove && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 -mt-1 -mr-2 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {e.stopPropagation(); onRemove(token.id);}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </Button>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground flex justify-between items-center gap-1">
              <div>КЗ: {token.ac}</div>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${healthColor}`} style={{width: `${healthPercent}%`}}></div>
                </div>
                <span>{token.hp}/{token.maxHp}</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs px-1.5 text-muted-foreground"
                onClick={(e) => {e.stopPropagation(); onUpdateHP(token.id, -1);}}
              >
                -1
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs px-1.5 text-muted-foreground"
                onClick={(e) => {e.stopPropagation(); onUpdateHP(token.id, 1);}}
              >
                +1
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs px-1.5 text-muted-foreground"
                onClick={(e) => {e.stopPropagation(); onUpdateHP(token.id, 5);}}
              >
                +5
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleTabs;
