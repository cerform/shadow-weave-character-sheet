import { useState, useEffect, useCallback } from 'react';
import { CombatStateMachine } from '@/engine/combat/CombatStateMachine';
import { CombatState, CombatEntity, CombatAction } from '@/engine/combat/types';

export function useCombatStateMachine(sessionId: string) {
  const [machine] = useState(() => new CombatStateMachine(sessionId));
  const [combatState, setCombatState] = useState<CombatState>(machine.getState());
  const [entities, setEntities] = useState<CombatEntity[]>([]);

  useEffect(() => {
    // Subscribe to combat state changes
    const unsubscribe = machine.addEventListener((event) => {
      setCombatState(machine.getState());
      setEntities(machine.getAllEntities());
    });

    // Load existing state from database
    machine.loadFromDatabase(sessionId);

    return unsubscribe;
  }, [machine, sessionId]);

  const startCombat = useCallback(async (entities: CombatEntity[]) => {
    await machine.startCombat(entities);
  }, [machine]);

  const endCombat = useCallback(async () => {
    await machine.endCombat();
  }, [machine]);

  const endTurn = useCallback(async (entityId: string) => {
    await machine.endTurn(entityId);
  }, [machine]);

  const useAction = useCallback(async (
    entityId: string,
    action: CombatAction,
    targetId?: string
  ) => {
    return await machine.useAction(entityId, action, targetId);
  }, [machine]);

  const moveEntity = useCallback(async (
    entityId: string,
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    isDifficultTerrain?: boolean
  ) => {
    return await machine.moveEntity(entityId, from, to, isDifficultTerrain);
  }, [machine]);

  const canEndTurn = useCallback(() => {
    return machine.canCurrentEntityEndTurn();
  }, [machine]);

  return {
    combatState,
    entities,
    startCombat,
    endCombat,
    endTurn,
    useAction,
    moveEntity,
    canEndTurn,
    machine
  };
}