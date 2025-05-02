
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Book, Settings } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Token, Initiative } from "@/pages/PlayBattlePage";
import { BestiaryPanel } from "./BestiaryPanel";

interface BattleTabsProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  initiative: Initiative[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  updateTokenHP?: (id: number, change: number) => void;
  removeToken?: (id: number) => void;
  controlsPanel?: React.ReactNode;
  fogOfWar?: boolean;
  setFogOfWar?: (value: boolean) => void;
  gridSize?: { rows: number; cols: number };
  setGridSize?: (size: { rows: number; cols: number }) => void;
  onAddToken?: (type: Token["type"]) => void; // Добавляем проп onAddToken
}

const BattleTabs: React.FC<BattleTabsProps> = ({
  tokens,
  setTokens,
  initiative,
  selectedTokenId,
  onSelectToken,
  updateTokenHP,
  removeToken,
  controlsPanel,
  onAddToken,
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
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tokens" className="flex flex-col items-center py-1">
            <Users size={16} />
            <span className="text-xs mt-1">Токены</span>
          </TabsTrigger>
          <TabsTrigger value="bestiary" className="flex flex-col items-center py-1">
            <Book size={16} />
            <span className="text-xs mt-1">Бестиарий</span>
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex flex-col items-center py-1">
            <Settings size={16} />
            <span className="text-xs mt-1">Настройки</span>
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
          
          <TabsContent value="bestiary" className="m-0 p-3 h-full">
            <BestiaryPanel addToMap={(monster) => {
              if (setTokens) {
                const newToken = {
                  id: Date.now(),
                  name: monster.name,
                  type: monster.challenge >= 5 ? "boss" : "monster" as "player" | "monster" | "boss" | "npc",
                  img: monster.img || `/assets/tokens/${monster.type.toLowerCase()}.png`,
                  x: 100 + Math.random() * 300,
                  y: 100 + Math.random() * 300,
                  hp: monster.hp,
                  maxHp: monster.hp,
                  ac: monster.ac,
                  initiative: monster.dexMod || 0,
                  conditions: [],
                  resources: {},
                  visible: true,
                  size: monster.size === 'Large' ? 1.5 : monster.size === 'Huge' ? 2 : monster.size === 'Gargantuan' ? 2.5 : 1
                };
                setTokens(prev => [...prev, newToken]);
              }
            }} />
          </TabsContent>
          
          <TabsContent value="controls" className="m-0 p-3 h-full">
            {controlsPanel}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default BattleTabs;
