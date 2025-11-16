// src/vtt/utils/tokenAdapter.ts
// Adapter to convert Zustand EnhancedToken to WebGL VTTToken

import type { EnhancedToken } from '@/stores/enhancedBattleStore';
import type { VTTToken } from '../types/token';

/**
 * Convert EnhancedToken (from Zustand store) to VTTToken (for WebGL renderer)
 */
export function enhancedTokenToVTT(token: EnhancedToken): VTTToken {
  return {
    id: token.id,
    name: token.name,
    position: [token.position[0], token.position[1]], // Convert [x,y,z] to [x,y]
    size: token.size || 1,
    color: token.color || (token.isEnemy ? '#ff4444' : '#4444ff'),
    imageUrl: token.avatarUrl || token.image_url,
    isSelected: false, // Will be managed by renderer
    hp: token.hp,
    maxHp: token.maxHp,
    ac: token.ac,
    initiative: token.initiative,
    conditions: token.conditions || [],
    isPlayer: !token.isEnemy,
    isVisible: token.isVisible !== false
  };
}

/**
 * Batch convert multiple tokens
 */
export function convertTokensToVTT(tokens: EnhancedToken[]): VTTToken[] {
  return tokens.map(enhancedTokenToVTT);
}
