/**
 * Система действий для D&D 5e
 * Атака, движение, заклинания, предметы
 */

import { ActionType } from './Rules';

export { ActionType };

export interface ActionResult {
  success: boolean;
  message: string;
  damage?: number;
  effects?: string[];
}

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  description: string;
  range?: number;
  damage?: string;
  savingThrow?: {
    ability: string;
    dc: number;
  };
  conditions?: string[];
}

export interface ActionResources {
  actions: number;
  bonusActions: number;
  reactions: number;
  movement: number;
  maxActions: number;
  maxBonusActions: number;
  maxReactions: number;
  maxMovement: number;
}

export class ActionSystem {
  private resources: Map<string, ActionResources> = new Map();

  /**
   * Инициализация ресурсов действий для токена
   */
  initializeResources(tokenId: string, maxMovement: number = 6): void {
    this.resources.set(tokenId, {
      actions: 1,
      bonusActions: 1,
      reactions: 1,
      movement: maxMovement,
      maxActions: 1,
      maxBonusActions: 1,
      maxReactions: 1,
      maxMovement,
    });
  }

  /**
   * Получение текущих ресурсов токена
   */
  getResources(tokenId: string): ActionResources | null {
    return this.resources.get(tokenId) || null;
  }

  /**
   * Проверка возможности выполнить действие
   */
  canPerformAction(tokenId: string, actionType: ActionType, cost: number = 1): boolean {
    const resources = this.resources.get(tokenId);
    if (!resources) return false;

    switch (actionType) {
      case ActionType.Action:
        return resources.actions >= cost;
      case ActionType.BonusAction:
        return resources.bonusActions >= cost;
      case ActionType.Reaction:
        return resources.reactions >= cost;
      case ActionType.Movement:
        return resources.movement >= cost;
      case ActionType.Free:
        return true; // Свободные действия не ограничены
      default:
        return false;
    }
  }

  /**
   * Потратить ресурсы на действие
   */
  consumeAction(tokenId: string, actionType: ActionType, cost: number = 1): boolean {
    if (!this.canPerformAction(tokenId, actionType, cost)) {
      return false;
    }

    const resources = this.resources.get(tokenId);
    if (!resources) return false;

    switch (actionType) {
      case ActionType.Action:
        resources.actions -= cost;
        break;
      case ActionType.BonusAction:
        resources.bonusActions -= cost;
        break;
      case ActionType.Reaction:
        resources.reactions -= cost;
        break;
      case ActionType.Movement:
        resources.movement -= cost;
        break;
      case ActionType.Free:
        // Свободные действия не тратят ресурсы
        break;
    }

    return true;
  }

  /**
   * Сброс ресурсов в начале хода
   */
  resetTurnResources(tokenId: string): void {
    const resources = this.resources.get(tokenId);
    if (!resources) return;

    resources.actions = resources.maxActions;
    resources.bonusActions = resources.maxBonusActions;
    resources.movement = resources.maxMovement;
    // Реакции сбрасываются в начале раунда, не хода
  }

  /**
   * Сброс реакций в начале раунда
   */
  resetRoundResources(tokenId: string): void {
    const resources = this.resources.get(tokenId);
    if (!resources) return;

    resources.reactions = resources.maxReactions;
  }

  /**
   * Выполнение атаки
   */
  performAttack(
    attackerId: string,
    targetId: string,
    attackBonus: number,
    targetAC: number,
    damageRoll: string
  ): ActionResult {
    // Бросок атаки
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const totalAttack = attackRoll + attackBonus;

    // Критическое попадание
    const isCritical = attackRoll === 20;
    // Критический промах
    const isCriticalMiss = attackRoll === 1;

    if (isCriticalMiss) {
      return {
        success: false,
        message: `Критический промах! (${attackRoll})`,
      };
    }

    if (totalAttack < targetAC && !isCritical) {
      return {
        success: false,
        message: `Промах! (${totalAttack} vs AC ${targetAC})`,
      };
    }

    // Рассчет урона
    let damage = this.rollDamage(damageRoll);
    if (isCritical) {
      damage = this.rollDamage(damageRoll) + damage; // Удвоение костей
    }

    return {
      success: true,
      message: isCritical 
        ? `Критическое попадание! (${attackRoll}) - ${damage} урона`
        : `Попадание! (${totalAttack} vs AC ${targetAC}) - ${damage} урона`,
      damage,
    };
  }

  /**
   * Бросок урона
   */
  private rollDamage(damageRoll: string): number {
    // Простая обработка формата "1d8+3"
    const match = damageRoll.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 0;

    const [, diceCount, diceSize, modifier] = match;
    const count = parseInt(diceCount);
    const size = parseInt(diceSize);
    const mod = parseInt(modifier || '0');

    let total = mod;
    for (let i = 0; i < count; i++) {
      total += Math.floor(Math.random() * size) + 1;
    }

    return Math.max(0, total);
  }

  /**
   * Выполнение лечения
   */
  performHeal(targetId: string, healAmount: number): ActionResult {
    return {
      success: true,
      message: `Исцеление на ${healAmount} HP`,
      damage: -healAmount, // Отрицательный урон = лечение
    };
  }

  /**
   * Применение заклинания
   */
  performSpell(
    casterId: string,
    spellName: string,
    targets: string[],
    effect: string
  ): ActionResult {
    return {
      success: true,
      message: `${spellName} применено на ${targets.length} цел${targets.length > 1 ? 'ей' : 'ь'}`,
      effects: [effect],
    };
  }

  /**
   * Удаление токена из системы
   */
  removeToken(tokenId: string): void {
    this.resources.delete(tokenId);
  }

  /**
   * Получение всех доступных действий для токена
   */
  getAvailableActions(tokenId: string): Action[] {
    const resources = this.getResources(tokenId);
    if (!resources) return [];

    const actions: Action[] = [];

    // Базовые действия
    if (resources.actions > 0) {
      actions.push({
        id: 'attack',
        name: 'Атака',
        type: ActionType.Action,
        description: 'Атаковать цель в ближнем или дальнем бою',
        range: 1,
      });

      actions.push({
        id: 'cast_spell',
        name: 'Заклинание',
        type: ActionType.Action,
        description: 'Сотворить заклинание',
      });
    }

    // Бонусные действия
    if (resources.bonusActions > 0) {
      actions.push({
        id: 'second_wind',
        name: 'Второе дыхание',
        type: ActionType.BonusAction,
        description: 'Восстановить HP',
      });
    }

    // Свободные действия всегда доступны
    actions.push({
      id: 'interact',
      name: 'Взаимодействие',
      type: ActionType.Free,
      description: 'Взаимодействовать с объектом',
    });

    return actions;
  }
}