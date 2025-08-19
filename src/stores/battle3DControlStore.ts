import { create } from 'zustand';

type ControlMode = 'navigation' | 'token' | 'fog' | 'asset';

interface Battle3DControlState {
  // Режимы управления
  currentMode: ControlMode;
  previousMode: ControlMode;
  
  // Состояние мыши и клавиатуры
  isMouseDown: boolean;
  isDragging: boolean;
  mouseDelta: { x: number; y: number };
  
  // Активные клавиши
  keysPressed: {
    shift: boolean;
    alt: boolean;
    ctrl: boolean;
    space: boolean;
  };
  
  // Выбранные объекты
  selectedTokenId: string | null;
  selectedAssetId: string | null;
  hoveredObjectId: string | null;
  
  // Состояние взаимодействий
  canInteract: boolean;
  isCanvasFocused: boolean;
  
  // Временные блокировки
  blockInteractions: boolean;
  
  // Actions
  setMode: (mode: ControlMode) => void;
  setPreviousMode: (mode: ControlMode) => void;
  
  setMouseState: (isDown: boolean, isDragging: boolean, delta?: { x: number; y: number }) => void;
  setKeyPressed: (key: keyof Battle3DControlState['keysPressed'], pressed: boolean) => void;
  
  setSelectedToken: (id: string | null) => void;
  setSelectedAsset: (id: string | null) => void;
  setHoveredObject: (id: string | null) => void;
  
  setCanInteract: (canInteract: boolean) => void;
  setCanvasFocused: (focused: boolean) => void;
  setBlockInteractions: (blocked: boolean) => void;
  
  // Utility methods
  shouldHandleTokenInteraction: () => boolean;
  shouldHandleFogInteraction: () => boolean;
  shouldHandleAssetInteraction: () => boolean;
  shouldHandleCameraControls: () => boolean;
  
  resetInteractionState: () => void;
}

export const useBattle3DControlStore = create<Battle3DControlState>((set, get) => ({
  // Initial state
  currentMode: 'navigation',
  previousMode: 'navigation',
  
  isMouseDown: false,
  isDragging: false,
  mouseDelta: { x: 0, y: 0 },
  
  keysPressed: {
    shift: false,
    alt: false,
    ctrl: false,
    space: false,
  },
  
  selectedTokenId: null,
  selectedAssetId: null,
  hoveredObjectId: null,
  
  canInteract: true,
  isCanvasFocused: false,
  blockInteractions: false,
  
  // Actions
  setMode: (mode) => {
    const current = get().currentMode;
    set({ currentMode: mode, previousMode: current });
  },
  
  setPreviousMode: (mode) => set({ previousMode: mode }),
  
  setMouseState: (isDown, isDragging, delta = { x: 0, y: 0 }) => 
    set({ isMouseDown: isDown, isDragging, mouseDelta: delta }),
  
  setKeyPressed: (key, pressed) => 
    set(state => ({ 
      keysPressed: { ...state.keysPressed, [key]: pressed } 
    })),
  
  setSelectedToken: (id) => {
    // Когда выбираем токен, переключаемся в режим токена
    if (id) {
      set({ selectedTokenId: id, selectedAssetId: null, currentMode: 'token' });
    } else {
      set({ selectedTokenId: id });
    }
  },
  
  setSelectedAsset: (id) => {
    // Когда выбираем ассет, переключаемся в режим ассета
    if (id) {
      set({ selectedAssetId: id, selectedTokenId: null, currentMode: 'asset' });
    } else {
      set({ selectedAssetId: id });
    }
  },
  
  setHoveredObject: (id) => set({ hoveredObjectId: id }),
  
  setCanInteract: (canInteract) => set({ canInteract }),
  setCanvasFocused: (focused) => set({ isCanvasFocused: focused }),
  setBlockInteractions: (blocked) => set({ blockInteractions: blocked }),
  
  // Utility methods
  shouldHandleTokenInteraction: () => {
    const state = get();
    return (
      state.canInteract && 
      !state.blockInteractions && 
      (state.currentMode === 'token' || state.currentMode === 'navigation') &&
      !state.keysPressed.shift && 
      !state.keysPressed.alt
    );
  },
  
  shouldHandleFogInteraction: () => {
    const state = get();
    return (
      state.canInteract && 
      !state.blockInteractions && 
      (state.currentMode === 'fog' || state.keysPressed.shift || state.keysPressed.alt)
    );
  },
  
  shouldHandleAssetInteraction: () => {
    const state = get();
    return (
      state.canInteract && 
      !state.blockInteractions && 
      (state.currentMode === 'asset' || state.currentMode === 'navigation') &&
      !state.keysPressed.shift && 
      !state.keysPressed.alt
    );
  },
  
  shouldHandleCameraControls: () => {
    const state = get();
    return (
      state.canInteract && 
      !state.blockInteractions && 
      !state.isDragging && 
      (state.currentMode === 'navigation' || state.keysPressed.space || state.keysPressed.ctrl)
    );
  },
  
  resetInteractionState: () => set({
    isMouseDown: false,
    isDragging: false,
    mouseDelta: { x: 0, y: 0 },
    selectedTokenId: null,
    selectedAssetId: null,
    hoveredObjectId: null,
    currentMode: 'navigation',
  }),
}));