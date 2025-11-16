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
import type { VTTTool, EnhancedToken } from "./types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BattleMapUIProps {
  sessionId?: string;
}

export default function BattleMapUI({ sessionId }: BattleMapUIProps) {
  const navigate = useNavigate();
  const { isDM } = useUserRole();
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

  const map = useBattleMapState(sessionId, isDM);
  const tokens = useBattleTokens(sessionId, isDM);
  const fog = useFogController(sessionId);
  const camera = useCamera();
  const layers = useMapLayers();
  const contextMenu = useBattleContextMenu();

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
      <LeftSidebar sessionId={sessionId} isDM={isDM} onCreateToken={handleCreateToken} />
      
      <div className="flex-1 relative overflow-hidden">
        <BattleMap2D
          mapImageUrl={map.mapImageUrl}
          mapWidth={map.mapDimensions.width}
          mapHeight={map.mapDimensions.height}
          tokens={tokens.validTokens}
          selectedTokenId={tokens.selectedId}
          fogData={fog.fogData}
          gridVisible={layers.isLayerVisible('grid')}
          fogVisible={layers.isLayerVisible('fog')}
          use3D={use3D}
          onTokenClick={tokens.handleSelectToken}
          onTokenMove={tokens.handleMoveToken}
          onContextMenu={(e, tokenId) => contextMenu.handleShowContextMenu(e.clientX, e.clientY, tokenId)}
          onMapDrop={map.handleMapUpload}
        />
        <ZoomControls
          zoom={camera.zoom}
          onZoomIn={camera.handleZoomIn}
          onZoomOut={camera.handleZoomOut}
          onReset={camera.handleReset}
        />
      </div>

      <RightSidebar
        layers={layers.layers}
        isDM={isDM}
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
