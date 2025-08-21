import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Raycaster, 
  Vector3, 
  Line3,
  Group,
  BufferGeometry,
  LineBasicMaterial,
  Line
} from 'three';
import { BattleEntity } from '@/types/Monster';

interface LineOfSightManagerProps {
  entities: BattleEntity[];
}

export function LineOfSightManager({ entities }: LineOfSightManagerProps) {
  const groupRef = useRef<Group>();
  const raycaster = useRef(new Raycaster());
  const losLines = useRef<Line[]>([]);

  // Calculate line of sight between entities
  const calculateLOS = (from: BattleEntity, to: BattleEntity): boolean => {
    const fromPos = new Vector3(from.pos_x, from.pos_y + 1.7, from.pos_z); // Eye level
    const toPos = new Vector3(to.pos_x, to.pos_y + 1.7, to.pos_z);
    
    const direction = toPos.clone().sub(fromPos).normalize();
    const distance = fromPos.distanceTo(toPos);
    
    raycaster.current.set(fromPos, direction);
    raycaster.current.far = distance - 0.1; // Stop just before target
    
    // Check for obstacles (this would need proper scene geometry)
    // For now, return true if within vision range
    const visionRange = 60; // Default vision range
    return distance <= visionRange / 5; // Convert feet to grid units
  };

  // Update visibility for all entities
  const updateVisibility = () => {
    const playerEntities = entities.filter(e => e.is_player_character);
    const allEntities = entities;

    for (const player of playerEntities) {
      const visibleEntities: string[] = [];
      const losMap: { [entityId: string]: boolean } = {};

      for (const target of allEntities) {
        if (target.id === player.id) continue;
        
        const hasLOS = calculateLOS(player, target);
        if (target.id) {
          losMap[target.id] = hasLOS;
          
          if (hasLOS) {
            visibleEntities.push(target.id);
          }
        }
      }
    }
  };

  // Create visual LOS lines for debugging (DM only)
  const createLOSLines = (showLines: boolean = false) => {
    if (!showLines || !groupRef.current) return;

    // Clear existing lines
    losLines.current.forEach(line => {
      line.geometry.dispose();
      if (line.material instanceof LineBasicMaterial) {
        line.material.dispose();
      }
    });
    groupRef.current.clear();
    losLines.current = [];

    const playerEntities = entities.filter(e => e.is_player_character);
    
    for (const player of playerEntities) {
      for (const target of entities) {
        if (target.id === player.id || target.is_player_character) continue;
        
        const hasLOS = calculateLOS(player, target);
        
        const points = [
          new Vector3(player.pos_x, player.pos_y + 1.7, player.pos_z),
          new Vector3(target.pos_x, target.pos_y + 1.7, target.pos_z)
        ];

        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({
          color: hasLOS ? '#00ff00' : '#ff0000',
          transparent: true,
          opacity: 0.3
        });

        const line = new Line(geometry, material);
        groupRef.current.add(line);
        losLines.current.push(line);
      }
    }
  };

  useFrame(() => {
    updateVisibility();
    // Only show LOS lines if Alt key is pressed (you'd track this with keyboard events)
    // createLOSLines(altKeyPressed);
  });

  useEffect(() => {
    return () => {
      // Cleanup
      losLines.current.forEach(line => {
        line.geometry.dispose();
        if (line.material instanceof LineBasicMaterial) {
          line.material.dispose();
        }
      });
    };
  }, []);

  return <group ref={groupRef} />;
}