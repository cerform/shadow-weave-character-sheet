import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  ConeGeometry, 
  CylinderGeometry, 
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Raycaster,
  Group
} from 'three';
import { useAOETemplate } from '@/hooks/combat/useAOETemplate';

export function AOETemplateRenderer() {
  const groupRef = useRef<Group>();
  const coneRef = useRef<Mesh>();
  const cylinderRef = useRef<Mesh>();
  const lineRef = useRef<Mesh>();
  
  const {
    activeTemplate,
    templatePosition,
    templateDirection,
    affectedEntities,
    showTemplate,
    hideTemplate,
    updateTemplate
  } = useAOETemplate();

  useEffect(() => {
    if (!activeTemplate || !groupRef.current) {
      return;
    }

    // Clear previous templates
    groupRef.current.children.forEach(child => {
      if (child instanceof Mesh) {
        child.geometry.dispose();
        if (child.material instanceof MeshBasicMaterial) {
          child.material.dispose();
        }
      }
    });
    groupRef.current.clear();

    // Create template geometry based on type
    let geometry;
    const material = new MeshBasicMaterial({
      color: '#ff6b6b',
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });

    switch (activeTemplate.type) {
      case 'cone':
        geometry = new ConeGeometry(
          activeTemplate.size / 2, // radius at base
          activeTemplate.size,     // height
          8,                       // radial segments
          1,                       // height segments
          false,                   // open ended
          0,                       // theta start
          Math.PI / 3              // theta length (60 degrees)
        );
        break;

      case 'sphere':
        geometry = new CylinderGeometry(
          activeTemplate.size / 2, // top radius
          activeTemplate.size / 2, // bottom radius
          0.5,                     // height (thin disk)
          16                       // radial segments
        );
        break;

      case 'cylinder':
        geometry = new CylinderGeometry(
          activeTemplate.size / 2,           // top radius
          activeTemplate.size / 2,           // bottom radius
          activeTemplate.height || 10,       // height
          16                                 // radial segments
        );
        break;

      case 'line':
        geometry = new PlaneGeometry(
          activeTemplate.width || 1,    // width
          activeTemplate.size           // length
        );
        break;

      default:
        return;
    }

    const mesh = new Mesh(geometry, material);
    
    // Position and orient the template
    if (templatePosition) {
      mesh.position.copy(templatePosition);
    }
    
    if (templateDirection && activeTemplate.type === 'cone') {
      mesh.lookAt(templateDirection);
      mesh.rotateX(-Math.PI / 2); // Point forward
    } else if (activeTemplate.type === 'line' && templateDirection) {
      const angle = Math.atan2(templateDirection.z, templateDirection.x);
      mesh.rotation.y = angle;
    }

    groupRef.current.add(mesh);

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [activeTemplate, templatePosition, templateDirection]);

  // Highlight affected entities
  useFrame(() => {
    if (!activeTemplate || !affectedEntities) return;
    
    // This would update entity highlighting in your entity rendering system
    // You could emit events or use a context to notify entity components
  });

  return <group ref={groupRef} />;
}