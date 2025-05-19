import { create } from "zustand";
import { LightSource } from "@/types/battle";

// Импортируем необходимые типы
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
  initiative: number;
  conditions: string[];
  resources: { [key: string]: number };
  spellSlots?: { [key: string]: { used: number; max: number } };
  visible: boolean;
  size: number;
}

export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface BattleState {
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
}

export interface MapSettings {
  fogOfWar: boolean;
  revealedCells: { [key: string]: boolean };
  revealRadius: number;
  gridVisible: boolean;
  gridOpacity: number;
  gridSize: { rows: number; cols: number };
  zoom: number;
  background: string | null;
  lightSources: LightSource[];
  isDynamicLighting: boolean;
}

// Интерфейс состояния хранилища
interface BattleStore {
  // Данные боя
  tokens: Token[];
  initiative: Initiative[];
  battleState: BattleState;
  selectedTokenId: number | null;
  isDM: boolean;
  
  // Настройки карты
  mapSettings: MapSettings;
  
  // Визуальные настройки
  showWebcams: boolean;
  
  // Действия с токенами
  addToken: (token: Token) => void;
  updateToken: (id: number, updates: Partial<Token>) => void;
  removeToken: (id: number) => void;
  updateTokenPosition: (id: number, x: number, y: number) => void;
  updateTokenHP: (id: number, change: number) => void;
  selectToken: (id: number | null) => void;
  
  // Действия с боем
  startBattle: () => void;
  pauseBattle: () => void;
  nextTurn: () => void;
  
  // Настройки карты
  setMapBackground: (url: string | null) => void;
  setFogOfWar: (enabled: boolean) => void;
  revealCell: (row: number, col: number) => void;
  resetFogOfWar: () => void;
  setGridVisible: (visible: boolean) => void;
  setGridOpacity: (opacity: number) => void;
  setGridSize: (size: { rows: number; cols: number }) => void;
  setRevealRadius: (radius: number) => void;
  setZoom: (zoom: number) => void;
  
  // Новые методы для работы со светом
  addLightSource: (lightSource: Omit<LightSource, "id">) => void;
  removeLightSource: (id: number) => void;
  updateLightSource: (id: number, updates: Partial<Omit<LightSource, "id">>) => void;
  setDynamicLighting: (enabled: boolean) => void;
  attachLightToToken: (lightId: number, tokenId: number | undefined) => void;
  
  // Общие настройки
  setIsDM: (isDM: boolean) => void;
  setShowWebcams: (show: boolean) => void;
}

const useBattleStore = create<BattleStore>((set, get) => ({
  // Начальное состояние
  tokens: [],
  initiative: [],
  battleState: {
    isActive: false,
    round: 0,
    currentInitiativeIndex: -1,
  },
  selectedTokenId: null,
  isDM: true, // По умолчанию режим DM
  
  // Настройки карты
  mapSettings: {
    fogOfWar: true,
    revealedCells: {},
    revealRadius: 3,
    gridVisible: true,
    gridOpacity: 0.5,
    gridSize: { rows: 30, cols: 40 },
    zoom: 1,
    background: null,
    lightSources: [],
    isDynamicLighting: false,
  },
  
  // Визуальные настройки
  showWebcams: true,
  
  // Методы для управления токенами
  addToken: (token) => {
    set((state) => ({
      tokens: [...state.tokens, token]
    }));
    
    // Если бой активен, добавляем в инициативу
    if (get().battleState.isActive) {
      const roll = Math.floor(Math.random() * 20) + 1 + token.initiative;
      const newInitiative = {
        id: Date.now(),
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false,
      };
      
      set((state) => {
        const updatedInitiative = [...state.initiative, newInitiative]
          .sort((a, b) => b.roll - a.roll);
        
        return { initiative: updatedInitiative };
      });
    }
  },
  
  updateToken: (id, updates) => {
    set((state) => ({
      tokens: state.tokens.map(token => 
        token.id === id ? { ...token, ...updates } : token
      )
    }));
  },
  
  removeToken: (id) => {
    set((state) => ({
      tokens: state.tokens.filter(t => t.id !== id),
      initiative: state.initiative.filter(i => i.tokenId !== id),
      selectedTokenId: state.selectedTokenId === id ? null : state.selectedTokenId
    }));
  },
  
  updateTokenPosition: (id, x, y) => {
    set((state) => ({
      tokens: state.tokens.map(token => 
        token.id === id ? { ...token, x, y } : token
      )
    }));
  },
  
  updateTokenHP: (id, change) => {
    set((state) => ({
      tokens: state.tokens.map(token => {
        if (token.id === id) {
          const newHP = Math.max(0, Math.min(token.maxHp, token.hp + change));
          return { ...token, hp: newHP };
        }
        return token;
      })
    }));
  },
  
  selectToken: (id) => {
    set({ selectedTokenId: id });
  },
  
  // Методы для управления боем
  startBattle: () => {
    const state = get();
    
    if (state.tokens.length === 0) {
      console.error("Нельзя начать сражение без участников");
      return;
    }
    
    // Генерируем инициативу
    const initiativeRolls = state.tokens.map(token => {
      const roll = Math.floor(Math.random() * 20) + 1 + token.initiative;
      return {
        id: Date.now() + token.id,
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false,
      };
    });
    
    const sortedInitiative = [...initiativeRolls].sort((a, b) => b.roll - a.roll);
    
    if (sortedInitiative.length > 0) {
      sortedInitiative[0].isActive = true;
    }
    
    set({
      initiative: sortedInitiative,
      battleState: {
        isActive: true,
        round: 1,
        currentInitiativeIndex: 0,
      }
    });
  },
  
  pauseBattle: () => {
    set((state) => ({
      battleState: {
        ...state.battleState,
        isActive: !state.battleState.isActive,
      }
    }));
  },
  
  nextTurn: () => {
    set((state) => {
      if (!state.battleState.isActive || state.initiative.length === 0) {
        return state;
      }
      
      let nextIndex = (state.battleState.currentInitiativeIndex + 1) % state.initiative.length;
      let newRound = state.battleState.round;
      
      if (nextIndex === 0) {
        newRound++;
      }
      
      const updatedInitiative = state.initiative.map((item, idx) => ({
        ...item,
        isActive: idx === nextIndex,
      }));
      
      return {
        initiative: updatedInitiative,
        battleState: {
          ...state.battleState,
          round: newRound,
          currentInitiativeIndex: nextIndex,
        }
      };
    });
  },
  
  // Методы для управления картой
  setMapBackground: (url) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        background: url
      }
    }));
  },
  
  setFogOfWar: (enabled) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        fogOfWar: enabled
      }
    }));
  },
  
  revealCell: (row, col) => {
    set((state) => {
      if (!state.mapSettings.fogOfWar) return state;
      
      const newRevealed = { ...state.mapSettings.revealedCells };
      const radius = state.mapSettings.revealRadius;
      
      for (let r = Math.max(0, row - radius); r <= Math.min(state.mapSettings.gridSize.rows - 1, row + radius); r++) {
        for (let c = Math.max(0, col - radius); c <= Math.min(state.mapSettings.gridSize.cols - 1, col + radius); c++) {
          const distance = Math.sqrt(Math.pow(r - row, 2) + Math.pow(c - col, 2));
          if (distance <= radius) {
            newRevealed[`${r}-${c}`] = true;
          }
        }
      }
      
      return {
        mapSettings: {
          ...state.mapSettings,
          revealedCells: newRevealed
        }
      };
    });
  },
  
  resetFogOfWar: () => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        revealedCells: {}
      }
    }));
  },
  
  setGridVisible: (visible) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        gridVisible: visible
      }
    }));
  },
  
  setGridOpacity: (opacity) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        gridOpacity: opacity
      }
    }));
  },
  
  setGridSize: (size) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        gridSize: size
      }
    }));
  },
  
  setRevealRadius: (radius) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        revealRadius: radius
      }
    }));
  },
  
  setZoom: (zoom) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        zoom
      }
    }));
  },
  
  // Новые методы для работы со светом
  addLightSource: (lightSource) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: [...state.mapSettings.lightSources, { 
          ...lightSource, 
          id: Date.now() 
        }]
      }
    }));
  },
  
  removeLightSource: (id) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.filter(light => light.id !== id)
      }
    }));
  },
  
  updateLightSource: (id, updates) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.map(light => 
          light.id === id ? { ...light, ...updates } : light
        )
      }
    }));
  },
  
  setDynamicLighting: (enabled) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        isDynamicLighting: enabled
      }
    }));
  },
  
  attachLightToToken: (lightId, tokenId) => {
    set((state) => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.map(light => 
          light.id === lightId ? { ...light, attachedToTokenId: tokenId } : light
        )
      }
    }));
  },
  
  // Общие настройки
  setIsDM: (isDM) => {
    set({ isDM });
  },
  
  setShowWebcams: (show) => {
    set({ showWebcams: show });
  },
}));

export default useBattleStore;
