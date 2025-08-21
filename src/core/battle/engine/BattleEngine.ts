/**
 * Основной движок боевой системы D&D 5e
 * Координирует инициативу, действия, состояния токенов
 */

import { InitiativeSystem, InitiativeEntry } from './Initiative';
import { ActionSystem, ActionResult, ActionType } from './Actions';
import { Condition } from './Rules';

export interface BattleToken {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  position: [number, number, number];
  conditions: Condition[];
  isEnemy: boolean;
  isPlayer: boolean;
  dexterityModifier: number;
  attackBonus: number;
  damageRoll: string;
}

export interface BattleState {
  isActive: boolean;
  round: number;
  phase: 'setup' | 'initiative' | 'combat' | 'ended';
  tokens: BattleToken[];
  currentTokenId: string | null;
  events: BattleEvent[];
}

export interface BattleEvent {
  id: string;
  timestamp: number;
  round: number;
  actor: string;
  action: string;
  target?: string;
  result: string;
  damage?: number;
}

export type BattleEventCallback = (event: BattleEvent) => void;

export class BattleEngine {
  private state: BattleState;
  private initiative: InitiativeSystem;
  private actions: ActionSystem;
  private eventCallbacks: BattleEventCallback[] = [];

  constructor() {
    this.state = {
      isActive: false,
      round: 0,
      phase: 'setup',
      tokens: [],
      currentTokenId: null,
      events: [],
    };
    
    this.initiative = new InitiativeSystem();
    this.actions = new ActionSystem();
  }

  /**
   * Добавление токена в бой
   */
  addToken(token: BattleToken): void {
    // Проверяем, что токен не существует
    if (this.state.tokens.find(t => t.id === token.id)) {
      console.warn(`Token ${token.id} already exists in battle`);
      return;
    }

    this.state.tokens.push(token);
    
    // Инициализируем ресурсы действий
    this.actions.initializeResources(token.id, token.speed);
    
    // Если бой уже идет, добавляем в инициативу
    if (this.state.phase === 'combat') {
      this.initiative.addToInitiative(token.id, token.name, token.dexterityModifier);
    }

    this.addEvent({
      actor: token.name,
      action: 'Вступил в бой',
      result: `${token.name} присоединился к битве`,
    });
  }

  /**
   * Удаление токена из боя
   */
  removeToken(tokenId: string): void {
    const token = this.getToken(tokenId);
    if (!token) return;

    // Удаляем из списка токенов
    this.state.tokens = this.state.tokens.filter(t => t.id !== tokenId);
    
    // Удаляем из инициативы
    this.initiative.removeFromInitiative(tokenId);
    
    // Удаляем из системы действий
    this.actions.removeToken(tokenId);

    // Если это был текущий токен, переходим к следующему
    if (this.state.currentTokenId === tokenId) {
      this.nextTurn();
    }

    this.addEvent({
      actor: token.name,
      action: 'Покинул бой',
      result: `${token.name} покинул битву`,
    });
  }

  /**
   * Начало боя и бросок инициативы
   */
  startBattle(): void {
    if (this.state.tokens.length === 0) {
      throw new Error('Cannot start battle without tokens');
    }

    this.state.isActive = true;
    this.state.phase = 'initiative';

    // Бросаем инициативу для всех токенов
    this.state.tokens.forEach(token => {
      this.initiative.addToInitiative(token.id, token.name, token.dexterityModifier);
    });

    // Переходим к первому ходу
    this.state.phase = 'combat';
    this.state.round = 1;
    
    const firstToken = this.initiative.getCurrentToken();
    this.state.currentTokenId = firstToken?.tokenId || null;

    this.addEvent({
      actor: 'Система',
      action: 'Начало боя',
      result: 'Бой начался! Порядок инициативы определен.',
    });

    // Уведомляем о первом ходе
    if (firstToken) {
      this.addEvent({
        actor: firstToken.name,
        action: 'Ход',
        result: `Ход ${firstToken.name}`,
      });
    }
  }

  /**
   * Завершение боя
   */
  endBattle(): void {
    this.state.isActive = false;
    this.state.phase = 'ended';
    this.state.currentTokenId = null;
    
    this.initiative.resetInitiative();

    this.addEvent({
      actor: 'Система',
      action: 'Конец боя',
      result: 'Бой завершен.',
    });
  }

  /**
   * Переход к следующему ходу
   */
  nextTurn(): BattleToken | null {
    const nextEntry = this.initiative.nextTurn();
    const newRound = this.initiative.getCurrentRound();
    
    // Проверяем, начался ли новый раунд
    if (newRound > this.state.round) {
      this.state.round = newRound;
      this.addEvent({
        actor: 'Система',
        action: 'Новый раунд',
        result: `Начался раунд ${newRound}`,
      });

      // Сбрасываем реакции для всех токенов
      this.state.tokens.forEach(token => {
        this.actions.resetRoundResources(token.id);
      });
    }

    if (nextEntry) {
      this.state.currentTokenId = nextEntry.tokenId;
      
      // Сбрасываем ресурсы хода для нового активного токена
      this.actions.resetTurnResources(nextEntry.tokenId);
      
      this.addEvent({
        actor: nextEntry.name,
        action: 'Ход',
        result: `Ход ${nextEntry.name}`,
      });

      return this.getToken(nextEntry.tokenId);
    }

    return null;
  }

  /**
   * Выполнение атаки
   */
  performAttack(attackerId: string, targetId: string): ActionResult {
    const attacker = this.getToken(attackerId);
    const target = this.getToken(targetId);

    if (!attacker || !target) {
      return {
        success: false,
        message: 'Неверные участники атаки',
      };
    }

    // Проверяем, может ли атакующий совершить действие
    if (!this.actions.canPerformAction(attackerId, ActionType.Action)) {
      return {
        success: false,
        message: `${attacker.name} уже использовал свое действие`,
      };
    }

    // Выполняем атаку
    const result = this.actions.performAttack(
      attackerId,
      targetId,
      attacker.attackBonus,
      target.ac,
      attacker.damageRoll
    );

    if (result.success) {
      // Тратим действие
      this.actions.consumeAction(attackerId, ActionType.Action);

      // Применяем урон
      if (result.damage) {
        this.applyDamage(targetId, result.damage);
      }
    }

    // Логируем событие
    this.addEvent({
      actor: attacker.name,
      action: 'Атака',
      target: target.name,
      result: result.message,
      damage: result.damage,
    });

    return result;
  }

  /**
   * Перемещение токена
   */
  moveToken(tokenId: string, newPosition: [number, number, number], distance: number): boolean {
    const token = this.getToken(tokenId);
    if (!token) return false;

    // Проверяем доступность движения
    if (!this.actions.canPerformAction(tokenId, ActionType.Movement, distance)) {
      return false;
    }

    // Перемещаем токен
    token.position = newPosition;
    
    // Тратим движение
    this.actions.consumeAction(tokenId, ActionType.Movement, distance);

    this.addEvent({
      actor: token.name,
      action: 'Перемещение',
      result: `${token.name} переместился на ${distance} клеток`,
    });

    return true;
  }

  /**
   * Применение урона
   */
  applyDamage(tokenId: string, damage: number): void {
    const token = this.getToken(tokenId);
    if (!token) return;

    const oldHp = token.hp;
    token.hp = Math.max(0, token.hp - damage);

    // Проверяем смерть
    if (token.hp === 0 && oldHp > 0) {
      this.addCondition(tokenId, Condition.Unconscious);
      this.addEvent({
        actor: token.name,
        action: 'Потеря сознания',
        result: `${token.name} потерял сознание`,
      });
    }
  }

  /**
   * Лечение токена
   */
  healToken(tokenId: string, healAmount: number): void {
    const token = this.getToken(tokenId);
    if (!token) return;

    const oldHp = token.hp;
    token.hp = Math.min(token.maxHp, token.hp + healAmount);
    const actualHeal = token.hp - oldHp;

    // Убираем бессознательность если HP > 0
    if (token.hp > 0 && token.conditions.includes(Condition.Unconscious)) {
      this.removeCondition(tokenId, Condition.Unconscious);
    }

    this.addEvent({
      actor: token.name,
      action: 'Лечение',
      result: `${token.name} восстановил ${actualHeal} HP`,
    });
  }

  /**
   * Добавление состояния
   */
  addCondition(tokenId: string, condition: Condition): void {
    const token = this.getToken(tokenId);
    if (!token || token.conditions.includes(condition)) return;

    token.conditions.push(condition);

    this.addEvent({
      actor: token.name,
      action: 'Состояние',
      result: `${token.name} получил состояние: ${condition}`,
    });
  }

  /**
   * Удаление состояния
   */
  removeCondition(tokenId: string, condition: Condition): void {
    const token = this.getToken(tokenId);
    if (!token) return;

    token.conditions = token.conditions.filter(c => c !== condition);

    this.addEvent({
      actor: token.name,
      action: 'Состояние',
      result: `${token.name} избавился от состояния: ${condition}`,
    });
  }

  /**
   * Получение токена по ID
   */
  getToken(tokenId: string): BattleToken | null {
    return this.state.tokens.find(t => t.id === tokenId) || null;
  }

  /**
   * Получение текущего состояния боя
   */
  getBattleState(): BattleState {
    return { ...this.state };
  }

  /**
   * Получение порядка инициативы
   */
  getInitiativeOrder(): InitiativeEntry[] {
    return this.initiative.getInitiativeOrder().entries;
  }

  /**
   * Получение ресурсов действий токена
   */
  getTokenResources(tokenId: string) {
    return this.actions.getResources(tokenId);
  }

  /**
   * Проверка, может ли токен действовать
   */
  canTokenAct(tokenId: string): boolean {
    return this.state.currentTokenId === tokenId && this.state.phase === 'combat';
  }

  /**
   * Подписка на события боя
   */
  onBattleEvent(callback: BattleEventCallback): () => void {
    this.eventCallbacks.push(callback);
    
    // Возвращаем функцию отписки
    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Добавление события в лог
   */
  private addEvent(eventData: Omit<BattleEvent, 'id' | 'timestamp' | 'round'>): void {
    const event: BattleEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      round: this.state.round,
      ...eventData,
    };

    this.state.events.push(event);
    
    // Уведомляем подписчиков
    this.eventCallbacks.forEach(callback => callback(event));

    // Ограничиваем размер лога
    if (this.state.events.length > 100) {
      this.state.events = this.state.events.slice(-100);
    }
  }

  /**
   * Получение истории событий
   */
  getEventHistory(): BattleEvent[] {
    return [...this.state.events];
  }

  /**
   * Сброс боевой системы
   */
  reset(): void {
    this.state = {
      isActive: false,
      round: 0,
      phase: 'setup',
      tokens: [],
      currentTokenId: null,
      events: [],
    };
    
    this.initiative.resetInitiative();
    this.eventCallbacks = [];
  }
}