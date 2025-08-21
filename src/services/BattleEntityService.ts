import { supabase } from "@/integrations/supabase/client";
import { BattleEntity } from "@/types/Monster";

export async function createBattleEntity(entity: Omit<BattleEntity, 'id' | 'created_at' | 'updated_at'>): Promise<BattleEntity> {
  const { data, error } = await supabase
    .from('battle_entities')
    .insert([entity])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create battle entity: ${error.message}`);
  }

  return data as BattleEntity;
}

export async function updateBattleEntity(id: string, updates: Partial<BattleEntity>): Promise<BattleEntity> {
  const { data, error } = await supabase
    .from('battle_entities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update battle entity: ${error.message}`);
  }

  return data as BattleEntity;
}

export async function deleteBattleEntity(id: string): Promise<void> {
  const { error } = await supabase
    .from('battle_entities')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete battle entity: ${error.message}`);
  }
}

export async function getBattleEntitiesForSession(sessionId: string): Promise<BattleEntity[]> {
  const { data, error } = await supabase
    .from('battle_entities')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at');

  if (error) {
    throw new Error(`Failed to fetch battle entities: ${error.message}`);
  }

  return (data || []) as BattleEntity[];
}

export async function damageEntity(sessionId: string, entityId: string, damage: number): Promise<void> {
  // Получаем текущие HP и обновляем
  const { data: entity } = await supabase
    .from('battle_entities')
    .select('hp_current')
    .eq('id', entityId)
    .single();

  if (entity) {
    const newHp = Math.max(0, entity.hp_current - damage);
    await updateBattleEntity(entityId, { hp_current: newHp });
  }
}

export async function healEntity(sessionId: string, entityId: string, healing: number): Promise<void> {
  const { data: entity } = await supabase
    .from('battle_entities')
    .select('hp_current, hp_max')
    .eq('id', entityId)
    .single();

  if (entity) {
    const newHp = Math.min(entity.hp_max, entity.hp_current + healing);
    await updateBattleEntity(entityId, { hp_current: newHp });
  }
}