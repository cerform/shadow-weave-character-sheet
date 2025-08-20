// src/systems/actions/actions.ts
import type { AttackContext, MoveContext, CombatToken } from '@/types/combat';
import { useCombatStore } from '@/stores/combatStore';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { roll } from '@/utils/dice';
import { hasLineOfSight } from '@/systems/los/LineOfSight';

export function doMove(ctx: MoveContext) {
  const s = useEnhancedBattleStore.getState();
  const t = s.tokens.find(t => t.id === ctx.token); 
  if (!t) throw new Error('token missing');
  const maxSquares = t.speed || 6; // Default speed
  if (ctx.path.length - 1 > maxSquares) throw new Error('path exceeds speed');
  const last = ctx.path[ctx.path.length - 1];
  s.updateToken(t.id, { position: [last.x, last.y, last.z] });
  // Log move action
  s.addCombatEvent({
    actor: t.name,
    action: 'Move',
    description: `Moved to position (${last.x}, ${last.z})`,
    playerName: 'System'
  });
}

export function doAttack(ctx: AttackContext) {
  const s = useEnhancedBattleStore.getState();
  const atk = s.tokens.find(t => t.id === ctx.attacker);
  const tgt = s.tokens.find(t => t.id === ctx.target);
  if (!atk || !tgt) throw new Error('tokens missing');
  
  const grid = (window as any).__terrainGrid; // инъекция из сцены карты
  if (!hasLineOfSight(grid, atk.position[0], atk.position[2], tgt.position[0], tgt.position[2])) {
    throw new Error('no line of sight');
  }
  
  const toHit = roll('d20', ctx.mode);
  const ac = tgt.ac; // сюда добавляйте бонусы укрытия/фланга
  const hit = toHit.total >= ac;
  
  if (hit) {
    const dmg = roll(ctx.weapon.formula);
    const hp = Math.max(0, tgt.hp - dmg.total);
    s.updateToken(tgt.id, { hp });
    
    s.addCombatEvent({
      actor: atk.name,
      action: 'Attack',
      target: tgt.name,
      damage: dmg.total,
      description: `Hit for ${dmg.total} damage`,
      playerName: 'System'
    });
  } else {
    s.addCombatEvent({
      actor: atk.name,
      action: 'Attack',
      target: tgt.name,
      description: `Missed (rolled ${toHit.total} vs AC ${ac})`,
      playerName: 'System'
    });
  }
}