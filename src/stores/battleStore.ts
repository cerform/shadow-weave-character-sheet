
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Token {
  id: number;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  type: "player" | "monster" | "boss" | "npc";
  img?: string;
  size: number;
  conditions: string[];
  notes?: string;
  isVisible?: boolean;
}

export interface Initiative {
  id: number;
  tokenId: number;
  name: string;
  roll: number;
  isActive: boolean;
}

export interface BattleState {
  tokens: Token[];
  initiative: Initiative[];
  activeTokenId: number | null;
  battleActive: boolean;
  round: number;
  mapSettings: {
    gridSize: number;
    width: number;
    height: number;
    showGrid: boolean;
    backgroundImage?: string;
  };
  
  setTokens: (tokens: Token[]) => void;
  addToken: (token: Omit<Token, 'id'>) => void;
  removeToken: (tokenId: number) => void;
  updateToken: (tokenId: number, updates: Partial<Token>) => void;
  setActiveTokenId: (tokenId: number | null) => void;
  
  // Инициатива
  setInitiative: (initiative: Initiative[]) => void;
  addToInitiative: (tokenId: number, roll: number) => void;
  removeFromInitiative: (initiativeId: number) => void;
  clearInitiative: () => void;
  nextTurn: () => void;
  startBattle: () => void;
  endBattle: () => void;
  
  // Настройки карты
  updateMapSettings: (settings: Partial<BattleState['mapSettings']>) => void;
}

export const useBattleStore = create<BattleState>()(
  devtools(
    persist(
      (set, get) => ({
        tokens: [],
        initiative: [],
        activeTokenId: null,
        battleActive: false,
        round: 1,
        mapSettings: {
          gridSize: 50,
          width: 1500,
          height: 1000,
          showGrid: true,
        },
        
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
        
        setActiveTokenId: (tokenId) => set({ activeTokenId: tokenId }),
        
        // Инициатива
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
        
        clearInitiative: () => set({ initiative: [], battleActive: false, round: 1 }),
        
        nextTurn: () => {
          const initiative = get().initiative;
          if (initiative.length === 0) return;
          
          let activeIndex = initiative.findIndex((item) => item.isActive);
          
          // Если активного нет или это последний в инициативе
          if (activeIndex === -1 || activeIndex === initiative.length - 1) {
            activeIndex = 0;
            // Если это последний был, то следующий раунд
            if (initiative.some((item) => item.isActive)) {
              set({ round: get().round + 1 });
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
            battleActive: true, 
            round: 1,
            // Установим активный токен
            activeTokenId: newInitiative[0].tokenId
          });
        },
        
        endBattle: () => set({ battleActive: false, round: 1 }),
        
        // Настройки карты
        updateMapSettings: (settings) => {
          set({
            mapSettings: {
              ...get().mapSettings,
              ...settings,
            },
          });
        },
      }),
      {
        name: 'battle-storage',
      }
    )
  )
);
