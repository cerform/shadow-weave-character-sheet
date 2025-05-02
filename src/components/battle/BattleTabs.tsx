
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DicePanel } from "@/components/character-sheet/DicePanel";
import { Dice1, Users, Map, Cog, MessageSquare } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Token, Initiative } from "@/pages/PlayBattlePage";

interface BattleTabsProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  initiative: Initiative[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  updateTokenHP?: (id: number, change: number) => void;
  removeToken?: (id: number) => void;
  controlsPanel?: React.ReactNode;
}

const BattleTabs: React.FC<BattleTabsProps> = ({
  tokens,
  setTokens,
  initiative,
  selectedTokenId,
  onSelectToken,
  updateTokenHP,
  removeToken,
  controlsPanel
}) => {
  const [selectedTab, setSelectedTab] = useState<string>("tokens");
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes];
  
  return (
    <div className="h-full">
      <Tabs 
        defaultValue="tokens" 
        className="h-full flex flex-col" 
        value={selectedTab} 
        onValueChange={setSelectedTab}
      >
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="tokens" className="flex flex-col items-center py-1">
            <Users size={16} />
            <span className="text-xs mt-1">Токены</span>
          </TabsTrigger>
          <TabsTrigger value="initiative" className="flex flex-col items-center py-1">
            <Dice1 size={16} />
            <span className="text-xs mt-1">Инициатива</span>
          </TabsTrigger>
          <TabsTrigger value="dice" className="flex flex-col items-center py-1">
            <Dice1 size={16} />
            <span className="text-xs mt-1">Кубики</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex flex-col items-center py-1">
            <MessageSquare size={16} />
            <span className="text-xs mt-1">Чат</span>
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="tokens" className="m-0 p-3 h-full">
            <h3 className="font-medium mb-2">Токены на карте ({tokens.length})</h3>
            {tokens.map(token => (
              <div 
                key={token.id} 
                className={`flex items-center justify-between p-2 rounded mb-2 ${
                  selectedTokenId === token.id ? 'bg-primary/20 border border-primary' : 'bg-card'
                }`}
                onClick={() => onSelectToken(token.id)}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={token.img} 
                    alt={token.name} 
                    className="w-8 h-8 rounded-full object-cover"
                    style={{
                      borderColor: token.type === "boss"
                          ? "#ff5555"
                          : token.type === "monster"
                          ? "#ff9955"
                          : "#55ff55",
                      borderWidth: 2
                    }}
                  />
                  <div>
                    <div className="font-medium">{token.name}</div>
                    <div className="text-xs text-muted-foreground">HP: {token.hp}/{token.maxHp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {updateTokenHP && (
                    <>
                      <button 
                        className="h-6 w-6 flex items-center justify-center rounded border text-xs"
                        onClick={(e) => {e.stopPropagation(); updateTokenHP(token.id, -1);}}
                      >
                        -
                      </button>
                      <button 
                        className="h-6 w-6 flex items-center justify-center rounded border text-xs"
                        onClick={(e) => {e.stopPropagation(); updateTokenHP(token.id, 1);}}
                      >
                        +
                      </button>
                    </>
                  )}
                  {removeToken && (
                    <button 
                      className="h-6 w-6 flex items-center justify-center rounded text-destructive"
                      onClick={(e) => {e.stopPropagation(); removeToken(token.id);}}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {tokens.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                Нет токенов на карте
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="initiative" className="m-0 p-3 h-full">
            <h3 className="font-medium mb-2">Порядок ходов</h3>
            {initiative.map((item, index) => {
              const token = tokens.find(t => t.id === item.tokenId);
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-2 p-2 rounded mb-2 ${
                    item.isActive ? "bg-primary/20 border border-primary" : "bg-card"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full font-medium">
                    {item.roll}
                  </div>
                  
                  {token && (
                    <img src={token.img} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
                  )}
                  
                  <div className="flex-1 truncate">{item.name}</div>
                  
                  {item.isActive && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Ход
                    </div>
                  )}
                </div>
              );
            })}
            
            {initiative.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                Инициатива не брошена
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dice" className="m-0 p-3 h-full">
            <DicePanel />
          </TabsContent>
          
          <TabsContent value="controls" className="m-0 p-3 h-full">
            {controlsPanel}
          </TabsContent>
          
          <TabsContent value="chat" className="m-0 p-3 h-full">
            <div className="h-full flex flex-col">
              <h3 className="font-medium mb-2">Игровой чат</h3>
              <div className="flex-1 bg-muted/20 rounded mb-2 p-2 overflow-y-auto">
                <div className="text-sm">
                  <div className="mb-1">
                    <span className="font-medium">DM:</span> Добро пожаловать в приключение!
                  </div>
                  <div className="mb-1">
                    <span className="font-medium text-green-500">Игрок 1:</span> Спасибо, готов начать!
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">DM:</span> Бросаем инициативу...
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 h-9 px-3 py-1 rounded-md border bg-muted/20"
                  placeholder="Сообщение..." 
                />
                <button 
                  className="px-3 h-9 rounded-md bg-primary text-primary-foreground"
                  style={{
                    backgroundColor: currentTheme.accent,
                    color: currentTheme.textColor
                  }}
                >
                  Отправить
                </button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default BattleTabs;
