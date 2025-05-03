
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skull, User, Crown, RefreshCw, ArrowRight } from "lucide-react";
import { Initiative, Token } from '@/stores/battleStore';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useDeviceType } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const deviceType = useDeviceType();
  const isMobile = deviceType === 'mobile';
  
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
        <TabsList className={`grid grid-cols-3 mb-4 gap-2`}>
          <TabsTrigger 
            value="tokens" 
            className="text-xs sm:text-sm flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'tokens' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'tokens' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'tokens' ? currentTheme.accent : 'transparent'
            }}
          >
            <User className={`${isMobile ? "size-4" : "size-3"} mr-1`} />
            <span className="truncate">Токены</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="initiative" 
            className="text-xs sm:text-sm flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'initiative' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'initiative' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'initiative' ? currentTheme.accent : 'transparent'
            }}
          >
            <ArrowRight className={`${isMobile ? "size-4" : "size-3"} mr-1`} />
            <span className="truncate">Инициатива</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="settings" 
            className="text-xs sm:text-sm flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === 'settings' ? `${currentTheme.accent}30` : 'transparent',
              boxShadow: activeTab === 'settings' ? `inset 0 0 5px ${currentTheme.accent}60` : 'none',
              borderColor: activeTab === 'settings' ? currentTheme.accent : 'transparent'
            }}
          >
            <RefreshCw className={`${isMobile ? "size-4" : "size-3"} mr-1`} />
            <span className="truncate">Настройки</span>
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className={`${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-180px)]'}`}>
          <TabsContent value="tokens" className="mt-0 px-1">
            {isDM && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                <Button
                  onClick={() => handleOnAddToken("player")}
                  variant="outline"
                  className="w-full flex justify-center items-center gap-1"
                  size="sm"
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    backgroundColor: `${currentTheme.accent}10`,
                  }}
                >
                  <User size={14} />
                  <span className="text-xs">Игрок</span>
                </Button>
                <Button
                  onClick={() => handleOnAddToken("monster")}
                  variant="outline"
                  className="w-full flex justify-center items-center gap-1"
                  size="sm"
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    backgroundColor: `${currentTheme.accent}10`,
                  }}
                >
                  <Skull size={14} />
                  <span className="text-xs">Моб</span>
                </Button>
                <Button
                  onClick={() => handleOnAddToken("boss")}
                  variant="outline"
                  className="w-full flex justify-center items-center gap-1"
                  size="sm"
                  style={{
                    borderColor: `${currentTheme.accent}40`,
                    backgroundColor: `${currentTheme.accent}10`,
                  }}
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
                  <h3 className="text-sm font-semibold mb-2 flex items-center px-1">
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
                        currentTheme={currentTheme}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Секция мобов */}
              {monsters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center mt-4 px-1">
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
                        currentTheme={currentTheme}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Секция боссов */}
              {bosses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center mt-4 px-1">
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
                        currentTheme={currentTheme}
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
          
          <TabsContent value="initiative" className="mt-0 px-1">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">Порядок инициативы</h3>
                {isDM && (
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      style={{
                        backgroundColor: `${currentTheme.accent}10`,
                      }}
                    >
                      <RefreshCw size={14} />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      style={{
                        backgroundColor: `${currentTheme.accent}10`,
                      }}
                    >
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
              <Separator className="my-2" style={{ backgroundColor: `${currentTheme.accent}30` }}/>
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
                    style={{
                      backgroundColor: item.isActive ? `${currentTheme.accent}30` : `${currentTheme.accent}10`,
                      borderColor: item.isActive ? currentTheme.accent : `${currentTheme.accent}30`,
                      boxShadow: item.isActive ? `0 0 5px ${currentTheme.accent}40` : 'none'
                    }}
                  >
                    <div 
                      className="mr-2 w-6 h-6 flex items-center justify-center rounded-full font-medium text-xs"
                      style={{
                        backgroundColor: `${currentTheme.accent}20`,
                        border: `1px solid ${currentTheme.accent}60`,
                      }}
                    >
                      {item.roll}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
                        style={{
                          backgroundImage: `url(${token.img})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: `2px solid ${currentTheme.accent}80`,
                        }}
                      />
                      <span className="text-sm truncate">{token.name}</span>
                    </div>
                    
                    {item.isActive && (
                      <Badge 
                        variant="secondary" 
                        className="ml-1 flex-shrink-0 text-xs"
                        style={{
                          backgroundColor: `${currentTheme.accent}40`,
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          textShadow: '0 0 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
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
          
          <TabsContent value="settings" className="mt-0 px-1">
            {controlsPanel}
          </TabsContent>
        </ScrollArea>
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
  currentTheme: any;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, isSelected, onSelect, onUpdateHP, onRemove, currentTheme }) => {
  // Процент здоровья для индикатора
  const healthPercent = Math.max(0, Math.min(100, (token.hp / token.maxHp) * 100));
  const healthColor = healthPercent > 66 ? "bg-green-500" : healthPercent > 33 ? "bg-yellow-500" : "bg-red-500";
  
  return (
    <Card 
      className={`hover:bg-muted/10 transition-colors cursor-pointer`}
      onClick={onSelect}
      style={{
        borderColor: isSelected ? currentTheme.accent : `${currentTheme.accent}30`,
        borderWidth: isSelected ? '2px' : '1px',
        backgroundColor: isSelected ? `${currentTheme.accent}10` : 'transparent',
        boxShadow: isSelected ? `0 0 8px ${currentTheme.accent}40` : 'none',
      }}
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
                border: `2px solid ${token.type === 'player' ? '#4CAF50' : token.type === 'boss' ? '#F44336' : '#FF9800'}`,
                boxShadow: `0 0 5px ${token.type === 'player' ? '#4CAF5080' : token.type === 'boss' ? '#F4433680' : '#FF980080'}`,
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div 
                className="font-medium truncate" 
                title={token.name}
                style={{
                  textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)',
                  color: token.type === 'player' ? '#FFFFFF' : token.type === 'boss' ? '#FFCCBC' : '#FFFFFF',
                }}
              >
                {token.name}
              </div>
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
                style={{ borderColor: `${currentTheme.accent}40`, backgroundColor: `${currentTheme.accent}10` }}
              >
                -1
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs px-1.5 text-muted-foreground"
                onClick={(e) => {e.stopPropagation(); onUpdateHP(token.id, 1);}}
                style={{ borderColor: `${currentTheme.accent}40`, backgroundColor: `${currentTheme.accent}10` }}
              >
                +1
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs px-1.5 text-muted-foreground"
                onClick={(e) => {e.stopPropagation(); onUpdateHP(token.id, 5);}}
                style={{ borderColor: `${currentTheme.accent}40`, backgroundColor: `${currentTheme.accent}10` }}
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
