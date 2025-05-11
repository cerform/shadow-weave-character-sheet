
import React from 'react';
import EnhancedBattleMap from './EnhancedBattleMap';
import { Token } from '@/types/battle';

// This component exists to provide type compatibility with EnhancedBattleMap
interface BattleMapWrapperProps {
  tokens: Token[];
  setTokens: (tokens: Token[]) => void; // or updateTokens in some files
  background: string;
  setBackground: (url: string) => void;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
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
      // If setGridSize expects a number, pass the rows (assuming square grid)
      setGridSize(size.rows);
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

  return (
    <EnhancedBattleMap
      tokens={tokens}
      background={background}
      setBackground={setBackground}
      onUpdateTokenPosition={onUpdateTokenPosition}
      gridSize={gridObject}
      setGridSize={handleGridSizeChange}
      showGrid={showGrid}
      setShowGrid={setShowGrid}
      fogEnabled={fogEnabled}
      setFogEnabled={setFogEnabled}
      fogData={fogData}
      updateFogData={updateFogData}
      clearAllFog={clearAllFog}
      revealAllFog={revealAllFog}
      activePlayer={activePlayer}
      isClickable={isClickable}
      interactiveTokens={interactiveTokens}
      showPlayerView={showPlayerView}
      {...rest}
    />
  );
};

export default BattleMapWrapper;
