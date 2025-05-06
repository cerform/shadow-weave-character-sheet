
import React, { useEffect, useState } from 'react';
import BattleMap from './BattleMap';
import { Token } from '@/stores/battleStore';
import { FogOfWar } from './FogOfWar';
import { LightSource } from '@/types/battle';

// Adding proper interfaces for props
interface EnhancedBattleMapProps {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
  background: string | null;
  setBackground: React.Dispatch<React.SetStateAction<string | null>>;
  updateTokenPosition: (id: number, x: number, y: number) => void;
  initiative: any[];
  battleActive: boolean;
}

const EnhancedBattleMap: React.FC<EnhancedBattleMapProps> = ({
  tokens,
  setTokens,
  selectedTokenId,
  onSelectToken,
  background,
  setBackground,
  updateTokenPosition,
  initiative,
  battleActive
}) => {
  const [lightSources, setLightSources] = useState<LightSource[]>([]);
  const [zoom, setZoom] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  return (
    <div className="relative w-full h-full">
      <BattleMap
        tokens={tokens}
        setTokens={setTokens}
        background={background}
        setBackground={setBackground}
        onUpdateTokenPosition={updateTokenPosition}
        onSelectToken={onSelectToken}
        selectedTokenId={selectedTokenId}
        initiative={initiative}
        battleActive={battleActive}
      />
      <FogOfWar 
        lights={lightSources} 
        scale={zoom}
        mapOffset={mapOffset}
      />
    </div>
  );
};

export default EnhancedBattleMap;
