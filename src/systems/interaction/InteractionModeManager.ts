// Система управления режимами взаимодействия
export enum InteractionMode {
  NAVIGATION = 'navigation',
  FOG = 'fog',
  CAMERA = 'camera', 
  ASSETS = 'assets',
  TOKENS = 'tokens'
}

export interface InteractionState {
  mode: InteractionMode;
  isActive: boolean;
  isPainting: boolean;
  mousePosition: { x: number; y: number };
  worldPosition: { x: number; z: number } | null;
}

export class InteractionModeManager {
  private currentMode: InteractionMode = InteractionMode.TOKENS; // По умолчанию токены
  private isActive = false;
  private listeners: Set<(state: InteractionState) => void> = new Set();

  constructor() {
    this.setupKeyboardListeners();
    // Инициализируем активный режим
    this.isActive = true;
    console.log('🎮 InteractionModeManager initialized with TOKENS mode');
  }

  private setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '1':
          this.setMode(InteractionMode.NAVIGATION);
          break;
        case '2':
          this.setMode(InteractionMode.TOKENS);
          break;
        case '3':
          this.setMode(InteractionMode.FOG);
          break;
        case '4':
          this.setMode(InteractionMode.CAMERA);
          break;
        case '5':
          this.setMode(InteractionMode.ASSETS);
          break;
      }
    });
  }

  setMode(mode: InteractionMode) {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      this.notifyListeners();
      console.log(`🎮 Interaction mode changed to: ${mode}`);
    }
  }

  getMode(): InteractionMode {
    return this.currentMode;
  }

  setActive(active: boolean) {
    if (this.isActive !== active) {
      this.isActive = active;
      this.notifyListeners();
    }
  }

  isCurrentMode(mode: InteractionMode): boolean {
    return this.currentMode === mode;
  }

  isModeActive(): boolean {
    return this.isActive;
  }

  subscribe(listener: (state: InteractionState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const state: InteractionState = {
      mode: this.currentMode,
      isActive: this.isActive,
      isPainting: false,
      mousePosition: { x: 0, y: 0 },
      worldPosition: null
    };

    this.listeners.forEach(listener => listener(state));
  }

  dispose() {
    this.listeners.clear();
  }
}

// Singleton instance
export const interactionManager = new InteractionModeManager();