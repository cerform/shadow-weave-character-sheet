import React, { useState, useRef, useEffect } from "react";
import LeftPanelDiceRoller from "@/components/battle/LeftPanelDiceRoller";
import EnhancedBattleMap from "@/components/battle/EnhancedBattleMap";
import RightPanel from "@/components/battle/RightPanel";
import BottomPanel from "@/components/battle/BottomPanel";
import TopPanel from "@/components/battle/TopPanel";
import BattleTabs from "@/components/battle/BattleTabs";
import MapControls from "@/components/battle/MapControls";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { X, ZoomIn, ZoomOut, Scale, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { Switch } from "@/components/ui/switch";

// Импортируем наше хранилище
import useBattleStore, { Token } from "@/stores/battleStore";
import { LightSource } from "@/types/battle";

// Тип для предустановленных монстров
interface PresetMonster {
  name: string;
  hp: number;
  ac: number;
  img: string;
}

// Предустановленные мобы и боссы
const monsterTokens: PresetMonster[] = [
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
  // Используем Zustand store для состояния боя
  const {
    tokens, addToken, updateToken, removeToken, updateTokenPosition, updateTokenHP,
    initiative, battleState, startBattle, pauseBattle, nextTurn,
    selectedTokenId, selectToken,
    mapSettings, setMapBackground, setFogOfWar, revealCell, resetFogOfWar,
    setGridVisible, setGridOpacity, setGridSize, setRevealRadius, setZoom,
    isDM, setIsDM,
    showWebcams, setShowWebcams,
    // Добавляем новые методы для работы с освещением
    addLightSource, removeLightSource, updateLightSource, setDynamicLighting, attachLightToToken
  } = useBattleStore();
  
  // Локальные состояния UI, не связанные с основным функционалом
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "monster" | "npc" | "boss">("player");
  const [tokenName, setTokenName] = useState("");
  
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Состояния для сетки
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });
  const [gridScale, setGridScale] = useState(1);
  const [showPlayerView, setShowPlayerView] = useState(true);

  // Обработчики UI событий, которые будут использовать функции из хранилища
  const handleSelectToken = (id: number | null) => {
    selectToken(id);
  };

  const handleUpdateTokenPosition = (id: number, x: number, y: number) => {
    updateTokenPosition(id, x, y);
  };

  const handleAddToken = (type: "player" | "monster" | "npc" | "boss") => {
    setTokenType(type);
    setShowAvatarSelector(true);
  };

  const handleAddPresetMonster = (monster: PresetMonster, type: "monster" | "boss") => {
    const newToken = {
      id: Date.now(),
      name: monster.name,
      type,
      img: defaultTokenImages.placeholder[Math.floor(Math.random() * defaultTokenImages.placeholder.length)],
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      hp: monster.hp,
      maxHp: monster.hp,
      ac: monster.ac,
      initiative: Math.floor(Math.random() * 5),
      conditions: [],
      resources: {},
      visible: true,
      size: type === "boss" ? 1.5 : 1
    };
    
    addToken(newToken);
    
    toast({
      title: `Монстр добавлен`,
      description: `${newToken.name} (${newToken.type}) добавлен на карту`,
    });
  };

  const handleRevealCell = (row: number, col: number) => {
    revealCell(row, col);
  };

  const handleTokenSelect = (img: string) => {
    if (!tokenName) return;

    const newToken = {
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
      size: 1
    };
    
    addToken(newToken);
    
    setShowAvatarSelector(false);
    setTokenName("");
    
    toast({
      title: `Токен добавлен`,
      description: `${newToken.name} (${newToken.type}) добавлен на карту`,
    });
  };

  // Функции управления картой
  const handleZoomIn = () => {
    setZoom(mapSettings.zoom + 0.1 > 2.5 ? 2.5 : mapSettings.zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(mapSettings.zoom - 0.1 < 0.5 ? 0.5 : mapSettings.zoom - 0.1);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Функции управления сеткой
  const handleGridZoomIn = () => {
    setGridScale(prev => Math.min(prev + 0.1, 2.5));
  };

  const handleGridZoomOut = () => {
    setGridScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetGridZoom = () => {
    setGridScale(1);
  };

  const handleMoveGrid = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 20;
    switch(direction) {
      case 'up':
        setGridPosition(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'down':
        setGridPosition(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'left':
        setGridPosition(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'right':
        setGridPosition(prev => ({ ...prev, x: prev.x - step }));
        break;
    }
  };

  const handleAlignGridToMap = () => {
    setGridPosition({ x: 0, y: 0 });
    setGridScale(mapSettings.zoom);
  };

  // Properly handle grid size updates
  const handleGridSizeUpdate = (newSize: number | { rows: number, cols: number }) => {
    if (typeof newSize === 'number') {
      setGridSize(newSize);
    } else {
      // Assuming square grids, use rows value
      setGridSize(newSize.rows);
    }
  };

  // Переключение режима DM/Player
  const toggleDMMode = () => {
    setIsDM(!isDM);
    toast({
      title: !isDM ? "Режим DM активирован" : "Режим игрока активирован",
      description: !isDM ? "У вас полный доступ к управлению картой" : "Доступ к функциям ограничен",
    });
  };

  // Обработчик загрузки пользовательского токена
  const handleCustomTokenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tokenName.trim()) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newToken = {
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
          size: tokenType === "boss" ? 1.5 : 1
        };
        
        addToken(newToken);
        
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

  // Обработчик загрузки фона карты
  const handleMapBackgroundUpload = () => {
    if (!isDM) {
      toast({
        title: "Недостаточно прав",
        description: "Только DM может менять карту",
        variant: "destructive"
      });
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMapBackground(reader.result as string);
          toast({
            title: "Фон карты загружен",
            description: "Новый фон карты успешно применен",
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
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

  // Функция добавления источника све����а
  const handleAddLight = (type: 'torch' | 'lantern' | 'daylight' | 'custom', color?: string, intensity?: number) => {
    if (!isDM) {
      toast({
        title: "Недостаточно прав",
        description: "Только DM может добавлять источники света",
        variant: "destructive"
      });
      return;
    }
    
    const lightRadius = type === 'torch' ? 6 :
                       type === 'lantern' ? 10 :
                       type === 'daylight' ? 30 : 8;
    
    const lightColor = color || (
      type === 'torch' ? '#FF6A00' :
      type === 'lantern' ? '#FFD700' :
      type === 'daylight' ? '#FFFFFF' : '#4287f5'
    );
    
    const lightIntensity = intensity || (
      type === 'torch' ? 0.7 :
      type === 'lantern' ? 0.8 :
      type === 'daylight' ? 0.95 : 0.7
    );

    // Определяем позицию для нового источника света
    // Если выбран токен, прикрепляем свет к нему
    let position = { x: 200, y: 200 }; // дефолтное положение
    let attachedTokenId = undefined;
    
    if (selectedTokenId) {
      const selectedToken = tokens.find(t => t.id === selectedTokenId);
      if (selectedToken) {
        position = { x: selectedToken.x, y: selectedToken.y };
        attachedTokenId = selectedToken.id;
      }
    }
    
    // Создаем новый источник света
    const newLight: Omit<LightSource, "id"> = {
      type,
      x: position.x,
      y: position.y,
      radius: lightRadius,
      color: lightColor,
      intensity: lightIntensity,
      attachedToTokenId: attachedTokenId
    };
    
    // Добавляем источник света в хранилище
    addLightSource(newLight);
    
    // Устанавливаем динамическое освещение, если оно еще не включено
    if (!mapSettings.isDynamicLighting) {
      setDynamicLighting(true);
    }
    
    toast({
      title: `Добавлен источник света: ${type}`,
      description: type === 'daylight' ? 'Карта освещена полностью' : 
                  `Радиус освещения: ${lightRadius} клеток`,
    });
  };

  // Создаем панель управления картой для правой части
  const mapControlPanel = (
    <div className="space-y-4">
      {/* Переключение режима DM/Player */}
      <div className="bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-md mb-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Режим доступа</h3>
          <Button 
            variant={isDM ? "default" : "outline"} 
            size="sm" 
            onClick={toggleDMMode}
            style={{ background: isDM ? currentTheme.accent : undefined }}
          >
            {isDM ? "DM" : "Игрок"}
          </Button>
        </div>
        
        {isDM && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm">Предпросмотр вида игрока</span>
            <Switch
              checked={showPlayerView}
              onCheckedChange={setShowPlayerView}
              aria-label="Предпросмотр вида игрока"
            />
          </div>
        )}
      </div>
      
      <MapControls
        fogOfWar={mapSettings.fogOfWar}
        setFogOfWar={setFogOfWar}
        revealRadius={mapSettings.revealRadius}
        setRevealRadius={setRevealRadius}
        gridVisible={mapSettings.gridVisible}
        setGridVisible={setGridVisible}
        gridOpacity={mapSettings.gridOpacity}
        setGridOpacity={setGridOpacity}
        onResetFogOfWar={resetFogOfWar}
        isDM={isDM}
        // Параметры для освещения
        isDynamicLighting={mapSettings.isDynamicLighting}
        setDynamicLighting={setDynamicLighting}
        onAddLight={handleAddLight}
        // Параметры для управления картой
        onMoveMap={handleMoveMap}
        zoom={mapSettings.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        // Параметры для управления сеткой
        onMoveGrid={handleMoveGrid}
        gridScale={gridScale}
        onGridZoomIn={handleGridZoomIn}
        onGridZoomOut={handleGridZoomOut}
        onResetGridZoom={handleResetGridZoom}
        onAlignGridToMap={handleAlignGridToMap}
      />
    </div>
  );

  return (
    <div className="h-screen w-screen grid grid-cols-[250px_1fr_300px] grid-rows-[auto_1fr_auto] overflow-hidden bg-background text-foreground">
      {/* Верхняя панель - на всю ширину с кнопками управления */}
      <div className="col-span-3 border-b bg-muted/10 z-10">
        <TopPanel
          battleState={{
            ...battleState,
            currentInitiativeIndex: battleState.currentTurn || 0 // Add the missing property
          }}
          onStartBattle={startBattle}
          onPauseBattle={pauseBattle}
          onNextTurn={nextTurn}
          onUploadBackground={handleMapBackgroundUpload}
          isDM={isDM}
          // Передаем функции управления картой
          onToggleGrid={() => setGridVisible(!mapSettings.gridVisible)}
          gridVisible={mapSettings.gridVisible}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomLevel={Math.round(mapSettings.zoom * 100)}
          onToggleFogOfWar={() => setFogOfWar(!mapSettings.fogOfWar)}
          fogOfWar={mapSettings.fogOfWar}
        />
      </div>
      
      {/* Левая панель - кубики */}
      <div className="row-span-1 border-r bg-muted/10 overflow-y-auto">
        <LeftPanelDiceRoller playerName={isDM ? "DM" : "Игрок"} />
      </div>
      
      {/* Центральная часть - карта боя */}
      <div className="relative overflow-hidden w-full h-full">
        <EnhancedBattleMap
          tokens={tokens}
          updateTokens={addToken} // Replace 'setTokens' with something compatible like 'updateTokens'
          background={mapSettings.background}
          setBackground={setMapBackground}
          onUpdateTokenPosition={handleUpdateTokenPosition}
          onSelectToken={handleSelectToken}
          selectedTokenId={selectedTokenId}
          initiative={initiative}
          battleActive={battleState.isActive}
          fogOfWar={mapSettings.fogOfWar}
          revealedCells={mapSettings.revealedCells}
          onRevealCell={handleRevealCell}
          gridSize={mapSettings.gridSize}
          gridVisible={mapSettings.gridVisible}
          gridOpacity={mapSettings.gridOpacity}
          zoom={mapSettings.zoom}
          isDM={isDM}
          lightSources={mapSettings.lightSources}
          isDynamicLighting={mapSettings.isDynamicLighting}
          className="w-full h-full"
          showPlayerView={showPlayerView && isDM}
        />
      </div>
      
      {/* Правая панель - управление токенами и настройки */}
      <div className="border-l bg-muted/10 overflow-y-auto">
        <ScrollArea className="h-full pr-2">
          {selectedTokenId !== null ? (
            <RightPanel
              tokens={tokens}
              selectedTokenId={selectedTokenId}
              onSelectToken={selectToken}
              onAddToken={addToken}
              onRemoveToken={removeToken}
              onStartBattle={startBattle}
              onEndBattle={pauseBattle}
              onRollInitiative={nextTurn}
              initiative={initiative}
              battleActive={battleState.isActive}
              fogOfWar={mapSettings.fogOfWar}
              onToggleFogOfWar={() => setFogOfWar(!mapSettings.fogOfWar)}
              onRevealAllFog={() => {}} // Добавим пустую функцию для примера
              onResetFog={resetFogOfWar}
              gridVisible={mapSettings.gridVisible}
              onToggleGrid={() => setGridVisible(!mapSettings.gridVisible)}
              onUpdateGridSettings={(newSize) => handleGridSizeUpdate(newSize)} // Fix the type mismatch
              gridSize={{ rows: mapSettings.gridSize, cols: mapSettings.gridSize }} // Fix the type mismatch
              zoom={mapSettings.zoom}
              onZoomChange={setZoom}
              isDM={isDM}
            />
          ) : (
            <BattleTabs
              tokens={tokens}
              addToken={addToken}
              initiative={initiative}
              selectedTokenId={selectedTokenId}
              onSelectToken={handleSelectToken}
              updateTokenHP={updateTokenHP}
              removeToken={removeToken}
              controlsPanel={mapControlPanel}
              onAddToken={handleAddToken}
              fogOfWar={mapSettings.fogOfWar}
              setFogOfWar={setFogOfWar}
              gridSize={{ rows: mapSettings.gridSize, cols: mapSettings.gridSize }} // Fix the type mismatch
              setGridSize={(size) => handleGridSizeUpdate(size.rows)} // Adapt the size parameter
              isDM={isDM}
            />
          )}
        </ScrollArea>
      </div>
      
      {/* Нижняя панель - на всю ширину */}
      <div className="col-span-3 border-t bg-muted/10">
        <BottomPanel 
          showWebcams={showWebcams} 
          setShowWebcams={setShowWebcams} 
          isDM={isDM}
        />
      </div>
      
      {/* Модальное окно выбора аватара */}
      {showAvatarSelector && isDM && (
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
              <label className="block text-sm font-medium mb-1">Выберите тип токена</label>
              <div className="grid grid-cols-3 gap-2">
                {defaultTokenImages.placeholder.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="bg-card p-2 rounded border hover:border-primary cursor-pointer"
                    onClick={() => handleTokenSelect(img)}
                  >
                    <img 
                      src={img} 
                      alt={`Avatar ${idx+1}`} 
                      className="w-full h-20 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                variant="outline"
                className="mr-2"
                onClick={() => setShowAvatarSelector(false)}
              >
                Отмена
              </Button>
              <label className="bg-primary text-primary-foreground py-2 px-4 rounded cursor-pointer">
                Загрузить свой
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleCustomTokenUpload}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayBattlePage;
