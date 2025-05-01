
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import OBSLayout from "@/components/OBSLayout";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Save, User, Skull, Crown } from "lucide-react";

// Типы токенов: игрок, моб или босс
interface Token {
  id: number;
  name: string;
  type: "player" | "mob" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
}

interface Initiative {
  id: number;
  tokenId: number | null;
  name: string;
  roll: number;
  isActive: boolean;
}

// Предустановленные аватары для каждого класса
const classAvatars = {
  warrior: [
    "/avatars/warrior1.jpg",
    "/avatars/warrior2.jpg",
    "/avatars/warrior3.jpg",
    // и т.д. до 10 аватаров
  ],
  wizard: [
    "/avatars/wizard1.jpg",
    "/avatars/wizard2.jpg",
    "/avatars/wizard3.jpg",
    // и т.д. до 10 аватаров
  ],
  // Заглушки для тестирования
  placeholder: [
    "https://picsum.photos/id/237/200/200",
    "https://picsum.photos/id/238/200/200",
    "https://picsum.photos/id/239/200/200",
    "https://picsum.photos/id/240/200/200",
    "https://picsum.photos/id/241/200/200",
    "https://picsum.photos/id/242/200/200",
    "https://picsum.photos/id/243/200/200",
    "https://picsum.photos/id/244/200/200",
  ]
};

// Предустановленные мобы и боссы
const monsterTokens = [
  { name: "Гоблин", hp: 7, ac: 15, img: "https://picsum.photos/id/250/200/200" },
  { name: "Хобгоблин", hp: 11, ac: 18, img: "https://picsum.photos/id/251/200/200" },
  { name: "Орк", hp: 15, ac: 13, img: "https://picsum.photos/id/252/200/200" },
  { name: "Огр", hp: 59, ac: 11, img: "https://picsum.photos/id/253/200/200" },
  { name: "Тролль", hp: 84, ac: 15, img: "https://picsum.photos/id/254/200/200" },
  { name: "Дракон", hp: 178, ac: 19, img: "https://picsum.photos/id/255/200/200" },
];

const BattleScenePage = () => {
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [draggingTokenId, setDraggingTokenId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "mob" | "boss">("player");
  const [tokenName, setTokenName] = useState("");

  const sceneRef = useRef<HTMLDivElement>(null);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBackground(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTokenSelect = (img: string) => {
    if (!tokenName) return;

    const newToken: Token = {
      id: Date.now(),
      name: tokenName,
      type: tokenType,
      img,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: tokenType === "boss" ? 100 : tokenType === "mob" ? 20 : 30,
      maxHp: tokenType === "boss" ? 100 : tokenType === "mob" ? 20 : 30,
      ac: tokenType === "boss" ? 17 : tokenType === "mob" ? 13 : 15,
      initiative: Math.floor(Math.random() * 20) + 1,
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
    
    setShowAvatarSelector(false);
    setTokenName("");
  };

  const handleAddPresetMonster = (monster: typeof monsterTokens[0], type: "mob" | "boss") => {
    const newToken: Token = {
      id: Date.now(),
      name: monster.name,
      type,
      img: monster.img,
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: Math.floor(Math.random() * 20) + 1,
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
    setShowAvatarSelector(true);
  };

  // Updated to handle position directly instead of using a MouseEvent
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
    }
  };

  const nextTurn = () => {
    const nextTurnIndex = (currentTurn + 1) % initiative.length;
    setCurrentTurn(nextTurnIndex);
    
    // Update active status
    const newInitiative = [...initiative];
    newInitiative.forEach((init, index) => {
      init.isActive = index === nextTurnIndex;
    });
    setInitiative(newInitiative);
  };

  const handleZoom = (e: React.WheelEvent) => {
    if (e.deltaY < 0) setZoom((z) => Math.min(z + 0.1, 2));
    else setZoom((z) => Math.max(z - 0.1, 0.5));
  };

  return (
    <OBSLayout>
      {/* Левая панель */}
      <div className="obs-left p-4 bg-background text-foreground overflow-y-auto">
        <Tabs defaultValue="tokens">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tokens">Токены</TabsTrigger>
            <TabsTrigger value="monsters">Монстры</TabsTrigger>
            <TabsTrigger value="initiative">Инициатива</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokens" className="space-y-4">
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="p-2 border rounded bg-primary/10"
              />
              <Button
                onClick={() => handleAddToken("player")}
                className="flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <User size={16} />
                Добавить Игрока
              </Button>
              <Button
                onClick={() => handleAddToken("mob")}
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
            </div>

            {/* Список токенов */}
            <div className="space-y-2">
              <h3 className="font-medium">Токены на поле ({tokens.length})</h3>
              {tokens.map(token => (
                <div key={token.id} className="flex items-center justify-between p-2 bg-card rounded">
                  <div className="flex items-center gap-2">
                    <img src={token.img} alt={token.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-sm">
                      <div>{token.name}</div>
                      <div className="text-xs text-muted-foreground">HP: {token.hp}/{token.maxHp} AC: {token.ac}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateTokenHP(token.id, -1)}>-</Button>
                    <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateTokenHP(token.id, 1)}>+</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeToken(token.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
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
                    <div className="grid grid-cols-2 gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleAddPresetMonster(monster, "mob")}>
                        Моб
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAddPresetMonster(monster, "boss")}>
                        Босс
                      </Button>
                    </div>
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
                  Нет инициативы. Добавьте токены и нажмите "Бросить Инициативу".
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Центральная пустая зона (сцена боя) */}
      <div className="obs-center">
        <div
          ref={sceneRef}
          className="relative w-full h-full border border-border rounded-lg overflow-hidden bg-primary/5"
          style={{
            backgroundImage: background ? `url(${background})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
          onWheel={handleZoom}
        >
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              className="absolute cursor-pointer select-none"
              style={{ left: token.x, top: token.y, width: 64, height: 80 }}
              drag
              dragMomentum={false}
              onDragStart={() => setDraggingTokenId(token.id)}
              onDragEnd={(_, info) => {
                if (draggingTokenId !== null && sceneRef.current) {
                  const rect = sceneRef.current.getBoundingClientRect();
                  const x = info.point.x - rect.left;
                  const y = info.point.y - rect.top;
                  updateTokenPosition(draggingTokenId, x, y);
                  setDraggingTokenId(null);
                }
              }}
            >
              <div className={`relative ${
                initiative.find(i => i.tokenId === token.id && i.isActive) 
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-black/50" 
                  : ""
              }`}>
                <img
                  src={token.img}
                  alt={token.name}
                  className={`w-full h-16 object-cover rounded-full border-2 ${
                    token.type === "boss"
                      ? "border-red-500"
                      : token.type === "mob"
                      ? "border-yellow-500"
                      : "border-green-500"
                  }`}
                />
                
                {/* HP Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      token.hp > token.maxHp * 0.6 
                        ? "bg-green-500" 
                        : token.hp > token.maxHp * 0.3 
                          ? "bg-yellow-500" 
                          : "bg-red-500"
                    }`} 
                    style={{ width: `${(token.hp / token.maxHp) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-center text-xs font-bold mt-1 bg-black/50 text-white rounded px-1 truncate">
                  {token.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Правая панель */}
      <div className="obs-right p-4 bg-background text-foreground overflow-y-auto">
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
            <Input placeholder="Сообщение..." />
            <Button>Отправить</Button>
          </div>
        </div>
      </div>

      {/* Модальное окно выбора аватара */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Выберите аватар</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowAvatarSelector(false)}>
                <X />
              </Button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Имя токена</label>
              <Input
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Введите имя"
                className="mb-4"
              />
            </div>
            
            <h4 className="font-medium mb-2">Выберите аватар:</h4>
            <div className="grid grid-cols-4 gap-2">
              {classAvatars.placeholder.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTokenSelect(img)}
                  className="p-1 border rounded hover:bg-muted transition-colors"
                >
                  <img src={img} alt={`Avatar ${idx + 1}`} className="w-full aspect-square object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </OBSLayout>
  );
};

export default BattleScenePage;
