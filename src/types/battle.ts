
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
  initiative?: number;
  conditions?: string[];
  resources?: Record<string, number>;
  visible: boolean;
  size?: number;
  attachedLightId?: number;
}

export interface InitiativeItem {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface LightSource {
  id: number;
  type: 'torch' | 'lantern' | 'daylight' | 'custom';
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  attachedToTokenId?: number;
}

export interface VisibleArea {
  x: number;
  y: number;
  radius: number;
  tokenId: number;
}

export interface EnhancedBattleMapProps {
  tokens: Token[];
  background: string | null;
  onUpdateTokenPosition: (id: number, x: number, y: number) => void;
  onSelectToken: (id: number | null) => void;
  selectedTokenId: number | null;
  initiative: InitiativeItem[];
  battleActive: boolean;
  fogOfWar: boolean;
  revealedCells?: {row: number, col: number}[];
  onRevealCell?: (row: number, col: number) => void;
  gridSize?: number;
  gridVisible?: boolean;
  gridOpacity?: number;
  zoom?: number;
  isDM?: boolean;
  lightSources?: LightSource[];
  isDynamicLighting?: boolean;
  className?: string;
  showPlayerView?: boolean;
}
