
import { create } from 'zustand';
import { Token, InitiativeItem, LightSource, VisibleArea } from '@/types/battle';

interface BattleStore {
  // Состояние боя
  isActive: boolean;
  round: number;
  currentInitiativeIndex: number;
  initiative: InitiativeItem[];
  tokens: Token[];
  
  // Состояние карты
  backgroundImage: string | null;
  gridVisible: boolean;
  fogOfWar: boolean;
  revealedAreas: { x: number, y: number, radius: number }[];
  zoom: number;
  
  // Новые свойства для PlayBattlePage
  battleState: {
    isActive: boolean;
    round: number;
    currentTurn: number;
  };
  mapSettings: {
    background: string | null;
    gridSize: number;
    gridVisible: boolean;
    gridOpacity: number;
    fogOfWar: boolean;
    revealedCells: {row: number, col: number}[];
    revealRadius: number;
    zoom: number;
    isDynamicLighting: boolean;
    lightSources: LightSource[];
  };
  selectedTokenId: number | null;
  isDM: boolean;
  showWebcams: boolean;
  
  // Действия для управления боем
  startBattle: () => void;
  endBattle: () => void;
  pauseBattle: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  
  // Действия для управления инициативой
  rollInitiative: () => void;
  setInitiative: (tokenId: number, value: number) => void;
  setCurrentTurn: (index: number) => void;
  
  // Действия для управления токенами
  addToken: (token: Token) => void;
  removeToken: (id: number) => void;
  updateToken: (id: number, updates: Partial<Token>) => void;
  updateTokenPosition: (id: number, x: number, y: number) => void;
  updateTokenHP: (id: number, change: number) => void;
  selectToken: (id: number | null) => void;
  
  // Действия для управления картой
  setBackgroundImage: (url: string | null) => void;
  toggleGrid: () => void;
  toggleFogOfWar: () => void;
  revealArea: (x: number, y: number, radius: number) => void;
  resetFog: () => void;
  revealAllFog: () => void;
  setZoom: (value: number) => void;
  
  // Новые методы для PlayBattlePage
  setMapBackground: (url: string | null) => void;
  setFogOfWar: (value: boolean) => void;
  revealCell: (row: number, col: number) => void;
  resetFogOfWar: () => void;
  setGridVisible: (value: boolean) => void;
  setGridOpacity: (value: number) => void;
  setGridSize: (value: number) => void;
  setRevealRadius: (value: number) => void;
  setIsDM: (value: boolean) => void;
  setShowWebcams: (value: boolean) => void;
  addLightSource: (light: Omit<LightSource, "id">) => void;
  removeLightSource: (id: number) => void;
  updateLightSource: (id: number, updates: Partial<LightSource>) => void;
  setDynamicLighting: (value: boolean) => void;
  attachLightToToken: (lightId: number, tokenId: number) => void;
  
  // Получить текущее активное существо
  getCurrentCreature: () => Token | null;
}

// Экспортируем типы для повторного использования
export type { Token, InitiativeItem, LightSource, VisibleArea }; 

const useBattleStore = create<BattleStore>((set, get) => ({
  // Начальное состояние
  isActive: false,
  round: 0,
  currentInitiativeIndex: -1,
  initiative: [],
  tokens: [],
  
  backgroundImage: null,
  gridVisible: true,
  fogOfWar: false,
  revealedAreas: [],
  zoom: 1.0,
  
  // Новые начальные значения для дополнительных свойств
  battleState: {
    isActive: false,
    round: 0,
    currentTurn: -1
  },
  mapSettings: {
    background: null,
    gridSize: 50,
    gridVisible: true,
    gridOpacity: 0.8,
    fogOfWar: false,
    revealedCells: [],
    revealRadius: 5,
    zoom: 1.0,
    isDynamicLighting: false,
    lightSources: []
  },
  selectedTokenId: null,
  isDM: true,
  showWebcams: false,
  
  // Методы для управления боем
  startBattle: () => {
    const { tokens } = get();
    
    // Подготавливаем список инициативы
    const newInitiative: InitiativeItem[] = [];
    let id = 1;
    
    tokens.forEach(token => {
      // Генерируем случайную инициативу для токенов без заданного значения
      const roll = token.initiative ?? Math.floor(Math.random() * 20) + 1;
      
      newInitiative.push({
        id: id++,
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false
      });
    });
    
    // Сортируем по убыванию броска инициативы
    newInitiative.sort((a, b) => b.roll - a.roll);
    
    // Отмечаем первого в списке как активного
    if (newInitiative.length > 0) {
      newInitiative[0].isActive = true;
    }
    
    set({
      isActive: true,
      round: 1,
      currentInitiativeIndex: newInitiative.length > 0 ? 0 : -1,
      initiative: newInitiative,
      battleState: {
        isActive: true,
        round: 1,
        currentTurn: newInitiative.length > 0 ? 0 : -1
      }
    });
  },
  
  endBattle: () => set({
    isActive: false,
    round: 0,
    currentInitiativeIndex: -1,
    initiative: [],
    battleState: {
      isActive: false,
      round: 0,
      currentTurn: -1
    }
  }),
  
  pauseBattle: () => {
    const { isActive } = get();
    set({
      isActive: !isActive,
      battleState: {
        ...get().battleState,
        isActive: !isActive
      }
    });
  },
  
  nextTurn: () => {
    const { initiative, currentInitiativeIndex, round } = get();
    
    if (initiative.length === 0) return;
    
    // Снимаем флаг активности с текущего участника
    const updatedInitiative = [...initiative];
    if (currentInitiativeIndex >= 0) {
      updatedInitiative[currentInitiativeIndex].isActive = false;
    }
    
    // Вычисляем следующий индекс
    let newIndex = currentInitiativeIndex + 1;
    let newRound = round;
    
    // Если мы достигли конца списка, начинаем новый раунд
    if (newIndex >= initiative.length) {
      newIndex = 0;
      newRound++;
    }
    
    // Устанавливаем флаг активности для следующего участника
    updatedInitiative[newIndex].isActive = true;
    
    set({
      initiative: updatedInitiative,
      currentInitiativeIndex: newIndex,
      round: newRound,
      battleState: {
        isActive: true,
        round: newRound,
        currentTurn: newIndex
      }
    });
  },
  
  prevTurn: () => {
    const { initiative, currentInitiativeIndex, round } = get();
    
    if (initiative.length === 0) return;
    
    // Снимаем флаг активности с текущего участника
    const updatedInitiative = [...initiative];
    if (currentInitiativeIndex >= 0) {
      updatedInitiative[currentInitiativeIndex].isActive = false;
    }
    
    // Вычисляем предыдущий индекс
    let newIndex = currentInitiativeIndex - 1;
    let newRound = round;
    
    // Если мы достигли начала списка
    if (newIndex < 0) {
      newIndex = initiative.length - 1;
      newRound = Math.max(1, round - 1);
    }
    
    // Устанавливаем флаг активности для предыдущего участника
    updatedInitiative[newIndex].isActive = true;
    
    set({
      initiative: updatedInitiative,
      currentInitiativeIndex: newIndex,
      round: newRound
    });
  },
  
  rollInitiative: () => {
    const { tokens, isActive } = get();
    
    // Подготавливаем новый список инициативы
    const newInitiative: InitiativeItem[] = [];
    let id = 1;
    
    tokens.forEach(token => {
      // Генерируем случайную инициативу
      const roll = Math.floor(Math.random() * 20) + 1;
      
      // Обновляем значение инициативы токена
      get().updateToken(token.id, { initiative: roll });
      
      newInitiative.push({
        id: id++,
        tokenId: token.id,
        name: token.name,
        roll,
        isActive: false
      });
    });
    
    // Сортируем по убыванию броска инициативы
    newInitiative.sort((a, b) => b.roll - a.roll);
    
    // Отмечаем первого в списке как активного
    if (newInitiative.length > 0) {
      newInitiative[0].isActive = true;
    }
    
    set({
      initiative: newInitiative,
      currentInitiativeIndex: newInitiative.length > 0 ? 0 : -1,
      round: isActive ? 1 : 0
    });
  },
  
  setInitiative: (tokenId, value) => {
    const { initiative } = get();
    
    // Обновляем значение инициативы для токена
    get().updateToken(tokenId, { initiative: value });
    
    // Обновляем значение в списке инициативы
    const updatedInitiative = initiative.map(item => 
      item.tokenId === tokenId ? { ...item, roll: value } : item
    );
    
    // Пересортировываем список
    updatedInitiative.sort((a, b) => b.roll - a.roll);
    
    set({ initiative: updatedInitiative });
    
    // Обновляем индекс текущего активного участника
    const activeIndex = updatedInitiative.findIndex(item => item.isActive);
    if (activeIndex !== -1) {
      set({ currentInitiativeIndex: activeIndex });
    }
  },
  
  setCurrentTurn: (index) => {
    const { initiative } = get();
    
    if (index < 0 || index >= initiative.length) return;
    
    // Обновляем флаги активности
    const updatedInitiative = initiative.map((item, idx) => ({
      ...item,
      isActive: idx === index
    }));
    
    set({
      initiative: updatedInitiative,
      currentInitiativeIndex: index
    });
  },
  
  addToken: (token) => {
    set(state => ({
      tokens: [...state.tokens, token]
    }));
  },
  
  removeToken: (id) => {
    const { tokens, initiative } = get();
    
    // Удаляем токен из списка токенов
    const updatedTokens = tokens.filter(t => t.id !== id);
    
    // Удаляем связанные записи из списка инициативы
    const updatedInitiative = initiative.filter(item => item.tokenId !== id);
    
    set({
      tokens: updatedTokens,
      initiative: updatedInitiative
    });
    
    // Обновляем индекс текущего активного участника
    const activeIndex = updatedInitiative.findIndex(item => item.isActive);
    if (activeIndex !== -1) {
      set({ currentInitiativeIndex: activeIndex });
    } else if (updatedInitiative.length > 0) {
      // Если нет активного элемента, устанавливаем первый
      const newInitiative = [...updatedInitiative];
      newInitiative[0].isActive = true;
      set({
        initiative: newInitiative,
        currentInitiativeIndex: 0
      });
    } else {
      // Если список пуст
      set({ currentInitiativeIndex: -1 });
    }
  },
  
  updateToken: (id, updates) => {
    const { tokens } = get();
    
    // Обновляем указанный токен
    const updatedTokens = tokens.map(token => 
      token.id === id ? { ...token, ...updates } : token
    );
    
    set({ tokens: updatedTokens });
  },
  
  updateTokenPosition: (id, x, y) => {
    get().updateToken(id, { x, y });
  },

  updateTokenHP: (id, change) => {
    const token = get().tokens.find(t => t.id === id);
    if (token) {
      const newHP = Math.max(0, Math.min(token.maxHp, token.hp + change));
      get().updateToken(id, { hp: newHP });
    }
  },
  
  selectToken: (id) => {
    set({ selectedTokenId: id });
  },
  
  setBackgroundImage: (url) => {
    set({ 
      backgroundImage: url,
      mapSettings: {
        ...get().mapSettings,
        background: url
      }
    });
  },
  
  toggleGrid: () => {
    const gridVisible = !get().gridVisible;
    set({ 
      gridVisible,
      mapSettings: {
        ...get().mapSettings,
        gridVisible
      }
    });
  },
  
  toggleFogOfWar: () => {
    const fogOfWar = !get().fogOfWar;
    set({ 
      fogOfWar,
      mapSettings: {
        ...get().mapSettings,
        fogOfWar
      }
    });
  },
  
  revealArea: (x, y, radius) => {
    set(state => ({
      revealedAreas: [...state.revealedAreas, { x, y, radius }]
    }));
  },
  
  resetFog: () => {
    set({ 
      revealedAreas: [],
      mapSettings: {
        ...get().mapSettings,
        revealedCells: []
      }
    });
  },
  
  revealAllFog: () => {
    // Создаём один большой открытый регион, который покрывает всю карту
    set({
      revealedAreas: [{ x: 0, y: 0, radius: 10000 }]
    });
  },
  
  setZoom: (value) => {
    set({ 
      zoom: value,
      mapSettings: {
        ...get().mapSettings,
        zoom: value
      }
    });
  },
  
  setMapBackground: (url) => {
    set({
      mapSettings: {
        ...get().mapSettings,
        background: url
      }
    });
  },
  
  setFogOfWar: (value) => {
    set({
      mapSettings: {
        ...get().mapSettings,
        fogOfWar: value
      }
    });
  },
  
  revealCell: (row, col) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        revealedCells: [...state.mapSettings.revealedCells, { row, col }]
      }
    }));
  },
  
  resetFogOfWar: () => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        revealedCells: []
      }
    }));
  },
  
  setGridVisible: (value) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        gridVisible: value
      }
    }));
  },
  
  setGridOpacity: (value) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        gridOpacity: value
      }
    }));
  },
  
  setGridSize: (value) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        gridSize: value
      }
    }));
  },
  
  setRevealRadius: (value) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        revealRadius: value
      }
    }));
  },
  
  setIsDM: (value) => {
    set({ isDM: value });
  },
  
  setShowWebcams: (value) => {
    set({ showWebcams: value });
  },
  
  addLightSource: (light) => {
    const newLight = {
      ...light,
      id: Date.now()
    };
    
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: [...state.mapSettings.lightSources, newLight]
      }
    }));
  },
  
  removeLightSource: (id) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.filter(light => light.id !== id)
      }
    }));
  },
  
  updateLightSource: (id, updates) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.map(light => 
          light.id === id ? { ...light, ...updates } : light
        )
      }
    }));
  },
  
  setDynamicLighting: (value) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        isDynamicLighting: value
      }
    }));
  },
  
  attachLightToToken: (lightId, tokenId) => {
    set(state => ({
      mapSettings: {
        ...state.mapSettings,
        lightSources: state.mapSettings.lightSources.map(light => 
          light.id === lightId ? { ...light, attachedToTokenId: tokenId } : light
        )
      }
    }));
  },
  
  getCurrentCreature: () => {
    const { currentInitiativeIndex, initiative, tokens } = get();
    
    if (currentInitiativeIndex < 0 || initiative.length === 0) {
      return null;
    }
    
    const currentItem = initiative[currentInitiativeIndex];
    return tokens.find(t => t.id === currentItem.tokenId) || null;
  }
}));

export default useBattleStore;
