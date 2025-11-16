import React, { useState } from "react";
import { useUserRole } from '@/hooks/use-auth';
import { useBattleMapState } from "./hooks/useBattleMapState";
import { useBattleTokens } from "./hooks/useBattleTokens";
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
import { ArrowLeft } from "lucide-react";

interface BattleMapUIProps {
  sessionId?: string;
}

export default function BattleMapUI({ sessionId }: BattleMapUIProps) {
  const navigate = useNavigate();
  const [currentTool, setCurrentTool] = useState<VTTTool>('select');
  const [use3D, setUse3D] = useState(false);

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

  const map = useBattleMapState(sessionId);
  const tokens = useBattleTokens(sessionId, map.isDM);
  
  // Calculate fog grid dimensions
  const GRID_CELL_SIZE = 50;
  const gridW = Math.ceil((map.mapSize?.width || 2000) / GRID_CELL_SIZE);
  const gridH = Math.ceil((map.mapSize?.height || 2000) / GRID_CELL_SIZE);
  
  const fog = useFogController(sessionId, 'main-map', gridW, gridH);
  const camera = useCamera();
  const layers = useMapLayers();
  const contextMenu = useBattleContextMenu();

  // Fog brush settings
  const [fogBrushRadius, setFogBrushRadius] = useState(3);
  const [fogMode, setFogMode] = useState<'reveal' | 'hide'>('reveal');

  const handleContextMenuAction = (action: string, tokenId?: string) => {
    if (action === 'delete' && tokenId) {
      tokens.handleRemoveToken(tokenId);
    }
    contextMenu.handleHideContextMenu();
  };

  const handleCreateToken = (tokenData: Partial<EnhancedToken>) => {
    tokens.handleAddToken(tokenData);
  };

  return (
    <div className="battle-map-ui w-full h-full flex relative bg-background">
      <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
      <LeftSidebar sessionId={sessionId} isDM={map.isDM} onCreateToken={handleCreateToken} />
      
      <div className="flex-1 relative overflow-hidden">
        <BattleMap2D
          mapImageUrl={map.mapUrl}
          mapWidth={map.mapSize?.width || 2000}
          mapHeight={map.mapSize?.height || 2000}
          tokens={tokens.validTokens}
          selectedTokenId={tokens.selectedId}
          fogGrid={fog.grid}
          fogWidth={fog.width}
          fogHeight={fog.height}
          gridVisible={layers.isLayerVisible('grid')}
          fogVisible={layers.isLayerVisible('fog')}
          use3D={use3D}
          onTokenClick={tokens.handleSelectToken}
          onTokenMove={tokens.handleMoveToken}
          onContextMenu={(e, tokenId) => contextMenu.handleShowContextMenu(e.clientX, e.clientY, tokenId)}
          onMapDrop={(file) => map.setMapFile(file)}
        />
        
        {/* Fog Brush Tool Overlay */}
        {(currentTool === 'fog-reveal' || currentTool === 'fog-hide') && (
          <FogBrushTool
            engine={fog.engine}
            mode={currentTool === 'fog-reveal' ? 'reveal' : 'hide'}
            radius={fogBrushRadius}
            cellSize={GRID_CELL_SIZE}
            enabled={layers.isLayerVisible('fog') && map.isDM}
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
        isDM={map.isDM}
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
