import { useState, useCallback } from 'react';
import { Vector3 } from 'three';
import { AOETemplate } from '@/engine/combat/types';
import { BattleEntity } from '@/types/Monster';

interface AOETemplateState {
  activeTemplate: AOETemplate | null;
  templatePosition: Vector3 | null;
  templateDirection: Vector3 | null;
  affectedEntities: string[];
  isVisible: boolean;
}

export function useAOETemplate() {
  const [state, setState] = useState<AOETemplateState>({
    activeTemplate: null,
    templatePosition: null,
    templateDirection: null,
    affectedEntities: [],
    isVisible: false
  });

  const showTemplate = useCallback((template: AOETemplate) => {
    setState(prev => ({
      ...prev,
      activeTemplate: template,
      templatePosition: new Vector3(template.origin.x, template.origin.y, template.origin.z),
      templateDirection: template.direction ? 
        new Vector3(template.direction.x, template.direction.y, template.direction.z) : null,
      affectedEntities: [...template.affectedEntities],
      isVisible: true
    }));
  }, []);

  const hideTemplate = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTemplate: null,
      templatePosition: null,
      templateDirection: null,
      affectedEntities: [],
      isVisible: false
    }));
  }, []);

  const updateTemplate = useCallback((
    position?: Vector3,
    direction?: Vector3,
    entities?: BattleEntity[]
  ) => {
    setState(prev => {
      if (!prev.activeTemplate) return prev;

      const newState = { ...prev };
      
      if (position) {
        newState.templatePosition = position.clone();
      }
      
      if (direction) {
        newState.templateDirection = direction.clone();
      }

      // Calculate affected entities based on template geometry
      if (entities && newState.templatePosition) {
        const affected: string[] = [];
        const template = prev.activeTemplate;

        for (const entity of entities) {
          const entityPos = new Vector3(entity.pos_x, entity.pos_y, entity.pos_z);
          const distance = entityPos.distanceTo(newState.templatePosition);
          
          let isAffected = false;

          switch (template.type) {
            case 'sphere':
              isAffected = distance <= template.size / 2;
              break;
              
            case 'cone':
              if (distance <= template.size && newState.templateDirection) {
                const toEntity = entityPos.clone().sub(newState.templatePosition).normalize();
                const dot = toEntity.dot(newState.templateDirection);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
                isAffected = angle <= Math.PI / 6; // 30 degree cone
              }
              break;
              
            case 'line':
              if (newState.templateDirection) {
                const lineEnd = newState.templatePosition.clone()
                  .add(newState.templateDirection.clone().multiplyScalar(template.size));
                // Calculate distance from point to line
                const lineVec = lineEnd.clone().sub(newState.templatePosition);
                const pointVec = entityPos.clone().sub(newState.templatePosition);
                const lineLength = lineVec.length();
                const projection = pointVec.dot(lineVec) / lineLength;
                
                if (projection >= 0 && projection <= lineLength) {
                  const closestPoint = newState.templatePosition.clone()
                    .add(lineVec.clone().multiplyScalar(projection / lineLength));
                  const distanceToLine = entityPos.distanceTo(closestPoint);
                  isAffected = distanceToLine <= (template.width || 1) / 2;
                }
              }
              break;
              
            case 'cylinder':
              const horizontalDistance = Math.sqrt(
                Math.pow(entityPos.x - newState.templatePosition.x, 2) +
                Math.pow(entityPos.z - newState.templatePosition.z, 2)
              );
              const verticalDistance = Math.abs(entityPos.y - newState.templatePosition.y);
              isAffected = horizontalDistance <= template.size / 2 && 
                          verticalDistance <= (template.height || 10) / 2;
              break;
          }

          if (isAffected && entity.id) {
            affected.push(entity.id);
          }
        }

        newState.affectedEntities = affected;
      }

      return newState;
    });
  }, []);

  return {
    activeTemplate: state.activeTemplate,
    templatePosition: state.templatePosition,
    templateDirection: state.templateDirection,
    affectedEntities: state.affectedEntities,
    isVisible: state.isVisible,
    showTemplate,
    hideTemplate,
    updateTemplate
  };
}