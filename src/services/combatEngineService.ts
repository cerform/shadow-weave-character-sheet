import { EnhancedToken } from '@/stores/enhancedBattleStore';
import { CombatAction, CombatResult } from '@/types/combat';
import { supabase } from '@/integrations/supabase/client';
import { socketService } from '@/services/socket';

export class CombatEngineService {
  /**
   * Applies damage rules: deducts from Temp HP first, then main HP.
   */
  static calculateDamage(token: EnhancedToken, damageAmount: number): { hpReduced: number; tempHpReduced: number; newHp: number; newTempHp: number; isDefeated: boolean } {
    let remainingDamage = damageAmount;
    let newTempHp = token.tempHp || 0;
    let newHp = token.hp;
    let tempHpReduced = 0;

    // 1. Damage Temp HP first
    if (newTempHp > 0) {
      if (newTempHp >= remainingDamage) {
        tempHpReduced = remainingDamage;
        newTempHp -= remainingDamage;
        remainingDamage = 0;
      } else {
        tempHpReduced = newTempHp;
        remainingDamage -= newTempHp;
        newTempHp = 0;
      }
    }

    // 2. Remaining damage to main HP
    let hpReduced = 0;
    if (remainingDamage > 0) {
      if (newHp >= remainingDamage) {
        hpReduced = remainingDamage;
        newHp -= remainingDamage;
      } else {
        hpReduced = newHp;
        newHp = 0; // Defeated / Unconscious
      }
    }

    return {
      hpReduced,
      tempHpReduced,
      newHp,
      newTempHp,
      isDefeated: newHp === 0
    };
  }

  /**
   * Applies healing rules: cannot exceed max HP.
   */
  static calculateHealing(token: EnhancedToken, healAmount: number): { healingApplied: number; newHp: number } {
    if (token.hp <= 0) {
      // If dead/unconscious, healing applies from 0
      const newHp = Math.min(healAmount, token.maxHp);
      return { healingApplied: newHp, newHp };
    }

    const maxHeal = token.maxHp - token.hp;
    const actualHeal = Math.min(healAmount, maxHeal);
    return {
      healingApplied: actualHeal > 0 ? actualHeal : 0,
      newHp: token.hp + (actualHeal > 0 ? actualHeal : 0)
    };
  }

  /**
   * Returns true if slot successfully decremented, false otherwise.
   * Cantrips (level 0) always return true immediately without consuming resources.
   */
  static consumeSpellSlot(token: EnhancedToken, level: number): { success: boolean; newSpellSlots?: any } {
    if (level === 0) return { success: true }; // Cantrips have no cost
    // Minimal mock for now as tokens don't track spellSlots in EnhancedToken MVP
    return { success: true }; 
  }

  /**
   * Translates a pure CombatAction payload into resultant token state changes.
   * This is entirely deterministic.
   */
  static evaluateAction(action: CombatAction, targetToken: EnhancedToken, savePassed?: boolean): CombatResult {
    let isDefeated = false;
    let damageApplied = 0;
    let healingApplied = 0;
    let hpReduced = 0;
    let tempHpReduced = 0;

    // Validate hit (basic implementation, assumes if there's damage/healing, it hit)
    // Future: implement saveDC checks or AC bypasses here.

    if (action.actionType === 'weapon_attack' || action.actionType === 'spell_attack' || action.actionType === 'manual_damage' || action.actionType === 'saving_throw_spell') {
      let rawDmg = parseInt(action.damageFormula || '0', 10);
      const dmgType = action.damageType || 'physical';
      
      if (action.actionType === 'saving_throw_spell') {
        if (savePassed) rawDmg = Math.floor(rawDmg / 2);
      }

      // Resistances
      if (targetToken.immunities && targetToken.immunities.includes(dmgType)) {
        rawDmg = 0;
      } else if (targetToken.resistances && targetToken.resistances.includes(dmgType)) {
        rawDmg = Math.floor(rawDmg / 2);
      } else if (targetToken.vulnerabilities && targetToken.vulnerabilities.includes(dmgType)) {
        rawDmg *= 2;
      }

      const res = this.calculateDamage(targetToken, rawDmg);
      damageApplied = rawDmg;
      hpReduced = res.hpReduced;
      tempHpReduced = res.tempHpReduced;
      isDefeated = res.isDefeated;
    } 
    else if (action.actionType === 'healing' || action.actionType === 'manual_heal') {
      const heal = parseInt(action.healingFormula || '0', 10);
      const res = this.calculateHealing(targetToken, heal);
      healingApplied = res.healingApplied;
    }

    return {
      targetTokenId: targetToken.id,
      damageApplied,
      healingApplied,
      tempHpReduced,
      hpReduced,
      isDefeated,
      savePassed
    };
  }

  /**
   * Saves the event to the centralized Supabase event log.
   */
  static async logCombatEvent(action: CombatAction, result: CombatResult, targetName: string) {
    try {
      let content = `${action.sourceName} -> ${targetName}`;
      if (result.savePassed !== undefined) {
        content += result.savePassed ? ' (Saved!)' : ' (Failed Save!)';
      }
      if (result.damageApplied > 0) content += ` (${result.damageApplied} damage)`;
      if (result.healingApplied > 0) content += ` (${result.healingApplied} healed)`;
      if (result.isDefeated) content += ` [DEFEATED]`;

      await supabase.from('session_messages').insert({
        session_id: action.sessionId,
        sender: 'Combat System',
        message_type: 'combat_log',
        content,
        timestamp: action.timestamp,
        metadata: { action, result }
      });

      // Blast to local sockets immediately for fast UI
      socketService.sendMessage({
        id: crypto.randomUUID(),
        sessionId: action.sessionId,
        sender: 'Combat System',
        type: 'system',
        content,
        timestamp: action.timestamp
      });
    } catch (e) {
      console.error('Failed to log combat event', e);
    }
  }
}
