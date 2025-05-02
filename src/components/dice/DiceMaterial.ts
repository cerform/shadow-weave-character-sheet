
import * as THREE from 'three';

export interface DiceMaterialOptions {
  themeColor?: string;
  shininess?: number;
  emissive?: boolean;
  opacity?: number;
  wireframe?: boolean;
}

/**
 * Creates a material for dice based on theme settings
 */
export const createDiceMaterial = (options: DiceMaterialOptions = {}) => {
  const {
    themeColor = '#8B5CF6', // Default purple
    shininess = 100,
    emissive = true,
    opacity = 1,
    wireframe = false
  } = options;
  
  const themeColorObject = new THREE.Color(themeColor);
  const emissiveColor = emissive ? themeColorObject.clone().multiplyScalar(0.3) : new THREE.Color(0x000000);

  return new THREE.MeshPhongMaterial({
    color: themeColorObject,
    shininess: shininess,
    emissive: emissiveColor,
    specular: new THREE.Color(0xffffff),
    flatShading: true,
    transparent: opacity < 1,
    opacity: opacity,
    wireframe: wireframe
  });
};

/**
 * Creates a text texture for dice faces
 */
export const createDiceTextTexture = (text: string, color: string = '#ffffff', backgroundColor: string | null = null) => {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  
  const context = canvas.getContext('2d')!;
  
  // Optional background
  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, size, size);
  }
  
  // Draw text
  context.font = 'bold 80px Arial';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, size / 2, size / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
};
