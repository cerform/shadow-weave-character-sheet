import React, { useState, useRef, useEffect } from "react";
import LeftPanelDiceRoller from "@/components/battle/LeftPanelDiceRoller";
import EnhancedBattleMap from "@/components/battle/EnhancedBattleMap";
import RightPanel from "@/components/battle/RightPanel";
import BottomPanel from "@/components/battle/BottomPanel";
import TopPanel from "@/components/battle/TopPanel";
import BattleTabs from "@/components/battle/BattleTabs";
import MapToolbar from "@/components/battle/MapToolbar";
import MapSaveLoad from "@/components/battle/MapSaveLoad";
import OBSLayout from "@/components/OBSLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { X, Dices, Copy } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";

// Импортируем наше хранилище, типы и утилиты
import useBattleStore from "@/stores/battleStore";
import { createToken } from "@/utils/battle";
import { useSessionStore } from "@/stores/sessionStore";
import { AreaEffect, LightSource } from "@/types/battle"; // Correct import for AreaEffect
import { Token, Initiative, SavedMap } from "@/types/battleTypes"; // Other battle types

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
    areaEffects, addAreaEffect, removeAreaEffect,
    lightSources, addLightSource, removeLightSource
  } = useBattleStore();
  
  // Используем SessionStore ��ля сохранения/загрузки карт
  const { currentSession, saveMap, loadMap, deleteMap } = useSessionStore();
  
  // Локальные состояния UI
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [tokenType, setTokenType] = useState<"player" | "monster" | "npc" | "boss">("player");
  const [tokenName, setTokenName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [currentAreaEffectType, setCurrentAreaEffectType] = useState<'circle' | 'cone' | 'square' | 'line' | null>(null);
  
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Обработчик дублирования токена
  const handleDuplicateToken = () => {
    if (!selectedTokenId) {
      toast({
        title: "Ошибка",
        description: "Сначала выберите токен для дублирования",
        variant: "destructive",
      });
      return;
    }
    
    const selectedToken = tokens.find(t => t.id === selectedTokenId);
    if (!selectedToken) return;
    
    // Создаем дубликат токена с небольшим смещением
    const duplicatedToken = {
      ...selectedToken,
      id: Date.now(),
      x: selectedToken.x + 50, // Небольшое смещение вправо
      y: selectedToken.y + 50, // и вниз
      name: `${selectedToken.name} (копия)`
    };
    
    addToken(duplicatedToken);
    
    toast({
      title: "Токен дублирован",
      description: `${duplicatedToken.name} добавлен на карту`,
    });
  };
  
  // Обработчики для работы с клавиатурными сочетаниями
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Дублирование токена при нажатии Ctrl+D
      if (e.ctrlKey && e.key === 'd' && isDM) {
        e.preventDefault(); // Предотвращаем стандартное поведение браузера
        handleDuplicateToken();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTokenId, tokens, isDM]);
  
  // Функция добавления эффекта области
  const handleAddAreaEffect = (type: 'circle' | 'cone' | 'square' | 'line') => {
    // Если клик был на карте, то координаты будут известны в момент клика
    setCurrentAreaEffectType(type);
    
    toast({
      title: "Выберите позицию",
      description: `Кликните на карту, чтобы разместить ${
        type === 'circle' ? 'круг' : 
        type === 'cone' ? 'конус' : 
        type === 'square' ? 'квадрат' : 'линию'
      }`,
    });
  };
  
  // Функция добавления источника света
  const handleAddLight = (type: 'torch' | 'lantern' | 'daylight') => {
    // Для примера добавляем источник света в центр карты
    // В реальном сценарии нужно дать пользователю выбрать место
    const newLight: LightSource = {
      id: Date.now().toString(),
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      radius: type === 'torch' ? 100 : type === 'lantern' ? 150 : 500,
      type,
      color: type === 'torch' ? '#ff7700' : type === 'lantern' ? '#ffaa00' : '#ffffff',
      intensity: type === 'daylight' ? 1 : 0.7
    };
    
    addLightSource(newLight);
    
    toast({
      title: `Добавлен источник света: ${type}`,
      description: type === 'daylight' ? 'Карта освещена полностью' : 
                  `Радиус освещения: ${type === 'torch' ? '6' : '10'} клеток`,
    });
  };
  
  // Функции сохранения и загрузки карты
  const handleSaveMap = (name: string) => {
    if (!currentSession) {
      toast({
        title: "Ошибка",
        description: "Нет активной сессии для сохранения карты",
        variant: "destructive",
      });
      return;
    }
    
    const mapData = {
      name,
      background: mapSettings.background,
      tokens,
      fogOfWar: mapSettings.fogOfWar,
      revealedCells: mapSettings.revealedCells,
      lighting: lightSources,
      gridSettings: {
        visible: mapSettings.gridVisible,
        opacity: mapSettings.gridOpacity,
        size: mapSettings.gridSize  // Теперь это объект { rows, cols }
      }
    };
    
    const saved = saveMap(currentSession.id, mapData);
    
    if (saved) {
      toast({
        title: "Карта сохранена",
        description: `Карта "${name}" успешно сохранена`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить карту",
        variant: "destructive",
      });
    }
  };
  
  const handleLoadMap = (mapId: string) => {
    if (!currentSession) {
      toast({
        title: "Ошибка",
        description: "Нет активной сессии для загрузки карты",
        variant: "destructive",
      });
      return;
    }
    
    const mapData = loadMap(currentSession.id, mapId);
    
    if (mapData) {
      // Загружаем данные карты в наше состояние
      setMapBackground(mapData.background || '');
      
      // Загружаем токены
      mapData.tokens.forEach(token => {
        addToken(token);
      });
      
      // Загружаем настройки сетки
      if (mapData.gridSettings) {
        setGridVisible(mapData.gridSettings.visible);
        setGridOpacity(mapData.gridSettings.opacity);
        setGridSize(mapData.gridSettings.size);  // Передаем объект { rows, cols }
      }
      
      // Загружаем туман войны
      if (typeof mapData.fogOfWar !== 'undefined') {
        setFogOfWar(mapData.fogOfWar);
      }
      
      // Загружаем освещение
      if (mapData.lighting && Array.isArray(mapData.lighting)) {
        mapData.lighting.forEach(light => {
          addLightSource(light);
        });
      }
      
      toast({
        title: "Карта загружена",
        description: `Карта "${mapData.name}" успешно загружена`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить карту",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteMap = (mapId: string) => {
    if (!currentSession) return;
    
    deleteMap(currentSession.id, mapId);
    
    toast({
      title: "Карта удалена",
      description: "Карта успешно удалена",
    });
  };

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

  // Обновленная функция добавления предустановленного монстра с использованием createToken
  const handleAddPresetMonster = (monster: PresetMonster, type: "monster" | "boss") => {
    const newToken = createToken({
      name: monster.name,
      type,
      img: defaultTokenImages.placeholder[Math.floor(Math.random() * defaultTokenImages.placeholder.length)],
      hp: monster.hp,
      ac: monster.ac,
      size: type === "boss" ? 1.5 : 1
    });
    
    addToken(newToken);
    
    toast({
      title: `Монстр добавлен`,
      description: `${newToken.name} (${newToken.type}) добавлен на карту`,
    });
  };

  const handleRevealCell = (row: number, col: number) => {
    revealCell(row, col);
  };

  // Обновленная функция выбора токена с использованием createToken
  const handleTokenSelect = (img: string) => {
    if (!tokenName) return;

    const newToken = createToken({
      name: tokenName,
      type: tokenType,
      img
    });
    
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

  // Переключение режима DM/Player
  const toggleDMMode = () => {
    setIsDM(!isDM);
    toast({
      title: !isDM ? "Режим DM активирован" : "Режим игрока активирован",
      description: !isDM ? "У вас полный доступ к управлению картой" : "Доступ к функциям ограничен",
    });
  };

  // Обработчик загрузки пользовательского токена с использованием createToken
  const handleCustomTokenUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && tokenName.trim()) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newToken = createToken({
          name: tokenName,
          type: tokenType,
          img: reader.result as string
        });
        
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
            description: "Новый фон карты у��пешно прим��нен",
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

  // Создаем панель управления картой используя обновленный компонент MapToolbar
  const mapControlPanel = (
    <MapToolbar
      zoom={mapSettings.zoom}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onResetZoom={handleResetZoom}
      onMoveMap={handleMoveMap}
      gridVisible={mapSettings.gridVisible}
      gridOpacity={mapSettings.gridOpacity}
      onToggleGrid={() => setGridVisible(!mapSettings.gridVisible)}
      onSetGridOpacity={setGridOpacity}
      fogOfWar={mapSettings.fogOfWar}
      revealRadius={mapSettings.revealRadius}
      onToggleFog={() => setFogOfWar(!mapSettings.fogOfWar)}
      onResetFog={resetFogOfWar}
      onSetRevealRadius={setRevealRadius}
      isDM={isDM}
      onToggleDMMode={toggleDMMode}
      onSaveMap={() => setShowSaveDialog(true)}
      onLoadMap={() => setShowLoadDialog(true)}
      onAddAreaEffect={handleAddAreaEffect}
      onAddLight={handleAddLight}
      onDuplicateToken={handleDuplicateToken}
      onDeleteToken={() => selectedTokenId && removeToken(selectedTokenId)}
      variant="full"
    />
  );

  // Используем OBSLayout для более структурированного расположения элементов
  return (
    <>
      <OBSLayout
        topPanelContent={
          <TopPanel
            battleState={battleState}
            onStartBattle={startBattle}
            onPauseBattle={pauseBattle}
            onNextTurn={nextTurn}
            onUploadBackground={handleMapBackgroundUpload}
            isDM={isDM}
          />
        }
        leftPanelContent={
          <LeftPanelDiceRoller playerName={isDM ? "DM" : "Игрок"} />
        }
        bottomPanelContent={
          <BottomPanel 
            showWebcams={showWebcams} 
            setShowWebcams={setShowWebcams} 
            isDM={isDM}
          />
        }
        rightPanelContent={
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
                onRevealAllFog={null} // Изменено с пустой функции на null для ясности
                onResetFog={resetFogOfWar}
                gridVisible={mapSettings.gridVisible}
                onToggleGrid={() => setGridVisible(!mapSettings.gridVisible)}
                onUpdateGridSettings={setGridSize}
                gridSize={mapSettings.gridSize}
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
                onSelectToken={selectToken}
                updateTokenHP={updateTokenHP}
                removeToken={removeToken}
                controlsPanel={mapControlPanel}
                onAddToken={handleAddToken}
                fogOfWar={mapSettings.fogOfWar}
                setFogOfWar={setFogOfWar}
                gridSize={mapSettings.gridSize}
                setGridSize={setGridSize}
                isDM={isDM}
              />
            )}
          </ScrollArea>
        }
      >
        {/* Центральная часть - карта боя */}
        <div className="relative overflow-hidden h-full" ref={mapRef}>
          <EnhancedBattleMap
            tokens={tokens}
            onAddToken={addToken}
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
            areaEffects={areaEffects}
            lightSources={lightSources}
            onMapClick={(x, y) => {
              // Если выбран тип эффекта области, добавляем его при клике
              if (currentAreaEffectType) {
                const newEffect: AreaEffect = {
                  id: Date.now().toString(),
                  type: currentAreaEffectType,
                  x,
                  y,
                  size: currentAreaEffectType === 'line' ? 10 : 5,
                  color: '#ff5500',
                  opacity: 0.4,
                  rotation: 0
                };
                addAreaEffect(newEffect);
                setCurrentAreaEffectType(null);
              }
            }}
          />
        </div>
      </OBSLayout>
      
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
      
      {/* Диалоги сохранения и загрузки карты */}
      <MapSaveLoad
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        mode="save"
        onSave={handleSaveMap}
        onLoad={() => {}}
        onDelete={() => {}}
        maps={currentSession?.savedMaps || []}
      />
      
      <MapSaveLoad
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        mode="load"
        onSave={() => {}}
        onLoad={handleLoadMap}
        onDelete={handleDeleteMap}
        maps={currentSession?.savedMaps || []}
      />
    </>
  );
};

export default PlayBattlePage;
