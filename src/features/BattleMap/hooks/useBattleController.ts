/**
 * Хук-контроллер для связи UI с BattleEngine
 */

import { useCallback, useEffect, useState } from 'react';
import { BattleEngine, BattleToken, BattleEvent } from '../../../core/battle/engine/BattleEngine';
import { FogOfWarSystem } from '../../../core/map/engine/FogOfWar';
import { GridSystem } from '../../../core/map/engine/Grid';
import { TokenEngine } from '../../../core/tokens/engine/TokenEngine';
import { ModelRegistry } from '../../../assets/models/ModelRegistry';
import { ModelLoader } from '../../../assets/models/ModelLoader';
import { BestiaryService } from '../../../assets/bestiary/BestiaryService';

export interface BattleControllerState {
  isLoading: boolean;
  error: string | null;
  battleEngine: BattleEngine;
  fogOfWar: FogOfWarSystem;
  gridSystem: GridSystem;
  tokenEngine: TokenEngine;
  modelRegistry: ModelRegistry;
  modelLoader: ModelLoader;
  bestiaryService: BestiaryService;
}

let globalBattleEngine: BattleEngine | null = null;
let globalFogOfWar: FogOfWarSystem | null = null;
let globalGridSystem: GridSystem | null = null;
let globalTokenEngine: TokenEngine | null = null;
let globalModelRegistry: ModelRegistry | null = null;
let globalModelLoader: ModelLoader | null = null;
let globalBestiaryService: BestiaryService | null = null;

export const useBattleController = () => {
  const [state, setState] = useState<BattleControllerState | null>(null);
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([]);

  // Инициализация систем
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        setState(prev => prev ? { ...prev, isLoading: true } : null);

        // Создаем системы если их еще нет (синглтоны)
        if (!globalGridSystem) {
          globalGridSystem = new GridSystem();
        }
        
        if (!globalFogOfWar) {
          globalFogOfWar = new FogOfWarSystem(globalGridSystem);
        }
        
        if (!globalTokenEngine) {
          globalTokenEngine = new TokenEngine(globalGridSystem);
        }
        
        if (!globalBattleEngine) {
          globalBattleEngine = new BattleEngine();
        }
        
        if (!globalModelRegistry) {
          globalModelRegistry = new ModelRegistry();
          await globalModelRegistry.preloadCommonModels();
        }
        
        if (!globalModelLoader) {
          globalModelLoader = new ModelLoader({ enableDraco: true });
        }
        
        if (!globalBestiaryService) {
          globalBestiaryService = new BestiaryService();
        }

        setState({
          isLoading: false,
          error: null,
          battleEngine: globalBattleEngine,
          fogOfWar: globalFogOfWar,
          gridSystem: globalGridSystem,
          tokenEngine: globalTokenEngine,
          modelRegistry: globalModelRegistry,
          modelLoader: globalModelLoader,
          bestiaryService: globalBestiaryService,
        });

        console.log('🎮 Battle systems initialized');
      } catch (error) {
        console.error('Failed to initialize battle systems:', error);
        setState(prev => prev ? {
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : null);
      }
    };

    initializeSystems();
  }, []);

  // Подписка на события боя
  useEffect(() => {
    if (!state?.battleEngine) return;

    const unsubscribe = state.battleEngine.onBattleEvent((event) => {
      setBattleEvents(prev => [event, ...prev.slice(0, 49)]); // Последние 50 событий
    });

    return unsubscribe;
  }, [state?.battleEngine]);

  // Действия с боем
  const startBattle = useCallback(() => {
    if (!state?.battleEngine) return;
    
    try {
      state.battleEngine.startBattle();
      console.log('⚔️ Battle started');
    } catch (error) {
      console.error('Failed to start battle:', error);
    }
  }, [state?.battleEngine]);

  const endBattle = useCallback(() => {
    if (!state?.battleEngine) return;
    
    state.battleEngine.endBattle();
    console.log('🏁 Battle ended');
  }, [state?.battleEngine]);

  const nextTurn = useCallback(() => {
    if (!state?.battleEngine) return;
    
    const nextToken = state.battleEngine.nextTurn();
    console.log('➡️ Next turn:', nextToken?.name);
    return nextToken;
  }, [state?.battleEngine]);

  // Действия с токенами
  const addToken = useCallback(async (tokenData: Omit<BattleToken, 'id'>) => {
    if (!state?.battleEngine) return null;

    const token: BattleToken = {
      ...tokenData,
      id: crypto.randomUUID(),
    };

    state.battleEngine.addToken(token);
    state.tokenEngine.addToken({
      id: token.id,
      name: token.name,
      hp: token.hp,
      maxHp: token.maxHp,
      ac: token.ac,
      speed: token.speed,
      position: { x: Math.floor(token.position[0]), z: Math.floor(token.position[2]) },
      conditions: token.conditions,
      isEnemy: token.isEnemy,
      size: 'Medium', // TODO: из токена
    });

    console.log('➕ Token added:', token.name);
    return token;
  }, [state?.battleEngine, state?.tokenEngine]);

  const removeToken = useCallback((tokenId: string) => {
    if (!state?.battleEngine) return;

    state.battleEngine.removeToken(tokenId);
    state.tokenEngine.removeToken(tokenId);
    state.fogOfWar.removeVisionSource(tokenId);
    
    console.log('➖ Token removed:', tokenId);
  }, [state?.battleEngine, state?.tokenEngine, state?.fogOfWar]);

  const moveToken = useCallback((tokenId: string, newPosition: [number, number, number]) => {
    if (!state?.battleEngine || !state?.gridSystem) return false;

    const distance = 1; // TODO: вычислить реальное расстояние
    const success = state.battleEngine.moveToken(tokenId, newPosition, distance);
    
    if (success) {
      const gridPos = state.gridSystem.worldToGrid({
        x: newPosition[0],
        y: newPosition[1],
        z: newPosition[2]
      });
      
      state.tokenEngine.moveToken(tokenId, gridPos);
      
      // Обновляем туман войны для игроков
      const token = state.battleEngine.getToken(tokenId);
      if (token && !token.isEnemy) {
        state.fogOfWar.updateVisionSource(tokenId, gridPos);
        state.fogOfWar.recomputeVision();
      }
    }

    return success;
  }, [state?.battleEngine, state?.gridSystem, state?.tokenEngine, state?.fogOfWar]);

  // Действия с монстрами
  const searchMonsters = useCallback(async (query: string) => {
    if (!state?.bestiaryService) return [];
    
    return await state.bestiaryService.searchMonsters(query);
  }, [state?.bestiaryService]);

  const loadMonster = useCallback(async (index: string) => {
    if (!state?.bestiaryService) return null;
    
    return await state.bestiaryService.loadMonster(index);
  }, [state?.bestiaryService]);

  const addMonsterToMap = useCallback(async (
    monsterIndex: string, 
    position: [number, number, number]
  ) => {
    if (!state?.bestiaryService || !state?.modelRegistry) return null;

    const monsterData = await state.bestiaryService.loadMonster(monsterIndex);
    if (!monsterData) return null;

    // Создаем токен из данных монстра
    const token = await addToken({
      name: monsterData.name,
      hp: monsterData.hit_points,
      maxHp: monsterData.hit_points,
      ac: Array.isArray(monsterData.armor_class) ? monsterData.armor_class[0] : monsterData.armor_class,
      speed: 6, // TODO: парсить из monsterData.speed
      position,
      conditions: [],
      isEnemy: true,
      isPlayer: false,
      dexterityModifier: 0, // TODO: из данных монстра
      attackBonus: 5, // TODO: из данных монстра
      damageRoll: '1d8+3', // TODO: из данных монстра
    });

    if (token) {
      // Получаем маппинг модели
      const modelMapping = state.modelRegistry.getModelMapping(monsterData.name, monsterData.type);
      
      // Загружаем модель асинхронно
      if (state.modelLoader) {
        state.modelLoader.loadModel(modelMapping.path, {
          scale: modelMapping.scale,
          yOffset: modelMapping.yOffset,
        }).then(model => {
          if (model) {
            console.log(`🎭 3D model loaded for ${monsterData.name}`);
          } else {
            console.log(`🎭 Using placeholder for ${monsterData.name}`);
          }
        });
      }
    }

    return token;
  }, [state?.bestiaryService, state?.modelRegistry, state?.modelLoader, addToken]);

  // Действия с туманом войны
  const toggleFogOfWar = useCallback(() => {
    if (!state?.fogOfWar) return;
    
    // TODO: реализовать переключение включения/выключения
    console.log('🌫️ Fog of war toggled');
  }, [state?.fogOfWar]);

  const revealArea = useCallback((center: [number, number, number], radius: number) => {
    if (!state?.fogOfWar || !state?.gridSystem) return;

    const gridPos = state.gridSystem.worldToGrid({
      x: center[0],
      y: center[1], 
      z: center[2]
    });
    
    state.fogOfWar.revealArea(gridPos, radius);
    console.log('🌫️ Area revealed at:', gridPos);
  }, [state?.fogOfWar, state?.gridSystem]);

  // Боевые действия
  const performAttack = useCallback((attackerId: string, targetId: string) => {
    if (!state?.battleEngine) return null;
    
    return state.battleEngine.performAttack(attackerId, targetId);
  }, [state?.battleEngine]);

  const healToken = useCallback((tokenId: string, amount: number) => {
    if (!state?.battleEngine) return;
    
    state.battleEngine.healToken(tokenId, amount);
  }, [state?.battleEngine]);

  // Получение данных
  const getBattleState = useCallback(() => {
    return state?.battleEngine?.getBattleState() || null;
  }, [state?.battleEngine]);

  const getInitiativeOrder = useCallback(() => {
    return state?.battleEngine?.getInitiativeOrder() || [];
  }, [state?.battleEngine]);

  const getTokens = useCallback(() => {
    return state?.battleEngine?.getBattleState().tokens || [];
  }, [state?.battleEngine]);

  const getToken = useCallback((tokenId: string) => {
    return state?.battleEngine?.getToken(tokenId) || null;
  }, [state?.battleEngine]);

  return {
    // Состояние
    isLoading: state?.isLoading ?? true,
    error: state?.error ?? null,
    battleEvents,
    
    // Системы (для прямого доступа если нужно)
    battleEngine: state?.battleEngine ?? null,
    fogOfWar: state?.fogOfWar ?? null,
    gridSystem: state?.gridSystem ?? null,
    modelRegistry: state?.modelRegistry ?? null,
    modelLoader: state?.modelLoader ?? null,
    
    // Действия с боем
    startBattle,
    endBattle,
    nextTurn,
    
    // Действия с токенами  
    addToken,
    removeToken,
    moveToken,
    
    // Действия с монстрами
    searchMonsters,
    loadMonster,
    addMonsterToMap,
    
    // Действия с туманом войны
    toggleFogOfWar,
    revealArea,
    
    // Боевые действия
    performAttack,
    healToken,
    
    // Получение данных
    getBattleState,
    getInitiativeOrder,
    getTokens,
    getToken,
  };
};