import React, { useState, useMemo, useCallback } from "react";
import { useBattleController } from "./hooks/useBattleController";
import { useFogController } from "./hooks/useFogController";
import { useCamera } from "./hooks/useCamera";
import { useMapLayers } from "./hooks/useMapLayers";
import { useBattleContextMenu } from "./hooks/useBattleContextMenu";
import { BattleMap2D } from "./map/BattleMap2D";
import { Toolbar } from "./ui/Toolbar";
import { ZoomControls } from "./ui/ZoomControls";
import { LeftSidebar } from "./sidebars/LeftSidebar";
import { RightSidebar } from "./sidebars/RightSidebar";
import { ContextMenuPortal } from "./ui/ContextMenuPortal";
import { FogBrushTool } from "@/modules/fog/FogBrushTool";
import type { VTTTool, EnhancedToken } from "./types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BattleMapUIProps {
  sessionId?: string;
}

export default function BattleMapUI({ sessionId }: BattleMapUIProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTool, setCurrentTool] = useState<VTTTool>('select');
  const [use3D, setUse3D] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Главный контроллер боя
  const battle = useBattleController(sessionId || '');
  
  // Вспомогательные системы
  const camera = useCamera();
  const layers = useMapLayers();
  const contextMenu = useBattleContextMenu();

  // Fog of war с правильными размерами
  const GRID_CELL_SIZE = 50;
  const { gridW, gridH } = useMemo(() => {
    const width = battle.state?.mapSize?.width || 2000;
    const height = battle.state?.mapSize?.height || 2000;
    return {
      gridW: Math.ceil(width / GRID_CELL_SIZE),
      gridH: Math.ceil(height / GRID_CELL_SIZE)
    };
  }, [battle.state?.mapSize]);
  
  const fog = useFogController(sessionId || '', 'main-map', gridW, gridH);

  // Fog brush settings
  const [fogBrushRadius, setFogBrushRadius] = useState(3);

  // Проверка валидности сессии
  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground mb-4">Некорректный ID сессии</p>
        <Button onClick={() => navigate('/dm')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться
        </Button>
      </div>
    );
  }

  // Загрузка
  if (battle.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Загрузка боевой карты...</p>
      </div>
    );
  }

  // Ошибка
  if (battle.error || !battle.state) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-destructive mb-4">
          Ошибка загрузки: {battle.error?.message || 'Неизвестная ошибка'}
        </p>
        <Button onClick={() => navigate('/dm')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться
        </Button>
      </div>
    );
  }

  // Конвертируем токены в формат EnhancedToken
  const enhancedTokens: EnhancedToken[] = battle.state.tokens.map(token => ({
    id: token.id,
    name: token.name,
    position: token.position,
    hp: token.hp,
    maxHp: token.maxHp,
    ac: token.ac,
    speed: 30,
    size: token.size,
    color: token.color || '#3b82f6',
    initiative: 0,
    conditions: [],
    isEnemy: false,
    isVisible: token.isVisible,
    image_url: token.imageUrl,
  }));

  // Обработчики событий
  const handleContextMenuAction = useCallback((action: string, tokenId?: string) => {
    if (action === 'delete' && tokenId) {
      battle.removeToken(tokenId).then(() => {
        toast({
          title: "Токен удален",
          description: "Токен успешно удален с карты",
        });
      });
    }
    contextMenu.handleHideContextMenu();
  }, [battle, contextMenu, toast]);

  const handleCreateToken = useCallback((tokenData: Partial<EnhancedToken>) => {
    battle.addToken({
      name: tokenData.name,
      position: tokenData.position,
      hp: tokenData.hp,
      maxHp: tokenData.maxHp,
      ac: tokenData.ac,
      size: tokenData.size,
      color: tokenData.color,
      imageUrl: tokenData.image_url,
      isVisible: tokenData.isVisible,
    }).then(() => {
      toast({
        title: "Токен создан",
        description: `${tokenData.name} добавлен на карту`,
      });
    });
  }, [battle, toast]);

  const handleTokenMove = useCallback((tokenId: string, position: [number, number, number]) => {
    battle.updateToken(tokenId, { position });
  }, [battle]);

  const handleMapFile = useCallback(async (file: File) => {
    try {
      await battle.setMap(file);
      toast({
        title: "Карта загружена",
        description: "Карта успешно загружена и синхронизирована",
      });
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить карту",
        variant: "destructive",
      });
    }
  }, [battle, toast]);

  const handleMapUrl = useCallback(async (url: string) => {
    try {
      await battle.setMapFromUrl(url);
      toast({
        title: "Карта загружена",
        description: "Карта успешно загружена по URL",
      });
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить карту по URL",
        variant: "destructive",
      });
    }
  }, [battle, toast]);

  return (
    <div className="battle-map-ui w-full h-full flex relative bg-background">
      <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
      
      <LeftSidebar 
        sessionId={sessionId} 
        isDM={battle.state.isDM} 
        onCreateToken={handleCreateToken}
        onMapFile={handleMapFile}
        onMapUrl={handleMapUrl}
        currentMapUrl={battle.state.mapUrl}
      />
      
      <div className="flex-1 relative overflow-hidden">
        <BattleMap2D
          mapImageUrl={battle.state.mapUrl}
          mapWidth={battle.state.mapSize.width}
          mapHeight={battle.state.mapSize.height}
          tokens={enhancedTokens}
          selectedTokenId={selectedTokenId}
          fogGrid={fog.grid}
          fogWidth={fog.width}
          fogHeight={fog.height}
          gridVisible={layers.isLayerVisible('grid')}
          fogVisible={layers.isLayerVisible('fog')}
          use3D={use3D}
          onTokenClick={setSelectedTokenId}
          onTokenMove={handleTokenMove}
          onContextMenu={(e, tokenId) => contextMenu.handleShowContextMenu(e.clientX, e.clientY, tokenId)}
          onMapDrop={handleMapFile}
        />
        
        {/* Fog Brush Tool Overlay */}
        {(currentTool === 'fog-reveal' || currentTool === 'fog-hide') && (
          <FogBrushTool
            engine={fog.engine}
            mode={currentTool === 'fog-reveal' ? 'reveal' : 'hide'}
            radius={fogBrushRadius}
            cellSize={GRID_CELL_SIZE}
            enabled={layers.isLayerVisible('fog') && battle.state.isDM}
            onDraw={() => {
              // Batched updates handled by useFogController
            }}
          />
        )}
        
        <ZoomControls
          zoom={camera.zoom}
          onZoomIn={camera.handleZoomIn}
          onZoomOut={camera.handleZoomOut}
          onReset={camera.handleReset}
        />
      </div>

      <RightSidebar
        layers={layers.layers}
        isDM={battle.state.isDM}
        onToggleLayer={layers.handleToggleLayer}
        onToggleLayerLock={layers.handleToggleLayerLock}
      />

      <ContextMenuPortal
        contextMenu={contextMenu.contextMenu}
        onClose={contextMenu.handleHideContextMenu}
        onAction={handleContextMenuAction}
      />
    </div>
  );
}
