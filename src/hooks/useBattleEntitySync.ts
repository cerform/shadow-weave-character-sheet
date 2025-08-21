import { useEffect, useRef } from 'react';
import { Scene, Object3D } from 'three';
import { supabase } from '@/integrations/supabase/client';
import { BattleEntity } from '@/types/Monster';
import { loadGLB, playIfExists } from '@/services/ModelLoader';
import { getModelForSlug } from '@/services/ModelRegistry';

export function useBattleEntitySync(sessionId: string, scene: Scene | null) {
  const entitiesRef = useRef<Map<string, Object3D>>(new Map());

  useEffect(() => {
    if (!sessionId || !scene) return;

    console.log(`🔄 Setting up entity sync for session: ${sessionId}`);

    // Подписываемся на изменения в таблице battle_entities
    const channel = supabase
      .channel('battle-entities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_entities',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('📡 Battle entity change:', payload);

          if (payload.eventType === 'INSERT') {
            const entity = payload.new as BattleEntity & { size: string };
            await handleEntityAdded(entity);
          } else if (payload.eventType === 'UPDATE') {
      const entity = payload.new as BattleEntity & { size: string };
            await handleEntityUpdated(entity);
          } else if (payload.eventType === 'DELETE') {
            const entity = payload.old as BattleEntity & { size: string };
            handleEntityRemoved(entity);
          }
        }
      )
      .subscribe();

    // Загружаем существующие сущности при инициализации
    loadExistingEntities();

    return () => {
      console.log('🔌 Cleaning up entity sync');
      supabase.removeChannel(channel);
      
      // Очищаем все объекты из сцены
      entitiesRef.current.forEach((object) => {
        scene.remove(object);
      });
      entitiesRef.current.clear();
    };
  }, [sessionId, scene]);

  const loadExistingEntities = async () => {
    if (!sessionId || !scene) return;

    try {
      const { data: entities, error } = await supabase
        .from('battle_entities')
        .select('*')
        .eq('session_id', sessionId);

      if (error) {
        console.error('Failed to load existing entities:', error);
        return;
      }

      console.log(`📦 Loading ${entities?.length || 0} existing entities`);

      for (const entity of entities || []) {
        await handleEntityAdded(entity as BattleEntity & { size: string });
      }
    } catch (error) {
      console.error('Error loading existing entities:', error);
    }
  };

  const handleEntityAdded = async (entity: BattleEntity & { size: string }) => {
    if (!scene || !entity.id) return;

    // Проверяем, что сущность еще не загружена
    if (entitiesRef.current.has(entity.id)) {
      console.log(`⚠️ Entity ${entity.id} already exists, skipping`);
      return;
    }

    try {
      console.log(`➕ Adding entity: ${entity.name} (${entity.id})`);

      // Загружаем модель
      const loadedModel = await loadGLB(entity.model_url);
      
      // Устанавливаем позицию и поворот
      loadedModel.root.position.set(entity.pos_x, entity.pos_y, entity.pos_z);
      loadedModel.root.rotation.y = entity.rot_y;
      loadedModel.root.scale.setScalar(entity.scale);

      // Получаем информацию об анимациях
      try {
        const modelEntry = await getModelForSlug(entity.slug);
        const idleAnimation = modelEntry.animations?.idle || "Idle";
        playIfExists(loadedModel, idleAnimation);
      } catch (error) {
        console.log('Could not load animations for entity:', error);
      }

      // Добавляем метаданные
      loadedModel.root.userData = {
        entityId: entity.id,
        slug: entity.slug,
        entity
      };

      // Добавляем в сцену и сохраняем ссылку
      scene.add(loadedModel.root);
      entitiesRef.current.set(entity.id, loadedModel.root);

      console.log(`✅ Successfully added entity: ${entity.name}`);
    } catch (error) {
      console.error(`❌ Failed to add entity ${entity.id}:`, error);
    }
  };

  const handleEntityUpdated = async (entity: BattleEntity & { size: string }) => {
    if (!scene || !entity.id) return;

    const existingObject = entitiesRef.current.get(entity.id);
    if (!existingObject) {
      // Если объект не существует, создаем его
      await handleEntityAdded(entity);
      return;
    }

    console.log(`🔄 Updating entity: ${entity.name} (${entity.id})`);

    // Обновляем позицию и поворот
    existingObject.position.set(entity.pos_x, entity.pos_y, entity.pos_z);
    existingObject.rotation.y = entity.rot_y;
    existingObject.scale.setScalar(entity.scale);

    // Обновляем метаданные
    existingObject.userData = {
      ...existingObject.userData,
      entity
    };
  };

  const handleEntityRemoved = (entity: BattleEntity & { size: string }) => {
    if (!scene || !entity.id) return;

    const existingObject = entitiesRef.current.get(entity.id);
    if (!existingObject) return;

    console.log(`➖ Removing entity: ${entity.name} (${entity.id})`);

    scene.remove(existingObject);
    entitiesRef.current.delete(entity.id);
  };

  return {
    entities: Array.from(entitiesRef.current.values())
  };
}