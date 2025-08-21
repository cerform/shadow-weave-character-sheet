import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Scene } from 'three';
import { TopPanel } from '../ui/TopPanel';
import { LeftPanel } from '../ui/LeftPanel';
import { RightPanel } from '../ui/RightPanel';
import { BottomPanel } from '../ui/BottomPanel';
import { useCombatStateMachine } from '@/hooks/combat/useCombatStateMachine';
import { useBattleEntitySync } from '@/hooks/useBattleEntitySync';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { MonsterSpawner } from '@/components/dm/MonsterSpawner';
import { FogOfWarRenderer } from '../systems/FogOfWarRenderer';
import { AOETemplateRenderer } from '../systems/AOETemplateRenderer';
import { LineOfSightManager } from '../systems/LineOfSightManager';
import { CombatEntity } from '@/engine/combat/types';
import { BattleEntity } from '@/types/Monster';

interface TacticalBattleViewProps {
  isDM: boolean;
}

// Helper function to convert CombatEntity to BattleEntity for components that need it
const convertEntitiesToBattleEntities = (entities: CombatEntity[]): BattleEntity[] => {
  return entities.map(entity => ({
    id: entity.id,
    session_id: 'demo-session',
    slug: entity.name.toLowerCase().replace(/\s+/g, '-'),
    name: entity.name,
    model_url: entity.modelUrl || '',
    pos_x: entity.position.x,
    pos_y: entity.position.y,
    pos_z: entity.position.z,
    rot_y: entity.facing,
    scale: entity.scale,
    hp_current: entity.hp.current,
    hp_max: entity.hp.max,
    ac: entity.ac,
    speed: entity.movement.base,
    size: 'Medium',
    level_or_cr: 'CR 1',
    creature_type: 'humanoid',
    statuses: entity.conditions.map(c => c.key),
    is_player_character: entity.isPlayer,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

export function TacticalBattleView({ isDM }: TacticalBattleViewProps) {
  const sceneRef = useRef<Scene>();
  const sessionId = 'demo-session'; // TODO: get from props/context
  const { isDM: isStoreDM } = useUnifiedBattleStore();
  
  const {
    combatState,
    entities,
    startCombat,
    endTurn,
    useAction,
    moveEntity,
    canEndTurn
  } = useCombatStateMachine(sessionId);

  // Sync battle entities from database
  useBattleEntitySync(sessionId, sceneRef.current);

  const activeEntity = entities.find(e => e.id === combatState.activeEntityId);
  const currentDM = isDM || isStoreDM;

  return (
    <div className="w-full h-full relative bg-background text-foreground">
      {/* Top Panel - Combat Status */}
      <TopPanel 
        combatState={combatState}
        activeEntity={activeEntity}
        canEndTurn={canEndTurn()}
        onEndTurn={() => activeEntity && endTurn(activeEntity.id)}
        isCurrentPlayer={!currentDM}
      />

      {/* Left Panel - Units List */}
      <LeftPanel 
        entities={entities}
        activeEntityId={combatState.activeEntityId}
        onFocusEntity={(id) => console.log('Focus entity:', id)}
        onPingEntity={(id) => console.log('Ping entity:', id)}
      />

      {/* Right Panel - Combat Log */}
      <RightPanel 
        log={[]}
        isDM={currentDM}
      />

      {/* Bottom Panel - Action Bar */}
      <BottomPanel 
        activeEntity={activeEntity}
        availableActions={[]}
        onUseAction={(action, targetId) => activeEntity && useAction(activeEntity.id, action, targetId)}
        onToggleMode={(mode) => console.log('Toggle mode:', mode)}
        currentMode="select"
        isCurrentPlayer={!currentDM}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 10, 10], fov: 60 }}
          shadows
          onCreated={({ scene }) => {
            sceneRef.current = scene;
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Grid */}
          <Grid
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6366f1"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#4f46e5"
          />

          {/* Battle Systems */}
          <FogOfWarRenderer sessionId={sessionId} isDM={currentDM} />
          <AOETemplateRenderer />
          <LineOfSightManager entities={convertEntitiesToBattleEntities(entities)} />

          {/* Camera Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>

      {/* DM Tools */}
      {currentDM && (
        <div className="absolute top-20 left-4 z-20">
          <MonsterSpawner 
            sessionId={sessionId}
            scene={sceneRef.current} 
          />
        </div>
      )}
    </div>
  );
}