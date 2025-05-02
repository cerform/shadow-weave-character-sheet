import React, { useState, useRef, useEffect } from "react";
import LeftPanel from "@/components/battle/LeftPanel";
import EnhancedBattleMap from "@/components/battle/EnhancedBattleMap";
import BattleMap from "@/components/battle/BattleMap";
import RightPanel from "@/components/battle/RightPanel";
import BottomPanel from "@/components/battle/BottomPanel";
import TopPanel from "@/components/battle/TopPanel";
import MapControls from "@/components/battle/MapControls";
import { motion } from "framer-motion";
import { Dice1, Pause, Play, Plus, SkipForward, Users, Image, X, Crown, User, Skull, ZoomIn, ZoomOut, Scale, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3D";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { DicePanel } from "@/components/character-sheet/DicePanel";

// Типы для управления битвой
export interface Token {
  id: number;
  name: string;
  type: "player" | "monster" | "npc" | "boss";
  img: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  spellSlots?: { [key: string]: { used: number; max: number } };
  visible: boolean; // видимость для игроков
  size: number; // Размер токена
}

export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
}

// Предустановленные мобы и боссы
const monsterTokens = [
  { name: "Гоблин", hp: 7, ac: 15, img: "/assets/tokens/goblin.png" },
  { name: "Хобгоблин", hp: 11, ac: 18, img: "/assets/tokens/hobgoblin.png" },
  { name: "Орк", hp: 15, ac: 13, img: "/assets/tokens/orc.png" },
  { name: "Огр", hp: 59, ac: 11, img: "/assets/tokens/ogre.png" },
  { name: "Тролль", hp: 84, ac: 15, img: "/assets/tokens/troll.png" },
  { name: "Дракон", hp: 178, ac: 19, img: "/assets/tokens/dragon.png" },
];

// Заглушки для токенов
const defaultTokenImages = {
  player: [
    "/assets/tokens/player1.png",
    "/assets/tokens/player2.png",
    "/assets/tokens/player3.png",
    "/assets/tokens/player4.png",
  ],
  monster: [
    "/assets/tokens/monster1.png",
    "/assets/tokens/monster2.png",
    "/assets/tokens/monster3.png",
    "/assets/tokens/monster4.png",
  ],
  boss: [
    "/assets/tokens/boss1.png",
    "/assets/tokens/boss2.png",
  ],
  // Заглушки для тестирования
  placeholder: [
    "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/wizard-face.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/barbarian-face.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/dwarf-face.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/lorc/goblin-head.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/lorc/orc-head.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/dragon-head.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/lorc/troll.svg",
    "https://game-icons.net/icons/ffffff/000000/1x1/delapouite/ogre.svg",
  ]
};

const PlayBattlePage = () => {
  // Состояния для управления боем
  const [tokens, setTokens] = useState<Token[]>([]);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    round: 0,
    currentInitiativeIndex: -1,
  });
  const [mapBackground, setMapBackground] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [showWebcams, setShowWebcams] = useState<boolean>(true);
  const [showSceneMode, setShowSceneMode] = useState<boolean>(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "monster" | "npc" | "boss">("player");
  const [tokenName, setTokenName] = useState("");
  const [selectedTab, setSelectedTab] = useState("tokens");
  
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Добавляем новые состояния для тумана войны и размера сетки
  const [fogOfWar, setFogOfWar] = useState<boolean>(true);
  const [revealedCells, setRevealedCells] = useState<{[key: string]: boolean}>({});
  const [revealRadius, setRevealRadius] = useState<number>(3);
  const [gridVisible, setGridVisible] = useState<boolean>(true);
  const [gridOpacity, setGridOpacity] = useState<number>(0.5);
  const [gridSize, setGridSize] = useState<{rows: number, cols: number}>({rows: 30, cols: 40}); // Увеличили размер сетки

  // Обработчики для управления боем
  const startBattle = () => {
    if (tokens.length === 0) {
      toast({
        title: "Ошибка",
        description: "Нельзя начать сражение без участников",
        variant: "destructive",
      });
      return;
    }
    
    rollInitiative();
    setBattleState({
      isActive: true,
      round: 1,
      currentInitiativeIndex: 0,
    });
    
    toast({
      title: "Бой начался!",
      description: `Раунд 1: ${initiative[0]?.name || 'Первый персонаж'} ходит первым`,
    });
  };

  const pauseBattle = () => {
    setBattleState(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
    
    toast({
      title: battleState.isActive ? "Бой на паузе" : "Бой продолжается",
    });
  };

  const nextTurn = () => {
    if (!battleState.isActive || initiative.length === 0) return;
    
    let nextIndex = (battleState.currentInitiativeIndex + 1) % initiative.length;
    let newRound = battleState.round;
    
    if (nextIndex === 0) {
      newRound++;
    }
    
    // Обновляем активный статус участников инициативы
    const updatedInitiative = initiative.map((item, idx) => ({
      ...item,
      isActive: idx === nextIndex,
    }));
    
    setInitiative(updatedInitiative);
    setBattleState({
      ...battleState,
      round: newRound,
      currentInitiativeIndex: nextIndex,
    });
    
    const currentToken = tokens.find(t => t.id === updatedInitiative[nextIndex].tokenId);
    toast({
      title: nextIndex === 0 ? `Начался раунд ${newRound}!` : "Следующий ход",
      description: `${currentToken?.name || 'Неизвестный'} ходит`,
    });
  };

  const rollInitiative = () => {
    if (tokens.length === 0) return;
    
    const initiativeRolls = tokens.map(token => {
      // Генерируем бросок d20 + модификатор инициативы
      const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(token.initiative);
      
      return {
        id: Date.now() + token.id,
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false,
      };
    });
    
    // Сортируем по результату инициатив�� (от большег�� к меньшему)
    const sortedInitiative = [...initiativeRolls].sort((a, b) => b.roll - a.roll);
    
    // Устанавливаем первого участника активным
    if (sortedInitiative.length > 0) {
      sortedInitiative[0].isActive = true;
    }
    
    setInitiative(sortedInitiative);
  };

  // Обработчик для перетаскивания токенов
  const handleUpdateTokenPosition = (id: number, x: number, y: number) => {
    setTokens(tokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    ));
  };

  // Обработчик для выбора токена
  const handleSelectToken = (id: number | null) => {
    setSelectedTokenId(id);
  };

  // Новые функции ��з BattleScenePage
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMapBackground(reader.result as string);
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
      hp: tokenType === "boss" ? 100 : tokenType === "monster" ? 20 : 30,
      maxHp: tokenType === "boss" ? 100 : tokenType === "monster" ? 20 : 30,
      ac: tokenType === "boss" ? 17 : tokenType === "monster" ? 13 : 15,
      initiative: Math.floor(Math.random() * 5),
      conditions: [],
      resources: {},
      visible: true,
      size: 1 // Default token size
    };
    
    setTokens((prev) => [...prev, newToken]);
    
    // Add to initiative if battle is active
    if (battleState.isActive) {
      const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(newToken.initiative);
      const newInitiative: Initiative = {
        id: Date.now(),
        tokenId: newToken.id,
        name: newToken.name,
        roll,
        isActive: false,
      };
      
      const updatedInitiative = [...initiative, newInitiative].sort((a, b) => b.roll - a.roll);
      setInitiative(updatedInitiative);
    }
    
    setShowAvatarSelector(false);
    setTokenName("");
    
    toast({
      title: `Токен добавлен`,
      description: `${newToken.name} (${newToken.type}) добавлен на карту`,
    });
  };

  const handleAddPresetMonster = (monster: typeof monsterTokens[0], type: "monster" | "boss") => {
    const newToken: Token = {
      id: Date.now(),
      name: monster.name,
      type,
      img: defaultTokenImages.placeholder[Math.floor(Math.random() * defaultTokenImages.placeholder.length)], // Временно используем заглушки
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: Math.floor(Math.random() * 5),
      conditions: [],
      resources: {},
      visible: true,
      size: type === "boss" ? 1.5 : 1 // Default size, larger for bosses
    };
    
    setTokens((prev) => [...prev, newToken]);
    
    // Add to initiative if battle is active
    if (battleState.isActive) {
      const roll = Math.floor(Math.random() * 20) + 1 + Math.floor(newToken.initiative);
      const newInitiative: Initiative = {
        id: Date.now(),
        tokenId: newToken.id,
        name: newToken.name,
        roll,
        isActive: false,
      };
      
      const updatedInitiative = [...initiative, newInitiative].sort((a, b) => b.roll - a.roll);
      setInitiative(updatedInitiative);
    }
    
    toast({
      title: `Монстр добавлен`,
      description: `${newToken.name} (${newToken.type}) добавлен на карту`,
    });
  };

  const handleAddToken = (type: Token["type"]) => {
    setTokenType(type);
    setShowAvatarSelector(true);
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

  // Обработчик загрузки пользовательского токена
  const handleCustomTokenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tokenName.trim()) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newToken: Token = {
          id: Date.now(),
          name: tokenName,
          type: tokenType,
          img: reader.result as string,
          x: 100 + Math.random() * 300,
          y: 100 + Math.random() * 300,
          hp: tokenType === "boss" ? 100 : tokenType === "monster" ? 20 : 30,
          maxHp: tokenType === "boss" ? 100 : tokenType === "monster" ? 20 : 30,
          ac: tokenType === "boss" ? 17 : tokenType === "monster" ? 13 : 15,
          initiative: Math.floor(Math.random() * 5),
          conditions: [],
          resources: {},
          visible: true,
          size: tokenType === "boss" ? 1.5 : 1 // Default size, larger for bosses
        };
        
        setTokens((prev) => [...prev, newToken]);
        
        toast({
          title: `Свой токен добавлен`,
          description: `${newToken.name} (${newToken.type}) добавлен на карту`,
        });
        
        setShowAvatarSelector(false);
        setTokenName("");
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Ошибка",
        description: "Необходимо указать имя токена",
        variant: "destructive",
      });
    }
  };

  // Обработчики для тумана войны
  const handleRevealCell = (row: number, col: number) => {
    if (!fogOfWar) return;

    const newRevealed = { ...revealedCells };
    
    // Открываем клетки в радиусе
    for (let r = Math.max(0, row - revealRadius); r <= Math.min(gridSize.rows - 1, row + revealRadius); r++) {
      for (let c = Math.max(0, col - revealRadius); c <= Math.min(gridSize.cols - 1, col + revealRadius); c++) {
        // Проверяем, находится ли клетка в радиусе круга
        const distance = Math.sqrt(Math.pow(r - row, 2) + Math.pow(c - col, 2));
        if (distance <= revealRadius) {
          newRevealed[`${r}-${c}`] = true;
        }
      }
    }
    
    setRevealedCells(newRevealed);
  };
  
  const resetFogOfWar = () => {
    setRevealedCells({});
    toast({
      title: "Туман войны сброшен",
      description: "Карта снова полностью скрыта",
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Верхняя панель с расширенными элементами управления */}
      <div className="p-2 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">D&D Боевая карта</h1>
          <Button 
            size="sm" 
            onClick={() => setShowSceneMode(!showSceneMode)}
            variant={showSceneMode ? "default" : "outline"}
          >
            {showSceneMode ? "Боевой режим" : "Режим сцены"}
          </Button>
          
          {/* Элементы управления сеткой и туманом перенесены в верх��юю панель */}
          <Button
            size="sm"
            variant={gridVisible ? "default" : "outline"}
            onClick={() => setGridVisible(!gridVisible)}
            title="Показать/скрыть сетку"
          >
            <Grid3x3 size={16} className="mr-1" />
            {gridVisible ? "Скрыть сетку" : "Показать сетку"}
          </Button>
          
          <Button
            size="sm"
            variant={fogOfWar ? "default" : "outline"}
            onClick={() => setFogOfWar(!fogOfWar)}
            title="Включить/выключить туман войны"
          >
            {fogOfWar ? "Выключить туман" : "Включить туман"}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeSelector />
          
          {!showSceneMode && (
            <>
              <Button 
                size="sm" 
                onClick={startBattle}
                disabled={battleState.isActive}
              >
                <Play className="h-4 w-4 mr-1" />
                Начать бой
              </Button>
              
              <Button 
                size="sm" 
                onClick={pauseBattle}
                disabled={!battleState.isActive}
                variant="outline"
              >
                <Pause className="h-4 w-4 mr-1" />
                {battleState.isActive ? "Пауза" : "Продолжить"}
              </Button>
              
              <Button 
                size="sm" 
                onClick={nextTurn}
                disabled={!battleState.isActive}
                variant="outline"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                След. ход
              </Button>
              
              {battleState.isActive && (
                <div className="px-2 py-1 bg-primary/20 rounded text-sm">
                  Раунд: {battleState.round}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель с фиксированной шириной и прокруткой */}
        <div className="w-72 border-r bg-muted/10 overflow-y-auto p-3">
          <ScrollArea className="h-full pr-2">
            <LeftPanel
              tokens={tokens}
              setTokens={setTokens}
              initiative={initiative}
              setInitiative={setInitiative}
              selectedTokenId={selectedTokenId}
              onSelectToken={handleSelectToken}
              battleState={battleState}
              fogOfWar={fogOfWar}
              setFogOfWar={setFogOfWar}
              gridSize={gridSize}
              setGridSize={setGridSize}
            />
          </ScrollArea>
        </div>
        
        {/* Центральная карта */}
        <div className="flex-1 relative overflow-hidden">
          <EnhancedBattleMap 
            tokens={tokens}
            setTokens={setTokens}
            background={mapBackground}
            setBackground={setMapBackground}
            onUpdateTokenPosition={handleUpdateTokenPosition}
            onSelectToken={handleSelectToken}
            selectedTokenId={selectedTokenId}
            initiative={initiative}
            battleActive={battleState.isActive}
            fogOfWar={fogOfWar}
            revealedCells={revealedCells}
            onRevealCell={handleRevealCell}
            gridSize={gridSize}
            gridVisible={gridVisible}
            gridOpacity={gridOpacity}
          />
        </div>
        
        {/* Правая панель с фиксированной шириной и прокруткой */}
        <div className="w-72 border-l bg-muted/10 overflow-y-auto p-3">
          <ScrollArea className="h-full pr-2">
            {selectedTokenId !== null ? (
              <RightPanel
                selectedTokenId={selectedTokenId} 
                tokens={tokens}
                setTokens={setTokens}
              />
            ) : (
              <div className="space-y-4">
                <MapControls
                  fogOfWar={fogOfWar}
                  setFogOfWar={setFogOfWar}
                  revealRadius={revealRadius}
                  setRevealRadius={setRevealRadius}
                  gridVisible={gridVisible}
                  setGridVisible={setGridVisible}
                  gridOpacity={gridOpacity}
                  setGridOpacity={setGridOpacity}
                  onResetFogOfWar={resetFogOfWar}
                />
                
                <h3 className="font-medium mb-4">Кубики</h3>
                <div className="h-64">
                  <DicePanel />
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
            )}
          </ScrollArea>
        </div>
      </div>
      
      {/* Нижняя панель */}
      <BottomPanel 
        showWebcams={showWebcams} 
        setShowWebcams={setShowWebcams} 
      />
      
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
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Загрузить свой токен</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="flex-1 file:mr-2 file:py-1 file:px-2 file:border-0 file:rounded file:bg-primary/20 file:text-foreground"
                  onChange={handleCustomTokenUpload}
                />
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Или выберите готовый:</h4>
            <div className="grid grid-cols-4 gap-2">
              {defaultTokenImages.placeholder.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTokenSelect(img)}
                  className="p-1 border rounded hover:bg-muted transition-colors"
                >
                  <img src={img} alt={`Avatar ${idx + 1}`} className="w-full aspect-square object-contain rounded" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayBattlePage;
