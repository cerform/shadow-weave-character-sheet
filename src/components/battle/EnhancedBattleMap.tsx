
import React from 'react';
import BattleMap from './BattleMap';
import FogOfWar from './FogOfWar';
import BattleGrid from './BattleGrid';
import { Initiative, Token } from '@/pages/PlayBattlePage';

interface EnhancedBattleMapProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  background: string | null;
  setBackground: React.Dispatch<React.SetStateAction<string | null>>;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  onSelectToken: (id: number | null) => void;
  selectedTokenId: number | null;
  initiative: Initiative[];
  battleActive: boolean;
  fogOfWar?: boolean;
  revealedCells?: { [key: string]: boolean };
  onRevealCell?: (row: number, col: number) => void;
  gridSize?: { rows: number; cols: number };
  gridVisible?: boolean;
  gridOpacity?: number;
}

const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({
  tokens,
  setTokens,
  background,
  setBackground,
  onUpdateTokenPosition,
  onSelectToken,
  selectedTokenId,
  initiative,
  battleActive,
  fogOfWar = false,
  revealedCells = {},
  onRevealCell = () => {},
  gridSize = { rows: 20, cols: 30 },
  gridVisible = true,
  gridOpacity = 0.5,
}) => {
  return (
    <div className="relative w-full h-full">
      <BattleMap
        tokens={tokens}
        setTokens={setTokens}
        background={background}
        setBackground={setBackground}
        onUpdateTokenPosition={onUpdateTokenPosition}
        onSelectToken={onSelectToken}
        selectedTokenId={selectedTokenId}
        initiative={initiative}
        battleActive={battleActive}
      />
      
      <BattleGrid 
        gridSize={gridSize}
        visible={gridVisible}
        opacity={gridOpacity}
      />
      
      <FogOfWar
        gridSize={gridSize}
        revealedCells={revealedCells}
        onRevealCell={onRevealCell}
        active={fogOfWar}
      />
    </div>
  );
};

export default EnhancedBattleMap;
