import React, { useState, useRef, useEffect } from "react";
import LeftPanel from "@/components/battle/LeftPanel";
import EnhancedBattleMap from "@/components/battle/EnhancedBattleMap";
import BattleMap from "@/components/battle/BattleMap";
import RightPanel from "@/components/battle/RightPanel";
import BottomPanel from "@/components/battle/BottomPanel";
import TopPanel from "@/components/battle/TopPanel";
import MapControls from "@/components/battle/MapControls";
import BattleTabs from "@/components/battle/BattleTabs";
import { motion } from "framer-motion";
import { Dice1, Pause, Play, Plus, SkipForward, Users, Image, X, Crown, User, Skull, ZoomIn, ZoomOut, Scale, Grid3x3, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { DiceRoller3D } from "@/components/character-sheet/DiceRoller3DFixed";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { DicePanel } from "@/components/character-sheet/DicePanel";
import MapControlBox from "@/components/battle/MapControlBox";
import OBSLayout from "@/components/OBSLayout";
import LeftPanelDiceRoller from "@/components/battle/LeftPanelDiceRoller";

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
  const [zoom, setZoom] = useState(1);

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
    
    // Сортируем по результату инициатив (от большег к меньшему)
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

  // Новые функции з BattleScenePage
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

  // Функции управления зумом
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };
  
  // Переключение видимости сетки
  const toggleGridVisible = () => {
    setGridVisible(!gridVisible);
  };
  
  // Переключение тумана войны
  const toggleFogOfWar = () => {
    setFogOfWar(!fogOfWar);
  };

  // Перемещение карты в указанном направлении
  const handleMoveMap = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!mapRef.current) return;
    
    const step = 100; // шаг перемещения в пикселях
    
    switch (direction) {
      case 'up':
        mapRef.current.scrollBy(0, -step);
        break;
      case 'down':
        mapRef.current.scrollBy(0, step);
        break;
      case 'left':
        mapRef.current.scrollBy(-step, 0);
        break;
      case 'right':
        mapRef.current.scrollBy(step, 0);
        break;
    }
  };

  // Функция добавления источника света
  const handleAddLight = (type: 'torch' | 'lantern' | 'daylight') => {
    // Здесь будет логика добавления источника света
    // Сейчас просто показываем уведомление
    toast({
      title: `Добавлен источник света: ${type}`,
      description: type === 'daylight' ? 'Карта освещена полностью' : 
                  `Радиус освещения: ${type === 'torch' ? '6' : '10'} клеток`,
    });
  };

  // Создаем панель управления картой для правой части
  const mapControlPanel = (
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
      
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md">
        <h3 className="font-medium mb-3">Управление картой</h3>
        
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm font-medium">Масштаб</div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={handleZoomOut} className="h-8 w-8">
                <ZoomOut size={16} />
              </Button>
              <div className="flex-1 text-center text-sm">
                {Math.round(zoom * 100)}%
              </div>
              <Button size="icon" variant="outline" onClick={handleZoomIn} className="h-8 w-8">
                <ZoomIn size={16} />
              </Button>
              <Button size="sm" variant="secondary" onClick={handleResetZoom} className="h-8">
                <Scale size={14} className="mr-1" /> Сброс
              </Button>
            </div>
          </div>
          
          <div>
            <div className="mb-1 text-sm font-medium">Перемещение карты</div>
            <div className="grid grid-cols-3 gap-1 place-items-center">
              <div></div>
              <Button size="icon" variant="outline" onClick={() => handleMoveMap('up')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </Button>
              <div></div>
              
              <Button size="icon" variant="outline" onClick={() => handleMoveMap('left')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Button>
              <div className="text-xs text-muted-foreground">Двигать</div>
              <Button size="icon" variant="outline" onClick={() => handleMoveMap('right')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Button>
              
              <div></div>
              <Button size="icon" variant="outline" onClick={() => handleMoveMap('down')} className="h-8 w-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </Button>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md">
        <h3 className="font-medium mb-3">Освещение</h3>
        
        <div className="space-y-3">
          <div>
            <div className="mb-1 text-sm font-medium">Добавить источник света</div>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleAddLight('torch')}
                className="h-auto py-2 flex flex-col items-center"
                style={{ color: currentTheme.accent }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2c.46 0 .9.18 1.23.5.32.34.5.78.5 1.24v1.52l4.09 4.1c.34.33.51.77.51 1.21V13c0 1.1-.9 2-2 2h-8.63c-.97 0-1.84-.76-1.97-1.71a2 2 0 0 1 .51-1.98l4.09-4.1V3.74c0-.46.18-.9.5-1.23A1.74 1.74 0 0 1 12 2Z"/>
                  <path d="M8 15v3c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-3"/>
                  <path d="M13 22H11"/>
                </svg>
                <span className="text-xs">Факел</span>
                <span className="text-[10px] text-muted-foreground">радиус 6</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleAddLight('lantern')}
                className="h-auto py-2 flex flex-col items-center"
                style={{ color: currentTheme.accent }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21h6"/>
                  <path d="M12 21v-6"/>
                  <path d="M15 9.25a3 3 0 1 0-6 0v1.5L6 12c0 .94.33 1.85.93 2.57A5.02 5.02 0 0 0 12 17c2.22 0 4.17-1.44 4.83-3.55l-1.83-1.7v-2.5Z"/>
                </svg>
                <span className="text-xs">Фонарь</span>
                <span className="text-[10px] text-muted-foreground">радиус 10</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleAddLight('daylight')}
                className="h-auto py-2 flex flex-col items-center"
                style={{ color: currentTheme.accent }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M5 5l1.4 1.4"/>
                  <path d="M17.6 17.6 19 19"/>
                  <path d="M2 12h2"/>
                  <path d="M20 12h2"/>
                  <path d="M5 19l1.4-1.4"/>
                  <path d="M17.6 6.4 19 5"/>
                </svg>
                <span className="text-xs">Дневной</span>
                <span className="text-[10px] text-muted-foreground">по всей карте</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Верхняя панель с расширенными элементами управления */}
      <TopPanel
        battleState={battleState}
        onStartBattle={startBattle}
        onPauseBattle={pauseBattle}
        onNextTurn={nextTurn}
      />
      
      {/* Основной контент */}
      <div className="flex-1 overflow-hidden">
        <OBSLayout 
          leftPanelContent={<LeftPanelDiceRoller />}
        >
          <div className="flex flex-col h-full">
            {/* Центральная карта */}
            <div className="flex-1 relative overflow-hidden" ref={mapRef}>
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
          </div>
        </OBSLayout>
      </div>
      
      {/* Правая панель */}
      <div className="w-72 border-l bg-muted/10 overflow-y-auto absolute top-14 right-0 bottom-0">
        <ScrollArea className="h-full pr-2">
          {selectedTokenId !== null ? (
            <RightPanel
              selectedTokenId={selectedTokenId} 
              tokens={tokens}
              setTokens={setTokens}
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
          ) : (
            <BattleTabs
              tokens={tokens}
              setTokens={setTokens}
              initiative={initiative}
              selectedTokenId={selectedTokenId}
              onSelectToken={handleSelectToken}
              updateTokenHP={updateTokenHP}
              removeToken={removeToken}
              controlsPanel={mapControlPanel}
            />
          )}
        </ScrollArea>
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
              <label
