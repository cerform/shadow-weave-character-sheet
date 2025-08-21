/**
 * Движок управления токенами
 */

import { GridSystem, GridPosition } from '../../map/engine/Grid';
import { Condition, CREATURE_SIZES, CreatureSize } from '../../battle/engine/Rules';

export interface TokenData {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  position: GridPosition;
  conditions: Condition[];
  isEnemy: boolean;
  size: CreatureSize;
  modelPath?: string;
}

export class TokenEngine {
  private tokens: Map<string, TokenData> = new Map();
  private grid: GridSystem;

  constructor(grid: GridSystem) {
    this.grid = grid;
  }

  addToken(token: TokenData): void {
    this.tokens.set(token.id, { ...token });
  }

  removeToken(tokenId: string): void {
    this.tokens.delete(tokenId);
  }

  moveToken(tokenId: string, newPosition: GridPosition): boolean {
    const token = this.tokens.get(tokenId);
    if (!token || !this.grid.isValidGridPosition(newPosition)) {
      return false;
    }

    token.position = newPosition;
    return true;
  }

  getToken(tokenId: string): TokenData | null {
    return this.tokens.get(tokenId) || null;
  }

  getAllTokens(): TokenData[] {
    return Array.from(this.tokens.values());
  }

  updateTokenHP(tokenId: string, newHp: number): void {
    const token = this.tokens.get(tokenId);
    if (token) {
      token.hp = Math.max(0, Math.min(token.maxHp, newHp));
    }
  }
}