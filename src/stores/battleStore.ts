import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Token {
  id: number;
  name: string;
  type: 'player' | 'monster' | 'boss' | 'npc';
  x: number;
  y: number;
  maxHp: number;
  hp: number;
  isVisible: boolean;
  visible?: boolean; // Compatibility with older code
  scale?: number;
  rotation?: number;
  img?: string;
  ac?: number;
  initiative?: number;
  conditions?: string[];
  characterId?: string;
  tokenColor?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan' | number;
  resources?: Record<string, { max: number; used: number }>;
}

export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface MapSettings {
  gridSize: number;
  width: number;
  height: number;
  showGrid: boolean;
  backgroundImage?: string;
  background?: string;
  fogOfWar: boolean;
  gridVisible: boolean;
  gridOpacity: number;
  revealRadius: number;
  zoom: number;
  revealedCells: { row: number, col: number }[];
  isDynamicLighting: boolean;
  lightSources: any[];
}

export interface BattleState {
  tokens: Token[];
  initiative: Initiative[];
  activeTokenId: number | null;
  battleState: {
    isActive: boolean;
    round: number;
  };
  round: number;
  mapSettings: MapSettings;
  
  // Token management
  setTokens: (tokens: Token[]) => void;
  addToken: (token: Omit<Token, 'id'>) => void;
  removeToken: (tokenId: number) => void;
  updateToken: (tokenId: number, updates: Partial<Token>) => void;
  updateTokenPosition: (tokenId: number, x: number, y: number) => void;
  updateTokenHP: (tokenId: number, hp: number) => void;
  setActiveTokenId: (tokenId: number | null) => void;
  
  // Initiative management
  setInitiative: (initiative: Initiative[]) => void;
  addToInitiative: (tokenId: number, roll: number) => void;
  removeFromInitiative: (initiativeId: number) => void;
  clearInitiative: () => void;
  nextTurn: () => void;
  startBattle: () => void;
  pauseBattle: () => void;
  endBattle: () => void;
  
  // Map settings
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  setMapBackground: (background: string) => void;
  setFogOfWar: (fogOfWar: boolean) => void;
  setGridVisible: (gridVisible: boolean) => void;
  setGridOpacity: (opacity: number) => void;
  setGridSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setRevealRadius: (radius: number) => void;
  revealCell: (row: number, col: number) => void;
  resetFogOfWar: () => void;
  
  // Other settings
  isDM: boolean;
  setIsDM: (isDM: boolean) => void;
  showWebcams: boolean;
  setShowWebcams: (show: boolean) => void;
  
  // Lighting
  addLightSource: (light: any) => void;
  removeLightSource: (id: number) => void;
  updateLightSource: (id: number, updates: any) => void;
  setDynamicLighting: (enabled: boolean) => void;
  attachLightToToken: (lightId: number, tokenId: number) => void;
  
  // Selection
  selectedTokenId: number | null;
  selectToken: (id: number | null) => void;
}

export const useBattleStore = create<BattleState>()(
  devtools(
    persist(
      (set, get) => ({
        tokens: [],
        initiative: [],
        activeTokenId: null,
        battleState: {
          isActive: false,
          round: 1
        },
        round: 1,
        selectedTokenId: null,
        mapSettings: {
          gridSize: 50,
          width: 1500,
          height: 1000,
          showGrid: true,
          gridVisible: true,
          gridOpacity: 0.5,
          fogOfWar: false,
          revealRadius: 5,
          zoom: 1,
          revealedCells: [],
          isDynamicLighting: false,
          lightSources: []
        },
        isDM: true,
        showWebcams: false,
        
        setTokens: (tokens: Token[]) => set({ tokens }),
        
        addToken: (token) => {
          const tokens = get().tokens;
          const newId = tokens.length > 0 
            ? Math.max(...tokens.map(t => t.id)) + 1 
            : 1;
          
          set({
            tokens: [
              ...tokens,
              {
                ...token,
                id: newId,
              },
            ],
          });
        },
        
        removeToken: (tokenId) => {
          set({
            tokens: get().tokens.filter((token) => token.id !== tokenId),
            initiative: get().initiative.filter((item) => item.tokenId !== tokenId),
          });
        },
        
        updateToken: (tokenId, updates) => {
          set({
            tokens: get().tokens.map((token) =>
              token.id === tokenId ? { ...token, ...updates } : token
            ),
          });
        },
        
        updateTokenPosition: (tokenId, x, y) => {
          set({
            tokens: get().tokens.map((token) =>
              token.id === tokenId ? { ...token, x, y } : token
            ),
          });
        },
        
        updateTokenHP: (tokenId, hp) => {
          set({
            tokens: get().tokens.map((token) =>
              token.id === tokenId ? { ...token, hp } : token
            ),
          });
        },
        
        setActiveTokenId: (tokenId) => set({ activeTokenId: tokenId }),
        
        selectToken: (id) => set({ selectedTokenId: id }),
        
        // Initiative
        setInitiative: (initiative) => set({ initiative }),
        
        addToInitiative: (tokenId, roll) => {
          const token = get().tokens.find((t) => t.id === tokenId);
          if (!token) return;
          
          // Проверим, не добавлен ли уже этот токен в инициативу
          const existingInitiative = get().initiative.find((i) => i.tokenId === tokenId);
          if (existingInitiative) return;
          
          const initiative = get().initiative;
          const newId = initiative.length > 0 
            ? Math.max(...initiative.map(i => i.id)) + 1 
            : 1;
          
          const newInitiative = [
            ...initiative,
            {
              id: newId,
              tokenId,
              name: token.name,
              roll,
              isActive: false,
            },
          ].sort((a, b) => b.roll - a.roll);
          
          set({ initiative: newInitiative });
        },
        
        removeFromInitiative: (initiativeId) => {
          set({
            initiative: get().initiative.filter((item) => item.id !== initiativeId),
          });
        },
        
        clearInitiative: () => set({ 
          initiative: [], 
          battleState: { isActive: false, round: 1 }, 
          round: 1 
        }),
        
        nextTurn: () => {
          const initiative = get().initiative;
          if (initiative.length === 0) return;
          
          let activeIndex = initiative.findIndex((item) => item.isActive);
          
          // Если активного нет или это последний в инициативе
          if (activeIndex === -1 || activeIndex === initiative.length - 1) {
            activeIndex = 0;
            // Если это последний был, то следующий раунд
            if (initiative.some((item) => item.isActive)) {
              set({ 
                round: get().round + 1,
                battleState: { ...get().battleState, round: get().round + 1 }
              });
            }
          } else {
            activeIndex++;
          }
          
          const newInitiative = initiative.map((item, i) => ({
            ...item,
            isActive: i === activeIndex,
          }));
          
          set({ initiative: newInitiative });
          
          // Установим активный токен
          const activeTokenId = newInitiative[activeIndex].tokenId;
          set({ activeTokenId });
        },
        
        startBattle: () => {
          if (get().initiative.length === 0) return;
          
          // Активируем первого в инициативе
          const newInitiative = get().initiative.map((item, i) => ({
            ...item,
            isActive: i === 0,
          }));
          
          set({ 
            initiative: newInitiative, 
            battleState: { isActive: true, round: 1 },
            round: 1,
            // Установим активный токен
            activeTokenId: newInitiative[0].tokenId
          });
        },
        
        pauseBattle: () => set({ 
          battleState: { ...get().battleState, isActive: false } 
        }),
        
        endBattle: () => set({ 
          battleState: { isActive: false, round: 1 }, 
          round: 1 
        }),
        
        // Map settings
        updateMapSettings: (settings) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              ...settings,
            },
          });
        },
        
        setMapBackground: (background) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              background
            }
          });
        },
        
        setFogOfWar: (fogOfWar) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              fogOfWar
            }
          });
        },
        
        setGridVisible: (gridVisible) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              gridVisible
            }
          });
        },
        
        setGridOpacity: (gridOpacity) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              gridOpacity
            }
          });
        },
        
        setGridSize: (gridSize) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              gridSize
            }
          });
        },
        
        setZoom: (zoom) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              zoom
            }
          });
        },
        
        setRevealRadius: (revealRadius) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              revealRadius
            }
          });
        },
        
        revealCell: (row, col) => {
          const revealedCells = get().mapSettings.revealedCells || [];
          const cellExists = revealedCells.some(c => c.row === row && c.col === col);
          
          if (!cellExists) {
            set({
              mapSettings: {
                ...get().mapSettings,
                revealedCells: [...revealedCells, { row, col }]
              }
            });
          }
        },
        
        resetFogOfWar: () => {
          set({
            mapSettings: {
              ...get().mapSettings,
              revealedCells: []
            }
          });
        },
        
        // DM mode
        setIsDM: (isDM) => set({ isDM }),
        
        // Webcams
        setShowWebcams: (showWebcams) => set({ showWebcams }),
        
        // Lighting
        addLightSource: (light) => {
          const lightSources = get().mapSettings.lightSources || [];
          const newId = lightSources.length > 0
            ? Math.max(...lightSources.map(l => l.id)) + 1
            : 1;
            
          set({
            mapSettings: {
              ...get().mapSettings,
              lightSources: [
                ...lightSources,
                { ...light, id: newId }
              ]
            }
          });
        },
        
        removeLightSource: (id) => {
          const lightSources = get().mapSettings.lightSources || [];
          set({
            mapSettings: {
              ...get().mapSettings,
              lightSources: lightSources.filter(l => l.id !== id)
            }
          });
        },
        
        updateLightSource: (id, updates) => {
          const lightSources = get().mapSettings.lightSources || [];
          set({
            mapSettings: {
              ...get().mapSettings,
              lightSources: lightSources.map(l => 
                l.id === id ? { ...l, ...updates } : l
              )
            }
          });
        },
        
        setDynamicLighting: (isDynamicLighting) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              isDynamicLighting
            }
          });
        },
        
        attachLightToToken: (lightId, tokenId) => {
          const lightSources = get().mapSettings.lightSources || [];
          const token = get().tokens.find(t => t.id === tokenId);
          
          if (!token) return;
          
          set({
            mapSettings: {
              ...get().mapSettings,
              lightSources: lightSources.map(l => 
                l.id === lightId 
                  ? { 
                    ...l, 
                    attachedToTokenId: tokenId,
                    x: token.x,
                    y: token.y
                  } 
                  : l
              )
            }
          });
        },
      }),
      {
        name: 'battle-storage',
      }
    )
  )
);
