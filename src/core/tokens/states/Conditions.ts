/**
 * Система состояний D&D 5e
 * Conditions: prone, stunned, poisoned, etc.
 */

export type ConditionType = 
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious'
  | 'exhaustion'
  | 'concentrating'
  | 'blessed'
  | 'cursed'
  | 'hasted'
  | 'slowed'
  | 'raging'
  | 'marked'
  | 'inspired';

export interface Condition {
  type: ConditionType;
  name: string;
  description: string;
  icon: string; // Unicode emoji или CSS class
  color: string;
  duration?: {
    type: 'rounds' | 'minutes' | 'hours' | 'permanent' | 'concentration';
    value?: number;
    remaining?: number;
  };
  source?: string; // что наложило состояние
  saveType?: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  saveDC?: number;
  effects: ConditionEffect[];
}

export interface ConditionEffect {
  type: 'advantage' | 'disadvantage' | 'immunity' | 'resistance' | 'vulnerability' | 'modifier' | 'prevent_action';
  target: 'attack_rolls' | 'saving_throws' | 'ability_checks' | 'damage' | 'speed' | 'ac' | 'all_actions' | 'movement';
  value?: number; // для модификаторов
  damageTypes?: string[]; // для урона
}

export interface TokenConditionState {
  tokenId: string;
  conditions: Map<ConditionType, Condition>;
  immunities: Set<ConditionType>;
  resistances: Set<ConditionType>;
}

export class ConditionsEngine {
  private tokenStates: Map<string, TokenConditionState> = new Map();
  private conditionDefinitions: Map<ConditionType, Omit<Condition, 'duration' | 'source'>> = new Map();
  private callbacks: Array<(tokenId: string, conditions: Condition[]) => void> = [];

  constructor() {
    this.initializeConditionDefinitions();
  }

  /**
   * Добавляет состояние токену
   */
  addCondition(tokenId: string, condition: Condition): boolean {
    let tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) {
      tokenState = {
        tokenId,
        conditions: new Map(),
        immunities: new Set(),
        resistances: new Set()
      };
      this.tokenStates.set(tokenId, tokenState);
    }

    // Проверяем иммунитет
    if (tokenState.immunities.has(condition.type)) {
      return false;
    }

    // Если состояние уже есть, обновляем длительность
    const existing = tokenState.conditions.get(condition.type);
    if (existing && existing.duration && condition.duration) {
      if (condition.duration.value && existing.duration.remaining) {
        existing.duration.remaining = Math.max(
          existing.duration.remaining,
          condition.duration.value
        );
      }
    } else {
      tokenState.conditions.set(condition.type, { ...condition });
    }

    this.notifyChange(tokenId);
    return true;
  }

  /**
   * Удаляет состояние у токена
   */
  removeCondition(tokenId: string, conditionType: ConditionType): boolean {
    const tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) return false;

    const removed = tokenState.conditions.delete(conditionType);
    if (removed) {
      this.notifyChange(tokenId);
    }
    return removed;
  }

  /**
   * Проверяет, есть ли у токена состояние
   */
  hasCondition(tokenId: string, conditionType: ConditionType): boolean {
    const tokenState = this.tokenStates.get(tokenId);
    return tokenState?.conditions.has(conditionType) || false;
  }

  /**
   * Получает все состояния токена
   */
  getConditions(tokenId: string): Condition[] {
    const tokenState = this.tokenStates.get(tokenId);
    return tokenState ? Array.from(tokenState.conditions.values()) : [];
  }

  /**
   * Получает конкретное состояние токена
   */
  getCondition(tokenId: string, conditionType: ConditionType): Condition | null {
    const tokenState = this.tokenStates.get(tokenId);
    return tokenState?.conditions.get(conditionType) || null;
  }

  /**
   * Устанавливает иммунитет к состоянию
   */
  setImmunity(tokenId: string, conditionType: ConditionType, immune = true): void {
    let tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) {
      tokenState = {
        tokenId,
        conditions: new Map(),
        immunities: new Set(),
        resistances: new Set()
      };
      this.tokenStates.set(tokenId, tokenState);
    }

    if (immune) {
      tokenState.immunities.add(conditionType);
      // Удаляем состояние если оно есть
      tokenState.conditions.delete(conditionType);
    } else {
      tokenState.immunities.delete(conditionType);
    }

    this.notifyChange(tokenId);
  }

  /**
   * Устанавливает сопротивление к состоянию
   */
  setResistance(tokenId: string, conditionType: ConditionType, resistant = true): void {
    let tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) {
      tokenState = {
        tokenId,
        conditions: new Map(),
        immunities: new Set(),
        resistances: new Set()
      };
      this.tokenStates.set(tokenId, tokenState);
    }

    if (resistant) {
      tokenState.resistances.add(conditionType);
    } else {
      tokenState.resistances.delete(conditionType);
    }
  }

  /**
   * Обновляет длительность состояний (вызывается каждый раунд)
   */
  updateDurations(tokenId: string): Condition[] {
    const tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) return [];

    const expiredConditions: Condition[] = [];

    for (const [conditionType, condition] of tokenState.conditions.entries()) {
      if (!condition.duration || condition.duration.type === 'permanent') continue;

      if (condition.duration.type === 'rounds' && condition.duration.remaining !== undefined) {
        condition.duration.remaining--;
        if (condition.duration.remaining <= 0) {
          expiredConditions.push(condition);
          tokenState.conditions.delete(conditionType);
        }
      }
    }

    if (expiredConditions.length > 0) {
      this.notifyChange(tokenId);
    }

    return expiredConditions;
  }

  /**
   * Удаляет состояния концентрации при потере концентрации
   */
  breakConcentration(tokenId: string): Condition[] {
    const tokenState = this.tokenStates.get(tokenId);
    if (!tokenState) return [];

    const brokenConditions: Condition[] = [];

    for (const [conditionType, condition] of tokenState.conditions.entries()) {
      if (condition.duration?.type === 'concentration') {
        brokenConditions.push(condition);
        tokenState.conditions.delete(conditionType);
      }
    }

    if (brokenConditions.length > 0) {
      this.notifyChange(tokenId);
    }

    return brokenConditions;
  }

  /**
   * Получает все эффекты состояний токена
   */
  getEffects(tokenId: string): ConditionEffect[] {
    const conditions = this.getConditions(tokenId);
    const effects: ConditionEffect[] = [];

    for (const condition of conditions) {
      effects.push(...condition.effects);
    }

    return effects;
  }

  /**
   * Проверяет, может ли токен выполнить действие
   */
  canPerformAction(tokenId: string, actionType: 'action' | 'bonus_action' | 'reaction' | 'movement'): boolean {
    const effects = this.getEffects(tokenId);
    
    for (const effect of effects) {
      if (effect.type === 'prevent_action') {
        if (effect.target === 'all_actions') return false;
        if (effect.target === 'movement' && actionType === 'movement') return false;
      }
    }

    // Специальные проверки для состояний
    if (this.hasCondition(tokenId, 'stunned') || 
        this.hasCondition(tokenId, 'paralyzed') ||
        this.hasCondition(tokenId, 'petrified') ||
        this.hasCondition(tokenId, 'unconscious')) {
      return actionType === 'reaction' ? false : false; // Эти состояния блокируют большинство действий
    }

    if (this.hasCondition(tokenId, 'incapacitated')) {
      return actionType === 'movement'; // Недееспособный может только двигаться
    }

    return true;
  }

  /**
   * Очищает все состояния токена
   */
  clearAllConditions(tokenId: string): void {
    const tokenState = this.tokenStates.get(tokenId);
    if (tokenState) {
      tokenState.conditions.clear();
      this.notifyChange(tokenId);
    }
  }

  /**
   * Удаляет токен из системы состояний
   */
  removeToken(tokenId: string): void {
    this.tokenStates.delete(tokenId);
  }

  /**
   * Создает стандартное состояние по типу
   */
  createCondition(
    type: ConditionType, 
    duration?: Condition['duration'], 
    source?: string
  ): Condition {
    const definition = this.conditionDefinitions.get(type);
    if (!definition) {
      throw new Error(`Unknown condition type: ${type}`);
    }

    return {
      ...definition,
      duration,
      source
    };
  }

  private initializeConditionDefinitions(): void {
    const conditions: Array<Omit<Condition, 'duration' | 'source'>> = [
      {
        type: 'blinded',
        name: 'Ослеплён',
        description: 'Ослеплённое существо не может видеть и автоматически провалывает проверки характеристик, полагающиеся на зрение.',
        icon: '👁️‍🗨️',
        color: '#6b7280',
        effects: [
          { type: 'disadvantage', target: 'attack_rolls' },
          { type: 'advantage', target: 'attack_rolls' } // враги получают преимущество
        ]
      },
      {
        type: 'charmed',
        name: 'Очарован',
        description: 'Очарованное существо не может атаковать того, кто его очаровал, или нацеливать на него враждебные заклинания.',
        icon: '💖',
        color: '#ec4899',
        effects: []
      },
      {
        type: 'frightened',
        name: 'Испуган',
        description: 'Испуганное существо совершает с помехой броски характеристик и броски атаки, пока источник страха находится в пределах видимости.',
        icon: '😨',
        color: '#7c3aed',
        effects: [
          { type: 'disadvantage', target: 'attack_rolls' },
          { type: 'disadvantage', target: 'ability_checks' }
        ]
      },
      {
        type: 'poisoned',
        name: 'Отравлен',
        description: 'Отравленное существо совершает с помехой броски атаки и проверки характеристик.',
        icon: '🤢',
        color: '#10b981',
        effects: [
          { type: 'disadvantage', target: 'attack_rolls' },
          { type: 'disadvantage', target: 'ability_checks' }
        ]
      },
      {
        type: 'prone',
        name: 'Сбит с ног',
        description: 'Лежащее существо может только ползать или тратить половину скорости, чтобы встать.',
        icon: '⬇️',
        color: '#f59e0b',
        effects: [
          { type: 'disadvantage', target: 'attack_rolls' },
          { type: 'modifier', target: 'speed', value: 0 }
        ]
      },
      {
        type: 'stunned',
        name: 'Ошеломлён',
        description: 'Ошеломлённое существо недееспособно, не может двигаться и может говорить только с трудом.',
        icon: '😵',
        color: '#ef4444',
        effects: [
          { type: 'prevent_action', target: 'all_actions' }
        ]
      },
      {
        type: 'unconscious',
        name: 'Без сознания',
        description: 'Существо без сознания недееспособно, не может двигаться или говорить, и не замечает окружение.',
        icon: '😴',
        color: '#374151',
        effects: [
          { type: 'prevent_action', target: 'all_actions' }
        ]
      },
      {
        type: 'paralyzed',
        name: 'Парализован',
        description: 'Парализованное существо недееспособно и не может двигаться или говорить.',
        icon: '🥶',
        color: '#06b6d4',
        effects: [
          { type: 'prevent_action', target: 'all_actions' }
        ]
      },
      {
        type: 'concentrating',
        name: 'Концентрация',
        description: 'Поддерживает заклинание концентрации.',
        icon: '🧠',
        color: '#3b82f6',
        effects: []
      }
    ];

    for (const condition of conditions) {
      this.conditionDefinitions.set(condition.type, condition);
    }
  }

  private notifyChange(tokenId: string): void {
    const conditions = this.getConditions(tokenId);
    this.callbacks.forEach(callback => callback(tokenId, conditions));
  }

  onChange(callback: (tokenId: string, conditions: Condition[]) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}