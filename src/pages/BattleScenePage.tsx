import React, { useRef, useState, useEffect } from "react";
import OBSLayout from "@/components/OBSLayout";
import { DiceRoller3D } from "@/components/dice/DiceRoller3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, User, Skull, Crown, Home, Scroll, Book, Pause, Play, ArrowLeft } from "lucide-react";
import TokenSelector from "@/components/battle/TokenSelector";
import BattleMap from "@/components/battle/BattleMap";
import { VisibleArea } from "@/types/battle";
import { useNavigate } from "react-router-dom";
import NavigationButtons from "@/components/ui/NavigationButtons";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { useToast } from "@/hooks/use-toast";

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
  size?: number; // Размер токена
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
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [background, setBackground] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [zoom, setZoom] = useState(1);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "monster" | "boss">("player");
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [battleActive, setBattleActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
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
      size: 1, // Стандартный размер
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
    
    toast({
      title: "Токен добавлен",
      description: `${newToken.name} добавлен на поле боя.`
    });
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
      size: 1, // Стандартный размер
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
    
    toast({
      title: "Монстр добавлен",
      description: `${monster.name} добавлен на поле боя`
    });
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
    
    toast({
      title: "Токен удален",
      description: "Токен был удален с поля боя"
    });
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
      
      toast({
        title: "Инициатива брошена",
        description: `${sorted[0].name} ходит первым с результатом ${sorted[0].roll}`
      });
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
    
    const nextToken = tokens.find(t => t.id === newInitiative[nextTurnIndex].tokenId);
    toast({
      title: "Следующий ход",
      description: `Теперь ходит ${nextToken?.name || 'Неизвестный'}`
    });
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
  
  const handlePauseSession = () => {
    setSessionPaused(!sessionPaused);
    toast({
      title: sessionPaused ? "Сессия продолжена" : "Сессия на паузе",
      description: sessionPaused ? "Игра продолжается" : "Вы поставили игру на паузу"
    });
  };
  
  const handleEndSession = () => {
    if (window.confirm("Вы уверены, что хотите завершить сессию? Все данные будут потеряны.")) {
      navigate("/");
      toast({
        title: "Сессия завершена", 
        description: "Вы вернулись на главную страницу"
      });
    }
  };

  return (
    <OBSLayout>
      {/* Верхняя панель управления */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 p-2 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => navigate("/")}
          >
            <Home size={16} />
            Главная
          </Button>
          <Button 
            variant={sessionPaused ? "default" : "outline"}
            size="sm" 
            className="flex items-center gap-1"
            onClick={handlePauseSession}
          >
            {sessionPaused ? <Play size={16} /> : <Pause size={16} />}
            {sessionPaused ? "Продолжить" : "Пауза"}
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleEndSession}
          >
            <ArrowLeft size={16} />
            Завершить сессию
          </Button>
        </div>
        <div className="text-lg font-semibold">D&D Сцена боя</div>
        <div className="flex gap-2">
          <div />
        </div>
      </div>
      
      {/* Основная трехколоночная разметка */}
      <div className="grid grid-cols-[250px_1fr_300px] h-full pt-[56px] w-full">
        {/* Левая панель */}
        <div className="overflow-y-auto bg-background/95 text-foreground">
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
                    Нет инициативы. Добавьте токены и нажмите "Бросить Инициативу".
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Центральная пустая зона (сцена боя) */}
        <div className="relative w-full h-full overflow-hidden">
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
        <div className="overflow-y-auto bg-background/95 text-foreground p-4">
          {selectedTokenId ? (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Выбранный токен</h3>
              {(() => {
                const token = tokens.find(t => t.id === selectedTokenId);
                if (!token) return null;
                
                return (
                  <div className="bg-muted/10 p-3 rounded-lg border space-y-3">
                    <div className="flex gap-3 items-center">
                      <img 
                        src={token.img} 
                        alt={token.name} 
                        className="w-12 h-12 rounded-full object-cover"
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
                        <div className="text-xs text-muted-foreground">
                          {token.type === "player" ? "Игрок" : 
                           token.type === "boss" ? "Босс" : "Монстр"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Здоровье</div>
                        <div className="flex gap-1 items-center">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateTokenHP(token.id, -1)}>-</Button>
                          <div className="flex-1 text-center">{token.hp}/{token.maxHp}</div>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateTokenHP(token.id, 1)}>+</Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Класс защиты</div>
                        <div className="flex gap-1 items-center">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => {
                            setTokens(prev => prev.map(t => t.id === token.id ? {...t, ac: t.ac - 1} : t));
                          }}>-</Button>
                          <div className="flex-1 text-center">{token.ac}</div>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => {
                            setTokens(prev => prev.map(t => t.id === token.id ? {...t, ac: t.ac + 1} : t));
                          }}>+</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Состояния</div>
                      <div className="flex flex-wrap gap-1">
                        {["Оглушен", "Отравлен", "Парализован", "Испуган"].map(condition => {
                          const isActive = token.conditions?.includes(condition);
                          return (
                            <Button 
                              key={condition}
                              size="sm"
                              variant={isActive ? "default" : "outline"}
                              className={`text-xs py-1 px-2 h-auto ${isActive ? 'bg-red-500 hover:bg-red-600' : ''}`}
                              onClick={() => {
                                if (isActive) {
                                  removeCondition(token.id, condition);
                                } else {
                                  addCondition(token.id, condition);
                                }
                              }}
                            >
                              {condition}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
          
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
                  <span className="font-medium">DM:</span> Бросаем и��ициативу...
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Сообщение..." className="text-foreground" />
              <Button>Отправить</Button>
            </div>
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
      
      {/* Индикатор паузы */}
      {sessionPaused && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center">
          <div className="text-center p-8 bg-background/80 backdrop-blur-md rounded-xl border">
            <Pause className="w-20 h-20 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Сессия на паузе</h2>
            <p className="mb-6 text-muted-foreground">Вы поставили игру на паузу</p>
            <Button onClick={handlePauseSession} size="lg">
              <Play className="w-5 h-5 mr-2" /> Продолжить игру
            </Button>
          </div>
        </div>
      )}
    </OBSLayout>
  );
};

export default BattleScenePage;
