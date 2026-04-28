import { supabase } from '@/integrations/supabase/client';
import { Character } from '@/types/character';

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollResult {
  formula: string;
  total: number;
  rolls: number[];
  modifier: number;
  playerName: string;
  reason?: string;
  timestamp: string;
  isCritical?: boolean;
}

/**
 * Unified Dice Service for Shadow Weave
 */
export const DiceService = {
  /**
   * Parses and rolls dice based on a formula (e.g., "1d20+5")
   */
  roll(formula: string, mode: RollMode = 'normal'): { total: number; rolls: number[]; modifier: number } {
    const cleanFormula = formula.replace(/\s+/g, '');
    const match = cleanFormula.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    
    if (!match) {
      return { total: 0, rolls: [], modifier: 0 };
    }

    const count = parseInt(match[1] || '1', 10);
    const sides = parseInt(match[2], 10);
    const modifier = parseInt(match[3] || '0', 10);

    const rollOnce = () => Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    
    let rolls = rollOnce();
    let total = rolls.reduce((a, b) => a + b, 0) + modifier;

    if (mode === 'advantage' || mode === 'disadvantage') {
      const rolls2 = rollOnce();
      const total2 = rolls2.reduce((a, b) => a + b, 0) + modifier;
      
      if (mode === 'advantage') {
        if (total2 > total) {
          total = total2;
          rolls = rolls2;
        }
      } else {
        if (total2 < total) {
          total = total2;
          rolls = rolls2;
        }
      }
    }

    return { total, rolls, modifier };
  },

  /**
   * Rolls and persists the result to Supabase session_messages
   */
  async rollAndPersist(params: {
    formula: string;
    mode?: RollMode;
    reason?: string;
    sessionId: string;
    userId: string;
    playerName: string;
  }): Promise<RollResult> {
    const { formula, mode = 'normal', reason, sessionId, userId, playerName } = params;
    const { total, rolls, modifier } = this.roll(formula, mode);
    
    const isCritical = formula.toLowerCase().includes('d20') && rolls.includes(20);
    const result: RollResult = {
      formula,
      total,
      rolls,
      modifier,
      playerName,
      reason,
      timestamp: new Date().toISOString(),
      isCritical
    };

    // Save to Supabase
    await supabase.from('session_messages').insert({
      session_id: sessionId,
      user_id: userId,
      sender_name: playerName,
      message_type: 'dice',
      content: `Rolled ${formula} ${reason ? '(' + reason + ')' : ''} → **${total}** ${isCritical ? '🎯 CRIT!' : ''}`,
      dice_roll_data: result as any
    });

    return result;
  }
};
