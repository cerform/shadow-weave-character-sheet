import React, { memo, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { type EnhancedToken } from "@/stores/enhancedBattleStore";

// ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Каждый компонент модели имеет ФИКСИРОВАННЫЙ путь
// Это предотвращает нарушение Rules of Hooks, так как каждый useGLTF вызывается
// с константным путём, который не меняется между рендерами

const FighterModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/fighter.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const WizardModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/wizard.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const RogueModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/rogue.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const ClericModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/cleric.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const GoblinModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/goblin.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const SkeletonModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/skeleton.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const OrcModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/orc.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const DragonModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/dragon.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

const DefaultModel = memo(({ scale = 1 }: { scale?: number }) => {
  const gltf = useGLTF("/models/character.glb", true);
  const clonedScene = useMemo(() => gltf?.scene ? gltf.scene.clone() : null, [gltf?.scene]);
  if (!clonedScene) return null;
  return <primitive object={clonedScene} position={[0, 0, 0]} scale={[scale, scale, scale]} castShadow receiveShadow />;
});

// Fallback компонент
export const FallbackModel = memo(({ token, isActive, isSelected, isEnemy }: {
  token: EnhancedToken;
  isActive: boolean;
  isSelected: boolean;
  isEnemy: boolean;
}) => {
  const tokenColor = token.color || (isEnemy ? "#ef4444" : "#22c55e");
  const emissiveColor = isSelected ? "#fbbf24" : (isActive ? "#3b82f6" : "#000000");
  
  return (
    <mesh castShadow>
      <cylinderGeometry args={[0.4, 0.4, 1.2]} />
      <meshStandardMaterial 
        color={tokenColor}
        emissive={emissiveColor}
        emissiveIntensity={isSelected ? 0.3 : (isActive ? 0.2 : 0)}
      />
    </mesh>
  );
});

// Главный компонент-роутер, который выбирает правильную модель через условный рендеринг
export type ModelType = 'fighter' | 'wizard' | 'rogue' | 'cleric' | 'goblin' | 'skeleton' | 'orc' | 'dragon' | 'default';

interface Character3DModelProps {
  modelType: ModelType;
  scale?: number;
  token: EnhancedToken;
  isActive: boolean;
  isSelected: boolean;
  isEnemy: boolean;
}

export const Character3DModel = memo(({ modelType, scale = 1, token, isActive, isSelected, isEnemy }: Character3DModelProps) => {
  // ✅ УСЛОВНЫЙ РЕНДЕРИНГ компонентов (не условный вызов хуков!)
  return (
    <React.Suspense fallback={<FallbackModel token={token} isActive={isActive} isSelected={isSelected} isEnemy={isEnemy} />}>
      {modelType === 'fighter' && <FighterModel scale={scale} />}
      {modelType === 'wizard' && <WizardModel scale={scale} />}
      {modelType === 'rogue' && <RogueModel scale={scale} />}
      {modelType === 'cleric' && <ClericModel scale={scale} />}
      {modelType === 'goblin' && <GoblinModel scale={scale} />}
      {modelType === 'skeleton' && <SkeletonModel scale={scale} />}
      {modelType === 'orc' && <OrcModel scale={scale} />}
      {modelType === 'dragon' && <DragonModel scale={scale} />}
      {modelType === 'default' && <DefaultModel scale={scale} />}
    </React.Suspense>
  );
});
