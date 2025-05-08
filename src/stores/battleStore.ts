
import { create } from 'zustand';
import { InitiativeItem, Token } from '@/types/battle';

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
  
  // Действия для управления картой
  setBackgroundImage: (url: string | null) => void;
  toggleGrid: () => void;
  toggleFogOfWar: () => void;
  revealArea: (x: number, y: number, radius: number) => void;
  resetFog: () => void;
  revealAllFog: () => void;
  setZoom: (value: number) => void;
  
  // Получить текущее активное существо
  getCurrentCreature: () => Token | null;
}

export type { Token }; // Экспортируем тип для повторного использования

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
      initiative: newInitiative
    });
  },
  
  endBattle: () => set({
    isActive: false,
    round: 0,
    currentInitiativeIndex: -1,
    initiative: []
  }),
  
  pauseBattle: () => set(state => ({ isActive: !state.isActive })),
  
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
      round: newRound
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
  
  setBackgroundImage: (url) => {
    set({ backgroundImage: url });
  },
  
  toggleGrid: () => {
    set(state => ({ gridVisible: !state.gridVisible }));
  },
  
  toggleFogOfWar: () => {
    set(state => ({ fogOfWar: !state.fogOfWar }));
  },
  
  revealArea: (x, y, radius) => {
    set(state => ({
      revealedAreas: [...state.revealedAreas, { x, y, radius }]
    }));
  },
  
  resetFog: () => {
    set({ revealedAreas: [] });
  },
  
  revealAllFog: () => {
    // Создаём один большой открытый регион, который покрывает всю карту
    set({
      revealedAreas: [{ x: 0, y: 0, radius: 10000 }]
    });
  },
  
  setZoom: (value) => {
    set({ zoom: value });
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
