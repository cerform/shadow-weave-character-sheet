/**
 * Система инициативы для D&D 5e
 */

import { INITIATIVE_RULES } from './Rules';

export interface InitiativeEntry {
  tokenId: string;
  name: string;
  initiative: number;
  dexterityModifier: number;
  hasActed: boolean;
}

export interface InitiativeOrder {
  entries: InitiativeEntry[];
  currentIndex: number;
  round: number;
}

export class InitiativeSystem {
  private order: InitiativeOrder = {
    entries: [],
    currentIndex: 0,
    round: 0,
  };

  /**
   * Бросок инициативы для токена
   */
  rollInitiative(tokenId: string, name: string, dexterityModifier: number): number {
    const roll = Math.floor(Math.random() * INITIATIVE_RULES.BASE_DICE) + 1;
    return roll + dexterityModifier;
  }

  /**
   * Добавление токена в порядок инициативы
   */
  addToInitiative(tokenId: string, name: string, dexterityModifier: number): void {
    const initiative = this.rollInitiative(tokenId, name, dexterityModifier);
    
    const entry: InitiativeEntry = {
      tokenId,
      name,
      initiative,
      dexterityModifier,
      hasActed: false,
    };

    this.order.entries.push(entry);
    this.sortInitiativeOrder();
  }

  /**
   * Сортировка порядка инициативы
   */
  private sortInitiativeOrder(): void {
    this.order.entries.sort((a, b) => {
      // Сначала по инициативе (убывание)
      if (b.initiative !== a.initiative) {
        return b.initiative - a.initiative;
      }
      // При равенстве - по модификатору ловкости (убывание)
      return b.dexterityModifier - a.dexterityModifier;
    });
  }

  /**
   * Получение текущего активного токена
   */
  getCurrentToken(): InitiativeEntry | null {
    if (this.order.entries.length === 0) return null;
    return this.order.entries[this.order.currentIndex] || null;
  }

  /**
   * Переход к следующему ходу
   */
  nextTurn(): InitiativeEntry | null {
    if (this.order.entries.length === 0) return null;

    // Отмечаем текущего как совершившего ход
    const current = this.order.entries[this.order.currentIndex];
    if (current) {
      current.hasActed = true;
    }

    // Переходим к следующему
    this.order.currentIndex++;
    
    // Если достигли конца списка - новый раунд
    if (this.order.currentIndex >= this.order.entries.length) {
      this.startNewRound();
    }

    return this.getCurrentToken();
  }

  /**
   * Начало нового раунда
   */
  private startNewRound(): void {
    this.order.round++;
    this.order.currentIndex = 0;
    
    // Сбрасываем флаги действий
    this.order.entries.forEach(entry => {
      entry.hasActed = false;
    });
  }

  /**
   * Удаление токена из инициативы
   */
  removeFromInitiative(tokenId: string): void {
    const index = this.order.entries.findIndex(entry => entry.tokenId === tokenId);
    if (index === -1) return;

    // Если удаляем токен до текущего - корректируем индекс
    if (index < this.order.currentIndex) {
      this.order.currentIndex--;
    }

    this.order.entries.splice(index, 1);

    // Если удалили последний токен - корректируем индекс
    if (this.order.currentIndex >= this.order.entries.length) {
      this.order.currentIndex = 0;
    }
  }

  /**
   * Сброс инициативы
   */
  resetInitiative(): void {
    this.order = {
      entries: [],
      currentIndex: 0,
      round: 0,
    };
  }

  /**
   * Получение полного порядка инициативы
   */
  getInitiativeOrder(): InitiativeOrder {
    return { ...this.order };
  }

  /**
   * Принудительная установка активного токена
   */
  setCurrentToken(tokenId: string): boolean {
    const index = this.order.entries.findIndex(entry => entry.tokenId === tokenId);
    if (index === -1) return false;

    this.order.currentIndex = index;
    return true;
  }

  /**
   * Получение раунда
   */
  getCurrentRound(): number {
    return this.order.round;
  }

  /**
   * Проверка, может ли токен действовать
   */
  canTokenAct(tokenId: string): boolean {
    const current = this.getCurrentToken();
    return current?.tokenId === tokenId && !current.hasActed;
  }
}