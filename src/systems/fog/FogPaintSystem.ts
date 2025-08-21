// Система рисования тумана
import * as THREE from 'three';

export interface FogPaintConfig {
  brushSize: number;
  paintMode: 'reveal' | 'hide';
  textureSize: number;
  mapWidth: number;
  mapHeight: number;
}

export class FogPaintSystem {
  private texture: THREE.DataTexture | null = null;
  private config: FogPaintConfig;

  constructor(config: FogPaintConfig) {
    this.config = config;
    this.initializeTexture();
  }

  private initializeTexture() {
    const { textureSize } = this.config;
    const textureData = new Uint8Array(textureSize * textureSize * 4);
    
    // Изначально весь туман (альфа = 200)
    for (let i = 0; i < textureData.length; i += 4) {
      textureData[i] = 0;     // R
      textureData[i + 1] = 0; // G  
      textureData[i + 2] = 0; // B
      textureData[i + 3] = 200; // A - туман
    }
    
    this.texture = new THREE.DataTexture(
      textureData, 
      textureSize, 
      textureSize, 
      THREE.RGBAFormat
    );
    this.texture.needsUpdate = true;
    this.texture.flipY = false;
  }

  getTexture(): THREE.DataTexture | null {
    return this.texture;
  }

  paint(worldX: number, worldZ: number, mode?: 'reveal' | 'hide') {
    if (!this.texture) return;

    const { textureSize, mapWidth, mapHeight, brushSize } = this.config;
    const actualMode = mode || this.config.paintMode;
    
    const data = this.texture.image.data as Uint8Array;
    
    // Преобразуем мировые координаты в координаты текстуры
    const texX = Math.floor(((worldX + mapWidth / 2) / mapWidth) * textureSize);
    const texY = Math.floor(((worldZ + mapHeight / 2) / mapHeight) * textureSize);
    
    // Размер кисти в пикселях текстуры
    const brushRadius = Math.max(1, brushSize * 8);
    
    let changed = false;
    
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= brushRadius) {
          const x = texX + dx;
          const y = texY + dy;
          
          if (x >= 0 && x < textureSize && y >= 0 && y < textureSize) {
            const index = (y * textureSize + x) * 4;
            
            if (actualMode === 'reveal') {
              // Убираем туман (делаем прозрачным)
              if (data[index + 3] > 0) {
                data[index + 3] = 0;
                changed = true;
              }
            } else {
              // Добавляем туман
              if (data[index + 3] < 200) {
                data[index + 3] = 200;
                changed = true;
              }
            }
          }
        }
      }
    }
    
    if (changed) {
      this.texture.needsUpdate = true;
    }
  }

  revealAll() {
    if (!this.texture) return;
    
    const data = this.texture.image.data as Uint8Array;
    
    // Делаем всю текстуру прозрачной
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 0;
    }
    
    this.texture.needsUpdate = true;
  }

  hideAll() {
    if (!this.texture) return;
    
    const data = this.texture.image.data as Uint8Array;
    
    // Делаем всю текстуру непрозрачной
    for (let i = 3; i < data.length; i += 4) {
      data[i] = 200;
    }
    
    this.texture.needsUpdate = true;
  }

  updateConfig(newConfig: Partial<FogPaintConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  dispose() {
    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }
  }
}