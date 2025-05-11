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
  updateTokenPosition: (id: number, x: number, y: number) => void;
  background?: string;
  width?: number;
  height?: number;
  gridSize?: number;
  initiative?: InitiativeItem[];
  selectedTokenId?: number | null;
  onSelectToken?: (id: number | null) => void;
  battleActive?: boolean;
  fogOfWar?: boolean;
  revealedCells?: {row: number, col: number}[];
  onRevealCell?: (row: number, col: number) => void;
  gridVisible?: boolean;
  gridOpacity?: number;
  zoom?: number;
  isDM?: boolean;
  lightSources?: LightSource[];
  isDynamicLighting?: boolean;
  className?: string;
  showPlayerView?: boolean;
}

// Добавляем интерфейс BattleState
export interface BattleState {
  isActive: boolean;
  round: number;
  currentTurn: number;
  currentInitiativeIndex: number;  // Добавляем отсутствующее свойство
}

// Добавляем расширенный интерфейс для BattleStore
export interface BattleStore {
  tokens: Token[];
  addToken: (token: Token) => void;
  updateToken: (id: number, updates: Partial<Token>) => void;
  removeToken: (id: number) => void;
  updateTokenPosition: (id: number, x: number, y: number) => void;
  updateTokenHP: (id: number, hp: number) => void;
  
  initiative: InitiativeItem[];
  battleState: BattleState;
  startBattle: () => void;
  pauseBattle: () => void;
  nextTurn: () => void;
  
  selectedTokenId: number | null;
  selectToken: (id: number | null) => void;
  
  mapSettings: {
    background: string | null;
    fogOfWar: boolean;
    revealedCells: {row: number, col: number}[];
    gridVisible: boolean;
    gridOpacity: number;
    gridSize: {rows: number, cols: number};
    revealRadius: number;
    zoom: number;
    isDynamicLighting: boolean;
    lightSources: LightSource[];
  };
  
  setMapBackground: (url: string) => void;
  setFogOfWar: (enabled: boolean) => void;
  revealCell: (row: number, col: number) => void;
  resetFogOfWar: () => void;
  setGridVisible: (visible: boolean) => void;
  setGridOpacity: (opacity: number) => void;
  setGridSize: (size: {rows: number, cols: number}) => void;
  setRevealRadius: (radius: number) => void;
  setZoom: (zoom: number) => void;
  
  isDM: boolean;
  setIsDM: (isDM: boolean) => void;
  
  showWebcams: boolean;
  setShowWebcams: (show: boolean) => void;
  
  addLightSource: (source: Omit<LightSource, "id">) => void;
  removeLightSource: (id: number) => void;
  updateLightSource: (id: number, updates: Partial<LightSource>) => void;
  setDynamicLighting: (enabled: boolean) => void;
  attachLightToToken: (lightId: number, tokenId: number) => void;
}
