// Единое хранилище для объединенной боевой системы
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import type { EnhancedToken, CombatEvent } from '@/stores/enhancedBattleStore';
import type { Character, CombatState } from '@/types/dnd5e';

export type ViewMode = 'dm' | 'player';

interface UnifiedBattleState {
  // Режим просмотра
  viewMode: ViewMode;
  isDM: boolean;
  
  // 3D карта
  tokens: EnhancedToken[];
  selectedTokenId: string | null;
  activeId: string | null;
  showMovementGrid: boolean;
  mapImageUrl: string | null;
  
  // Туман войны
  fogEnabled: boolean;
  paintMode: 'reveal' | 'hide';
  brushSize: number;
  
  // Камера
  cameraMode: boolean;
  
  // D&D 5e боевая система
  characters: Character[];
  combatState: CombatState | null;
  combatStarted: boolean;
  
  // События и лог
  combatEvents: CombatEvent[];
  
  // Настройки
  settings: {
    autoSync: boolean;
    showGridNumbers: boolean;
    enableSounds: boolean;
    playerCanSeeHP: boolean;
  };
  
  // Действия
  setViewMode: (mode: ViewMode) => void;
  setIsDM: (isDM: boolean) => void;
  
  // Токены
  addToken: (token: Omit<EnhancedToken, 'id'>) => void;
  updateToken: (id: string, updates: Partial<EnhancedToken>) => void;
  removeToken: (id: string) => void;
  selectToken: (id: string | null) => void;
  setActiveToken: (id: string | null) => void;
  toggleMovementGrid: () => void;
  setShowMovementGrid: (show: boolean) => void;
  
  // Карта
  setMapImageUrl: (url: string | null) => void;
  clearMap: () => void;
  
  // Туман
  setFogEnabled: (enabled: boolean) => void;
  setPaintMode: (mode: 'reveal' | 'hide') => void;
  setBrushSize: (size: number) => void;
  
  // Камера
  setCameraMode: (enabled: boolean) => void;
  
  // Боевая система
  setCharacters: (characters: Character[]) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  setCombatState: (state: CombatState | null) => void;
  startCombat: () => void;
  endCombat: () => void;
  
  // События
  addCombatEvent: (event: Omit<CombatEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  
  // Настройки
  updateSettings: (updates: Partial<UnifiedBattleState['settings']>) => void;
  
  // Очистка
  resetAll: () => void;
  
  // Инициализация боевой сцены
  initializeBattleScene: () => void;
}

export const useUnifiedBattleStore = create<UnifiedBattleState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      viewMode: 'dm',
      isDM: true,
      
      // 3D карта
      tokens: [],
      selectedTokenId: null,
      activeId: null,
      showMovementGrid: false,
      mapImageUrl: null,
      
      // Туман войны
      fogEnabled: true,
      paintMode: 'reveal',
      brushSize: 2,
      
      // Камера
      cameraMode: false,
      
      // D&D 5e боевая система
      characters: [],
      combatState: null,
      combatStarted: false,
      
      // События
      combatEvents: [],
      
      // Настройки
      settings: {
        autoSync: true,
        showGridNumbers: true,
        enableSounds: true,
        playerCanSeeHP: false,
      },
      
      // Действия
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsDM: (isDM) => set({ isDM }),
      
      // Токены
      addToken: (tokenData) => {
        const token: EnhancedToken = {
          ...tokenData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          tokens: [...state.tokens, token],
        }));
      },
      
      updateToken: (id, updates) => set((state) => ({
        tokens: state.tokens.map((token) =>
          token.id === id ? { ...token, ...updates } : token
        ),
      })),
      
      removeToken: (id) => set((state) => ({
        tokens: state.tokens.filter((token) => token.id !== id),
        selectedTokenId: state.selectedTokenId === id ? null : state.selectedTokenId,
        activeId: state.activeId === id ? null : state.activeId,
      })),
      
      selectToken: (id) => set({ selectedTokenId: id }),
      setActiveToken: (id) => set({ activeId: id }),
      toggleMovementGrid: () => set((state) => ({ showMovementGrid: !state.showMovementGrid })),
      setShowMovementGrid: (show) => set({ showMovementGrid: show }),
      
      // Карта
      setMapImageUrl: (url) => set({ mapImageUrl: url }),
      clearMap: () => set({ mapImageUrl: null }),
      
      // Туман
      setFogEnabled: (enabled) => set({ fogEnabled: enabled }),
      setPaintMode: (mode) => set({ paintMode: mode }),
      setBrushSize: (size) => set({ brushSize: size }),
      
      // Камера
      setCameraMode: (enabled) => set({ cameraMode: enabled }),
      
      // Боевая система
      setCharacters: (characters) => set({ characters }),
      updateCharacter: (id, updates) => set((state) => ({
        characters: state.characters.map((char) =>
          char.id === id ? { ...char, ...updates } : char
        ),
      })),
      
      setCombatState: (state) => set({ combatState: state }),
      startCombat: () => set({ combatStarted: true }),
      endCombat: () => set({ 
        combatStarted: false, 
        combatState: null,
        activeId: null,
        selectedTokenId: null 
      }),
      
      // События
      addCombatEvent: (eventData) => {
        const event: CombatEvent = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({
          combatEvents: [...state.combatEvents, event],
        }));
      },
      
      clearEvents: () => set({ combatEvents: [] }),
      
      // Настройки
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates },
      })),
      
      // Очистка
      resetAll: () => set({
        tokens: [],
        selectedTokenId: null,
        activeId: null,
        showMovementGrid: false,
        mapImageUrl: null,
        characters: [],
        combatState: null,
        combatStarted: false,
        combatEvents: [],
      }),
      
      // Инициализация боевой сцены
      initializeBattleScene: () => {
        const demoTokens: EnhancedToken[] = [
          // Персонажи игроков (синяя команда)
          {
            id: 'player-warrior',
            name: 'Эльдан Воин',
            hp: 45,
            maxHp: 45,
            ac: 18,
            position: [-6, 0, -4],
            conditions: [],
            isEnemy: false,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Воин 3 уровня',
            color: '#3b82f6'
          },
          {
            id: 'player-mage',
            name: 'Мирена Волшебница',
            hp: 22,
            maxHp: 22,
            ac: 14,
            position: [-8, 0, -2],
            conditions: [],
            isEnemy: false,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Волшебница 3 уровня',
            color: '#8b5cf6'
          },
          {
            id: 'player-rogue',
            name: 'Тень Плут',
            hp: 28,
            maxHp: 28,
            ac: 16,
            position: [-4, 0, -6],
            conditions: [],
            isEnemy: false,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Плут 3 уровня',
            color: '#10b981'
          },
          {
            id: 'player-cleric',
            name: 'Селена Клерик',
            hp: 35,
            maxHp: 35,
            ac: 16,
            position: [-6, 0, -2],
            conditions: [],
            isEnemy: false,
            isVisible: true,
            size: 1,
            speed: 5,
            hasMovedThisTurn: false,
            class: 'Клерик 3 уровня',
            color: '#f59e0b'
          },
          
          // Враги (красная команда)
          {
            id: 'enemy-orc-leader',
            name: 'Вожак Орков',
            hp: 65,
            maxHp: 65,
            ac: 17,
            position: [6, 0, 2],
            conditions: [],
            isEnemy: true,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Орк Вожак',
            color: '#dc2626'
          },
          {
            id: 'enemy-orc-warrior1',
            name: 'Орк Воин',
            hp: 35,
            maxHp: 35,
            ac: 15,
            position: [4, 0, 4],
            conditions: [],
            isEnemy: true,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Орк Воин',
            color: '#dc2626'
          },
          {
            id: 'enemy-orc-warrior2',
            name: 'Орк Воин',
            hp: 35,
            maxHp: 35,
            ac: 15,
            position: [8, 0, 4],
            conditions: [],
            isEnemy: true,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Орк Воин',
            color: '#dc2626'
          },
          {
            id: 'enemy-goblin-archer',
            name: 'Гоблин Лучник',
            hp: 18,
            maxHp: 18,
            ac: 14,
            position: [8, 0, 0],
            conditions: [],
            isEnemy: true,
            isVisible: true,
            size: 1,
            speed: 6,
            hasMovedThisTurn: false,
            class: 'Гоблин Лучник',
            color: '#dc2626'
          },
          {
            id: 'enemy-wolf',
            name: 'Волк',
            hp: 25,
            maxHp: 25,
            ac: 13,
            position: [2, 0, 6],
            conditions: [],
            isEnemy: true,
            isVisible: true,
            size: 1,
            speed: 8,
            hasMovedThisTurn: false,
            class: 'Волк',
            color: '#dc2626'
          }
        ];
        
        set({ 
          tokens: demoTokens,
          showMovementGrid: true,
          selectedTokenId: null,
          activeId: null
        });
      },
    }),
    {
      name: 'unified-battle-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        isDM: state.isDM,
        tokens: state.tokens,
        mapImageUrl: state.mapImageUrl,
        characters: state.characters,
        settings: state.settings,
      }),
    }
  )
);