import React, { useRef, useState, useEffect } from "react";
import OBSLayout from "@/components/OBSLayout";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, User, Skull, Crown, Home, Scroll, Book } from "lucide-react";
import TokenSelector from "@/components/battle/TokenSelector";
import BattleMap from "@/components/battle/BattleMap";
import { Token as TokenType, VisibleArea } from "@/types/socket";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/ui/NavigationButtons";

// Типы токенов: игрок, моб или босс
interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  visible: boolean;
}

interface Initiative {
  id: number;
  tokenId: number | null;
  name: string;
  roll: number;
  isActive: boolean;
}

// Предустановленные мобы и боссы с готовыми аватарами
const monsterTokens = [
  { name: "Гоблин", hp: 7, ac: 15, img: "/lovable-uploads/7a062655-27cc-43a9-bc21-fb65a1c04538.png", type: "monster" },
  { name: "Хобгоблин", hp: 11, ac: 18, img: "/lovable-uploads/181e96b3-24be-423e-b0cb-5814a8f72172.png", type: "monster" },
  { name: "Орк", hp: 15, ac: 13, img: "/lovable-uploads/7a062655-27cc-43a9-bc21-fb65a1c04538.png", type: "monster" },
  { name: "Огр", hp: 59, ac: 11, img: "/lovable-uploads/181e96b3-24be-423e-b0cb-5814a8f72172.png", type: "boss" },
  { name: "Тролль", hp: 84, ac: 15, img: "/lovable-uploads/7a062655-27cc-43a9-bc21-fb65a1c04538.png", type: "boss" },
  { name: "Дракон", hp: 178, ac: 19, img: "/lovable-uploads/181e96b3-24be-423e-b0cb-5814a8f72172.png", type: "boss" },
];

const BattleScenePage = () => {
  const navigate = useNavigate();
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [zoom, setZoom] = useState(1);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "monster" | "boss">("player");
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [battleActive, setBattleActive] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Обработчик выбора токена из селектора
  const handleTokenSelect = (tokenData: {name: string; type: string; img: string}) => {
    const newToken: Token = {
      id: Date.now(),
      name: tokenData.name,
      type: tokenData.type as "player" | "monster" | "boss",
      img: tokenData.img,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: tokenData.type === "boss" ? 100 : tokenData.type === "monster" ? 20 : 30,
      maxHp: tokenData.type === "boss" ? 100 : tokenData.type === "monster" ? 20 : 30,
      ac: tokenData.type === "boss" ? 17 : tokenData.type === "monster" ? 13 : 15,
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
      resources: {},
      visible: true
    };
    
    setTokens((prev) => [...prev, newToken]);
    
    // Add to initiative
    const newInitiative: Initiative = {
      id: Date.now(),
      tokenId: newToken.id,
      name: newToken.name,
      roll: newToken.initiative,
      isActive: false,
    };
    
    setInitiative(prev => 
      [...prev, newInitiative].sort((a, b) => b.roll - a.roll)
    );
    
    setTokenSelectorOpen(false);
  };

  const handleAddPresetMonster = (monster: typeof monsterTokens[0]) => {
    const newToken: Token = {
      id: Date.now(),
      name: monster.name,
      type: monster.type as "monster" | "boss",
      img: monster.img,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: Math.floor(Math.random() * 20) + 1,
      conditions: [],
      resources: {},
      visible: true
    };
    
    setTokens((prev) => [...prev, newToken]);
    
    // Add to initiative
    const newInitiative: Initiative = {
      id: Date.now(),
      tokenId: newToken.id,
      name: newToken.name,
      roll: newToken.initiative,
      isActive: false,
    };
    
    setInitiative(prev => 
      [...prev, newInitiative].sort((a, b) => b.roll - a.roll)
    );
  };

  const handleAddToken = (type: Token["type"]) => {
    setTokenType(type);
    setTokenSelectorOpen(true);
  };

  const updateTokenPosition = (id: number, x: number, y: number) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, x, y } : t))
    );
  };

  const updateTokenHP = (id: number, change: number) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, hp: Math.max(0, Math.min(t.maxHp, t.hp + change)) } : t))
    );
  };

  const removeToken = (id: number) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    setInitiative((prev) => prev.filter((i) => i.tokenId !== id));
    if (selectedTokenId === id) {
      setSelectedTokenId(null);
    }
  };

  const rollInitiative = () => {
    const updatedInitiative: Initiative[] = tokens.map(token => ({
      id: Date.now() + token.id,
      tokenId: token.id,
      name: token.name,
      roll: Math.floor(Math.random() * 20) + 1,
      isActive: false,
    }));
    
    const sorted = [...updatedInitiative].sort((a, b) => b.roll - a.roll);
    setInitiative(sorted);
    if (sorted.length > 0) {
      setCurrentTurn(0);
      
      // Mark the first combatant as active
      const newInitiative = [...sorted];
      newInitiative.forEach((init, index) => {
        init.isActive = index === 0;
      });
      setInitiative(newInitiative);
      setBattleActive(true);
    }
  };

  const nextTurn = () => {
    if (initiative.length === 0) return;
    
    const nextTurnIndex = (currentTurn + 1) % initiative.length;
    setCurrentTurn(nextTurnIndex);
    
    // Update active status
    const newInitiative = [...initiative];
    newInitiative.forEach((init, index) => {
      init.isActive = index === nextTurnIndex;
    });
    setInitiative(newInitiative);
  };

  const addCondition = (tokenId: number, condition: string) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId) {
        const updatedConditions = [...(token.conditions || [])];
        if (!updatedConditions.includes(condition)) {
          updatedConditions.push(condition);
        }
        return {...token, conditions: updatedConditions};
      }
      return token;
    }));
  };
  
  const removeCondition = (tokenId: number, condition: string) => {
    setTokens(prev => prev.map(token => {
      if (token.id === tokenId) {
        return {
          ...token, 
          conditions: (token.conditions || []).filter(c => c !== condition)
        };
      }
      return token;
    }));
  };

  return (
    <OBSLayout>
      {/* Левая панель */}
      <div className="obs-left p-4 bg-background/95 text-foreground overflow-y-auto">
        <div className="mb-4">
          <NavigationButtons className="flex-col items-stretch" />
        </div>
        
        <Tabs defaultValue="tokens">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tokens">Токены</TabsTrigger>
            <TabsTrigger value="monsters">Монстры</TabsTrigger>
            <TabsTrigger value="initiative">Инициатива</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokens" className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleAddToken("player")}
                className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <User size={16} />
                Добавить Игрока
              </Button>
              <Button
                onClick={() => handleAddToken("monster")}
                className="flex justify-center items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Skull size={16} />
                Добавить Моба
              </Button>
              <Button
                onClick={() => handleAddToken("boss")}
                className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Crown size={16} />
                Добавить Босса
              </Button>
              <Button
                onClick={rollInitiative}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Бросить Инициативу
              </Button>
              
              {battleActive && (
                <Button
                  onClick={nextTurn}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Следующий ход
                </Button>
              )}
            </div>

            {/* Список токенов */}
            <div className="space-y-2">
              <h3 className="font-medium">Токены на поле ({tokens.length})</h3>
              {tokens.map(token => (
                <div 
                  key={token.id} 
                  className={`flex items-center justify-between p-2 rounded ${
                    selectedTokenId === token.id ? 'bg-primary/20 border border-primary' : 'bg-card'
                  }`}
                  onClick={() => setSelectedTokenId(token.id)}
                >
                  <div className="flex items-center gap-2">
                    <img src={token.img} alt={token.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-sm">
                      <div>{token.name}</div>
                      <div className="text-xs text-muted-foreground">HP: {token.hp}/{token.maxHp} AC: {token.ac}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); updateTokenHP(token.id, -1);}}>-</Button>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); updateTokenHP(token.id, 1);}}>+</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => {e.stopPropagation(); removeToken(token.id);}}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
              
              {tokens.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  Добавьте токены на игровое поле, используя кнопки выше
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="monsters" className="space-y-4">
            <h3 className="font-medium mb-2">Библиотека монстров</h3>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-2">
                {monsterTokens.map((monster, index) => (
                  <div key={index} className="bg-card p-2 rounded border">
                    <img src={monster.img} alt={monster.name} className="w-full h-20 object-cover rounded mb-2" />
                    <div className="text-center text-sm font-medium mb-1">{monster.name}</div>
                    <div className="text-xs text-center mb-2">HP: {monster.hp} | AC: {monster.ac}</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAddPresetMonster(monster)}
                      className="w-full"
                    >
                      Добавить
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="initiative" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Порядок инициативы</h3>
              <div className="flex gap-2">
                <Button size="sm" onClick={rollInitiative}>Перебросить</Button>
                <Button size="sm" onClick={nextTurn}>Следующий</Button>
              </div>
            </div>
            
            <div className="space-y-1">
              {initiative.map((item, index) => {
                const token = tokens.find(t => t.id === item.tokenId);
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-2 p-2 rounded ${
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
                        Текущий ход
                      </div>
                    )}
                  </div>
                );
              })}
              
              {initiative.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Нет инициативы. Добавьте токены и нажмите "Броси��ь Инициативу".
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Центральная пустая зона (сцена боя) */}
      <div className="obs-center">
        <BattleMap
          tokens={tokens as any}
          setTokens={setTokens as any}
          background={background}
          setBackground={setBackground}
          onUpdateTokenPosition={updateTokenPosition}
          onSelectToken={setSelectedTokenId}
          selectedTokenId={selectedTokenId}
          initiative={initiative}
          battleActive={battleActive}
        />
      </div>

      {/* Правая панель */}
      <div className="obs-right p-4 bg-background/95 text-foreground overflow-y-auto">
        <h3 className="font-medium mb-4">Кубики</h3>
        <div className="h-96">
          <DiceRoller3D />
        </div>
        
        <div className="mt-4 p-4 border rounded bg-muted/10">
          <h3 className="font-medium mb-2">Чат</h3>
          <div className="h-48 bg-muted/20 rounded mb-2 p-2 overflow-y-auto">
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
            <Input placeholder="Сообщение..." className="text-foreground" />
            <Button>Отправить</Button>
          </div>
        </div>
      </div>
      
      {/* Модальное окно выбора токена */}
      <TokenSelector 
        open={tokenSelectorOpen}
        onClose={() => setTokenSelectorOpen(false)}
        onTokenSelect={handleTokenSelect}
        tokenType={tokenType}
      />
    </OBSLayout>
  );
};

export default BattleScenePage;
