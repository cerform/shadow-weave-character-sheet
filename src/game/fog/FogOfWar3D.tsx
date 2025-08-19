import * as THREE from "three";
import { FogGrid } from "./FogGrid";

export function createFogTexture(grid: FogGrid) {
  const size = grid.cols * grid.rows;
  const data = new Uint8Array(size * 4);

  for (let i = 0; i < size; i++) {
    const state = grid.raw()[i];
    let alpha = state === 0 ? 255 : state === 1 ? 128 : 0;
    data[i * 4] = 0;     // R
    data[i * 4 + 1] = 0; // G
    data[i * 4 + 2] = 0; // B
    data[i * 4 + 3] = alpha; // A
  }

  const texture = new THREE.DataTexture(data, grid.cols, grid.rows, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  return texture;
}

export function updateFogTexture(texture: THREE.DataTexture, grid: FogGrid) {
  const size = grid.cols * grid.rows;
  const data = texture.image.data;

  for (let i = 0; i < size; i++) {
    const state = grid.raw()[i];
    let alpha = state === 0 ? 255 : state === 1 ? 128 : 0;
    data[i * 4 + 3] = alpha; // только альфа канал
  }

  texture.needsUpdate = true;
}