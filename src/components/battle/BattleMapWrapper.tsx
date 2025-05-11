
import React from 'react';
import EnhancedBattleMap from './EnhancedBattleMap';
import { Token } from '@/types/battle';

// This component exists to provide type compatibility with EnhancedBattleMap
interface BattleMapWrapperProps {
  tokens: Token[];
  setTokens?: (tokens: Token[]) => void; 
  updateTokens?: (token: Token) => void;
  background: string;
  setBackground: (url: string) => void;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  gridSize: number | { rows: number; cols: number };
  setGridSize: ((size: number) => void) | ((size: { rows: number; cols: number }) => void);
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  fogEnabled: boolean;
  setFogEnabled: (enabled: boolean) => void;
  fogData: any;
  updateFogData: (data: any) => void;
  clearAllFog: () => void;
  revealAllFog: () => void;
  activePlayer: string | null;
  isClickable?: boolean;
  interactiveTokens?: boolean;
  showPlayerView?: boolean;
  [key: string]: any; // Allow any other props
}

const BattleMapWrapper: React.FC<BattleMapWrapperProps> = ({
  tokens,
  setTokens,
  updateTokens,
  background,
  setBackground,
  onUpdateTokenPosition,
  gridSize,
  setGridSize,
  showGrid,
  setShowGrid,
  fogEnabled,
  setFogEnabled,
  fogData,
  updateFogData,
  clearAllFog,
  revealAllFog,
  activePlayer,
  isClickable,
  interactiveTokens,
  showPlayerView,
  ...rest
}) => {
  // Convert gridSize to grid object if needed
  const gridObject = typeof gridSize === 'number' 
    ? { rows: gridSize, cols: gridSize } 
    : gridSize;
  
  const handleGridSizeChange = (size: { rows: number; cols: number }) => {
    if (typeof setGridSize === 'function') {
      if (typeof gridSize === 'number') {
        // If setGridSize expects a number, pass the rows (assuming square grid)
        (setGridSize as (size: number) => void)(size.rows);
      } else {
        // If setGridSize expects an object, pass the object
        (setGridSize as (size: { rows: number; cols: number }) => void)(size);
      }
    }
  };
  
  const handleTokenUpdate = (token: Token) => {
    // Handle both updateTokens and setTokens functions
    if (typeof updateTokens === 'function') {
      updateTokens(token);
    } else if (typeof setTokens === 'function') {
      const updatedTokens = tokens.map(t => 
        t.id === token.id ? token : t
      );
      setTokens(updatedTokens);
    }
  };

  // Make sure to pass only the props that EnhancedBattleMap actually accepts
  return (
    <EnhancedBattleMap
      tokens={tokens}
      background={background}
      updateTokenPosition={onUpdateTokenPosition}  // Changed from onUpdateTokenPosition to updateTokenPosition
      gridSize={gridObject.rows} // Pass only the number as required by EnhancedBattleMap
      selectedTokenId={rest.selectedTokenId}
      onSelectToken={rest.onSelectToken}
      initiative={rest.initiative}
      battleActive={rest.battleActive}
      fogOfWar={fogEnabled}
      revealedCells={fogData}
      onRevealCell={rest.onRevealCell}
      gridVisible={showGrid}
      gridOpacity={rest.gridOpacity}
      zoom={rest.zoom}
      isDM={rest.isDM}
      lightSources={rest.lightSources}
      isDynamicLighting={rest.isDynamicLighting}
      className={rest.className}
      showPlayerView={showPlayerView}
      {...rest}
    />
  );
};

export default BattleMapWrapper;
