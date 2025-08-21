/**
 * Система аур токенов
 * Радиусы эффектов, видимость для игроков, цвета
 */

import { GridSystem, GridPosition } from '../../map/engine/Grid';

export interface Aura {
  id: string;
  tokenId: string;
  name: string;
  radiusFeet: number;
  color: string;
  opacity: number; // 0-1
  visibleToPlayers: boolean;
  shape: 'circle' | 'square';
  effect?: {
    type: 'buff' | 'debuff' | 'neutral';
    description: string;
  };
  enabled: boolean;
}

export interface AuraState {
  auras: Aura[];
  affectedTokens: Map<string, string[]>; // tokenId -> auraIds[]
}

export class AuraEngine {
  private grid: GridSystem;
  private state: AuraState = {
    auras: [],
    affectedTokens: new Map()
  };
  
  private tokenPositions: Map<string, { x: number; y: number }> = new Map();
  private callbacks: Array<(state: AuraState) => void> = [];

  constructor(grid: GridSystem) {
    this.grid = grid;
  }

  /**
   * Добавляет ауру к токену
   */
  addAura(tokenId: string, aura: Omit<Aura, 'id' | 'tokenId'>): string {
    const id = `aura_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAura: Aura = {
      ...aura,
      id,
      tokenId
    };

    this.state.auras.push(newAura);
    this.recomputeAffectedTokens();
    this.notifyChange();
    return id;
  }

  /**
   * Обновляет ауру
   */
  updateAura(id: string, updates: Partial<Omit<Aura, 'id' | 'tokenId'>>): boolean {
    const auraIndex = this.state.auras.findIndex(a => a.id === id);
    if (auraIndex === -1) return false;

    this.state.auras[auraIndex] = { ...this.state.auras[auraIndex], ...updates };
    this.recomputeAffectedTokens();
    this.notifyChange();
    return true;
  }

  /**
   * Удаляет ауру
   */
  removeAura(id: string): boolean {
    const initialLength = this.state.auras.length;
    this.state.auras = this.state.auras.filter(a => a.id !== id);
    
    if (this.state.auras.length < initialLength) {
      this.recomputeAffectedTokens();
      this.notifyChange();
      return true;
    }
    return false;
  }

  /**
   * Удаляет все ауры токена
   */
  removeTokenAuras(tokenId: string): number {
    const initialLength = this.state.auras.length;
    this.state.auras = this.state.auras.filter(a => a.tokenId !== tokenId);
    
    const removedCount = initialLength - this.state.auras.length;
    if (removedCount > 0) {
      this.tokenPositions.delete(tokenId);
      this.recomputeAffectedTokens();
      this.notifyChange();
    }
    return removedCount;
  }

  /**
   * Включает/выключает ауру
   */
  toggleAura(id: string, enabled?: boolean): boolean {
    const aura = this.state.auras.find(a => a.id === id);
    if (!aura) return false;

    aura.enabled = enabled !== undefined ? enabled : !aura.enabled;
    this.recomputeAffectedTokens();
    this.notifyChange();
    return true;
  }

  /**
   * Обновляет позицию токена
   */
  updateTokenPosition(tokenId: string, position: { x: number; y: number }): void {
    this.tokenPositions.set(tokenId, position);
    this.recomputeAffectedTokens();
    this.notifyChange();
  }

  /**
   * Получает все ауры токена
   */
  getTokenAuras(tokenId: string): Aura[] {
    return this.state.auras.filter(a => a.tokenId === tokenId);
  }

  /**
   * Получает все активные ауры
   */
  getActiveAuras(): Aura[] {
    return this.state.auras.filter(a => a.enabled);
  }

  /**
   * Получает ауры, влияющие на токен
   */
  getAurasAffectingToken(tokenId: string): Aura[] {
    const auraIds = this.state.affectedTokens.get(tokenId) || [];
    return auraIds.map(id => this.state.auras.find(a => a.id === id))
                  .filter((a): a is Aura => a !== undefined);
  }

  /**
   * Получает токены в радиусе ауры
   */
  getTokensInAura(auraId: string): string[] {
    const aura = this.state.auras.find(a => a.id === auraId);
    if (!aura || !aura.enabled) return [];

    const sourcePosition = this.tokenPositions.get(aura.tokenId);
    if (!sourcePosition) return [];

    const affectedTokens: string[] = [];
    const radiusCells = Math.ceil(aura.radiusFeet / this.grid.getConfig().feetPerCell);

    for (const [tokenId, position] of this.tokenPositions.entries()) {
      if (tokenId === aura.tokenId) continue; // Не включаем источник ауры

      const distance = this.grid.getDistance(
        this.grid.pixelsToGrid(sourcePosition.x, sourcePosition.y),
        this.grid.pixelsToGrid(position.x, position.y)
      );

      if (distance.feet <= aura.radiusFeet) {
        affectedTokens.push(tokenId);
      }
    }

    return affectedTokens;
  }

  /**
   * Получает клетки, покрытые аурой
   */
  getAuraCells(auraId: string): GridPosition[] {
    const aura = this.state.auras.find(a => a.id === auraId);
    if (!aura || !aura.enabled) return [];

    const sourcePosition = this.tokenPositions.get(aura.tokenId);
    if (!sourcePosition) return [];

    const sourceGrid = this.grid.pixelsToGrid(sourcePosition.x, sourcePosition.y);
    const radiusCells = Math.ceil(aura.radiusFeet / this.grid.getConfig().feetPerCell);

    if (aura.shape === 'circle') {
      return this.grid.getRadius(sourceGrid, radiusCells);
    } else {
      // Square aura
      const cells: GridPosition[] = [];
      for (let x = sourceGrid.x - radiusCells; x <= sourceGrid.x + radiusCells; x++) {
        for (let y = sourceGrid.y - radiusCells; y <= sourceGrid.y + radiusCells; y++) {
          cells.push({ x, y });
        }
      }
      return cells;
    }
  }

  /**
   * Проверяет, влияет ли аура на позицию
   */
  isPositionInAura(auraId: string, position: { x: number; y: number }): boolean {
    const aura = this.state.auras.find(a => a.id === auraId);
    if (!aura || !aura.enabled) return false;

    const sourcePosition = this.tokenPositions.get(aura.tokenId);
    if (!sourcePosition) return false;

    const distance = this.grid.getDistance(
      this.grid.pixelsToGrid(sourcePosition.x, sourcePosition.y),
      this.grid.pixelsToGrid(position.x, position.y)
    );

    return distance.feet <= aura.radiusFeet;
  }

  /**
   * Получает информацию об эффектах в позиции
   */
  getEffectsAtPosition(position: { x: number; y: number }): Array<{
    aura: Aura;
    distance: number;
  }> {
    const effects: Array<{ aura: Aura; distance: number }> = [];

    for (const aura of this.state.auras) {
      if (!aura.enabled || !aura.effect) continue;

      const sourcePosition = this.tokenPositions.get(aura.tokenId);
      if (!sourcePosition) continue;

      const distance = this.grid.getDistance(
        this.grid.pixelsToGrid(sourcePosition.x, sourcePosition.y),
        this.grid.pixelsToGrid(position.x, position.y)
      );

      if (distance.feet <= aura.radiusFeet) {
        effects.push({ aura, distance: distance.feet });
      }
    }

    return effects.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Очищает все ауры
   */
  clearAllAuras(): void {
    this.state.auras = [];
    this.state.affectedTokens.clear();
    this.tokenPositions.clear();
    this.notifyChange();
  }

  getState(): AuraState {
    return {
      auras: [...this.state.auras],
      affectedTokens: new Map(this.state.affectedTokens)
    };
  }

  private recomputeAffectedTokens(): void {
    this.state.affectedTokens.clear();

    for (const aura of this.state.auras) {
      if (!aura.enabled) continue;

      const affectedTokenIds = this.getTokensInAura(aura.id);
      for (const tokenId of affectedTokenIds) {
        const existing = this.state.affectedTokens.get(tokenId) || [];
        existing.push(aura.id);
        this.state.affectedTokens.set(tokenId, existing);
      }
    }
  }

  private notifyChange(): void {
    this.callbacks.forEach(callback => callback(this.getState()));
  }

  onChange(callback: (state: AuraState) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}