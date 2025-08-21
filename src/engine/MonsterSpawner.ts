import { Scene } from "three";
import * as THREE from 'three';
import { getBestiaryEntry } from "@/services/BestiaryService";
import { getModelForSlug } from "@/services/ModelRegistry";
import { createBattleEntity } from "@/services/BattleEntityService";
import { loadGLB, playIfExists } from "@/services/ModelLoader";
import { BattleEntity } from "@/types/Monster";

interface SpawnOptions {
  sessionId: string;
  slug: string;
  position: { x: number; y: number; z: number };
  rotation?: number;
  createdBy: string;
  scene: Scene;
  onReady?: (entityId: string, object3D: THREE.Object3D) => void;
}

export async function spawnMonsterFromSlug(options: SpawnOptions): Promise<{ id: string; object3D: THREE.Object3D }> {
  const { sessionId, slug, position, createdBy, scene } = options;
  const rotation = options.rotation ?? 0;

  try {
    // 1. Получаем статы из бестиария
    console.log(`📖 Loading bestiary entry for: ${slug}`);
    const bestiaryEntry = await getBestiaryEntry(slug);

    // 2. Получаем информацию о модели
    console.log(`🎨 Loading model registry for: ${slug}`);
    const modelEntry = await getModelForSlug(slug);

    // 3. Загружаем 3D модель
    console.log(`📦 Loading 3D model: ${modelEntry.model_url}`);
    const loadedModel = await loadGLB(modelEntry.model_url);
    
    // 4. Настраиваем позицию и масштаб
    const yOffset = modelEntry.y_offset || 0;
    loadedModel.root.position.set(position.x, position.y + yOffset, position.z);
    loadedModel.root.rotation.y = rotation;
    loadedModel.root.scale.setScalar(modelEntry.scale || 1.0);

    // 5. Запускаем базовую анимацию
    const idleAnimation = modelEntry.animations?.idle || "Idle";
    playIfExists(loadedModel, idleAnimation);

    // 6. Добавляем в сцену немедленно (для ДМ)
    scene.add(loadedModel.root);
    console.log(`✅ Added to scene: ${bestiaryEntry.name}`);

    // 7. Создаем сущность в базе данных для синхронизации
    const entityData: Omit<BattleEntity, 'id' | 'created_at' | 'updated_at'> = {
      session_id: sessionId,
      slug: bestiaryEntry.slug,
      name: bestiaryEntry.name,
      model_url: modelEntry.model_url,
      pos_x: position.x,
      pos_y: position.y,
      pos_z: position.z,
      rot_y: rotation,
      scale: modelEntry.scale || 1.0,
      hp_current: bestiaryEntry.hp_average,
      hp_max: bestiaryEntry.hp_average,
      ac: bestiaryEntry.ac,
      speed: bestiaryEntry.speed_walk || 30,
      size: bestiaryEntry.size as any, // Cast необходим из-за string vs Size типа
      level_or_cr: bestiaryEntry.cr_or_level,
      creature_type: bestiaryEntry.creature_type,
      statuses: [],
      is_player_character: false,
      created_by: createdBy
    };

    console.log(`💾 Creating database entity...`);
    const createdEntity = await createBattleEntity(entityData);
    
    // 8. Добавляем ID к объекту для дальнейшей работы
    loadedModel.root.userData = {
      entityId: createdEntity.id,
      slug: bestiaryEntry.slug,
      bestiaryEntry,
      modelEntry,
      loadedModel
    };

    // 9. Вызываем callback если предоставлен
    options.onReady?.(createdEntity.id!, loadedModel.root);

    console.log(`🎉 Successfully spawned: ${bestiaryEntry.name} (${createdEntity.id})`);
    
    return {
      id: createdEntity.id!,
      object3D: loadedModel.root
    };

  } catch (error) {
    console.error(`❌ Failed to spawn monster ${slug}:`, error);
    throw error;
  }
}

// Быстрый спавн существующих монстров
export async function quickSpawnMonster(scene: Scene, slug: string, position: { x: number; y: number; z: number }) {
  // Это используется для демо - без сохранения в БД
  try {
    const bestiaryEntry = await getBestiaryEntry(slug);
    const modelEntry = await getModelForSlug(slug);
    const loadedModel = await loadGLB(modelEntry.model_url);
    
    const yOffset = modelEntry.y_offset || 0;
    loadedModel.root.position.set(position.x, position.y + yOffset, position.z);
    loadedModel.root.scale.setScalar(modelEntry.scale || 1.0);
    
    const idleAnimation = modelEntry.animations?.idle || "Idle";
    playIfExists(loadedModel, idleAnimation);
    
    scene.add(loadedModel.root);
    
    return loadedModel.root;
  } catch (error) {
    console.error(`Failed to quick spawn ${slug}:`, error);
    return null;
  }
}