// Система рисования тумана
import * as THREE from 'three';
import { supabase } from '@/integrations/supabase/client';

export interface FogPaintConfig {
  brushSize: number;
  paintMode: 'reveal' | 'hide';
  textureSize: number;
  mapWidth: number;
  mapHeight: number;
  sessionId?: string;
  mapId?: string;
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
    
    // Изначально туман со средней прозрачностью
    for (let i = 0; i < textureData.length; i += 4) {
      textureData[i] = 50;     // R - темно-серый
      textureData[i + 1] = 50; // G - темно-серый  
      textureData[i + 2] = 50; // B - темно-серый
      textureData[i + 3] = 120; // A - умеренный туман
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

    const { textureSize, mapWidth, mapHeight, brushSize, sessionId, mapId } = this.config;
    const actualMode = mode || this.config.paintMode;
    
    const data = this.texture.image.data as Uint8Array;
    
    // Преобразуем мировые координаты в координаты текстуры
    const texX = Math.floor(((worldX + mapWidth / 2) / mapWidth) * textureSize);
    const texY = Math.floor(((-worldZ + mapHeight / 2) / mapHeight) * textureSize);
    
    // Размер кисти в пикселях текстуры
    const brushRadius = Math.max(1, brushSize * 8);
    
    let changed = false;
    const changedCells = new Set<string>();
    
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
                data[index] = 255;     // R - белый при открытии
                data[index + 1] = 255; // G - белый при открытии
                data[index + 2] = 255; // B - белый при открытии
                data[index + 3] = 0;   // A - полностью прозрачно
                changed = true;
                
                // Преобразуем обратно в grid координаты для БД
                const gridX = Math.floor((x / textureSize) * 30); // 30x30 grid
                const gridY = Math.floor((y / textureSize) * 30);
                changedCells.add(`${gridX},${gridY},true`);
              }
            } else {
              // Добавляем туман
              if (data[index + 3] < 120) {
                data[index] = 50;      // R - темно-серый
                data[index + 1] = 50;  // G - темно-серый
                data[index + 2] = 50;  // B - темно-серый
                data[index + 3] = 120; // A - умеренный туман
                changed = true;
                
                // Преобразуем обратно в grid координаты для БД
                const gridX = Math.floor((x / textureSize) * 30); // 30x30 grid
                const gridY = Math.floor((y / textureSize) * 30);
                changedCells.add(`${gridX},${gridY},false`);
              }
            }
          }
        }
      }
    }
    
    if (changed) {
      this.texture.needsUpdate = true;
      
      // Синхронизируем с БД
      if (sessionId && mapId && changedCells.size > 0) {
        this.syncToDatabase(sessionId, mapId, changedCells);
      }
    }
  }

  private async syncToDatabase(sessionId: string, mapId: string, changedCells: Set<string>) {
    try {
      const updates = Array.from(changedCells).map(cell => {
        const [gridX, gridY, isRevealed] = cell.split(',');
        return {
          session_id: sessionId,
          map_id: mapId,
          grid_x: parseInt(gridX),
          grid_y: parseInt(gridY),
          is_revealed: isRevealed === 'true'
        };
      });

      const { error } = await supabase
        .from('fog_of_war')
        .upsert(updates, {
          onConflict: 'session_id,map_id,grid_x,grid_y'
        });

      if (error) {
        console.error('❌ Error syncing fog to database:', error);
      } else {
        console.log(`🌫️ Synced ${updates.length} fog cells to database`);
      }
    } catch (error) {
      console.error('❌ Exception syncing fog to database:', error);
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
    
    // Делаем всю текстуру с умеренным туманом
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 50;      // R - темно-серый
      data[i + 1] = 50;  // G - темно-серый
      data[i + 2] = 50;  // B - темно-серый
      data[i + 3] = 120; // A - умеренный туман
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