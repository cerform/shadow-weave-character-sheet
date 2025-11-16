// GPU-based Fog of War Renderer for VTT
import * as THREE from 'three';
import type { VTTFogConfig, VTTFogCell, FogBrush } from '../types/fog';
import fogVertexShader from '../shaders/fog.vert?raw';
import fogFragmentShader from '../shaders/fog.frag?raw';

export class FogRenderer {
  private scene: THREE.Scene;
  private mesh: THREE.Mesh | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private fogTexture: THREE.DataTexture | null = null;
  private fogData: Uint8Array | null = null;
  
  private config: VTTFogConfig;
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private time: number = 0;
  
  private changedCells: Set<string> = new Set();
  
  constructor(scene: THREE.Scene, config?: Partial<VTTFogConfig>) {
    this.scene = scene;
    this.config = {
      gridWidth: 50,
      gridHeight: 50,
      color: { r: 0.02, g: 0.02, b: 0.05 }, // BG3 bluish-dark
      opacity: 0.95,
      edgeSoftness: 0.3,
      animationSpeed: 1.0,
      ...config
    };
  }

  initialize(gridWidth: number, gridHeight: number, mapWidth: number, mapHeight: number): void {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    
    // Create fog data texture (RED format, single channel)
    const size = gridWidth * gridHeight;
    this.fogData = new Uint8Array(size);
    this.fogData.fill(0); // Start with everything hidden
    
    this.fogTexture = new THREE.DataTexture(
      this.fogData,
      gridWidth,
      gridHeight,
      THREE.RedFormat,
      THREE.UnsignedByteType
    );
    this.fogTexture.needsUpdate = true;
    this.fogTexture.minFilter = THREE.LinearFilter;
    this.fogTexture.magFilter = THREE.LinearFilter;
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        fogTexture: { value: this.fogTexture },
        time: { value: 0.0 },
        edgeSoftness: { value: this.config.edgeSoftness },
        fogColor: { value: new THREE.Vector3(
          this.config.color.r,
          this.config.color.g,
          this.config.color.b
        )},
        fogOpacity: { value: this.config.opacity }
      },
      vertexShader: fogVertexShader,
      fragmentShader: fogFragmentShader,
      transparent: true,
      depthWrite: false
    });
    
    // Create fog plane mesh
    const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
    this.mesh.position.y = 0.02; // Slightly above map to avoid z-fighting
    this.mesh.renderOrder = 2; // Render after map and grid
    
    this.scene.add(this.mesh);
    
    console.log(`[FogRenderer] Initialized ${gridWidth}x${gridHeight} fog grid`);
  }

  loadFromSupabase(cells: VTTFogCell[]): void {
    if (!this.fogData) return;
    
    cells.forEach(cell => {
      const index = cell.y * this.gridWidth + cell.x;
      if (index >= 0 && index < this.fogData!.length) {
        this.fogData![index] = cell.revealed;
      }
    });
    
    if (this.fogTexture) {
      this.fogTexture.needsUpdate = true;
    }
    
    console.log(`[FogRenderer] Loaded ${cells.length} fog cells from Supabase`);
  }

  revealArea(centerX: number, centerY: number, brush: FogBrush): void {
    if (!this.fogData) return;
    
    const radius = brush.radius;
    const strength = brush.strength;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = Math.floor(centerX + dx);
        const y = Math.floor(centerY + dy);
        
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;
        
        const index = y * this.gridWidth + x;
        const falloff = 1.0 - (distance / radius);
        const revealAmount = Math.floor(255 * strength * falloff);
        
        const currentValue = this.fogData[index];
        const newValue = Math.min(255, currentValue + revealAmount);
        
        if (newValue !== currentValue) {
          this.fogData[index] = newValue;
          this.changedCells.add(`${x},${y}`);
        }
      }
    }
    
    if (this.fogTexture && this.changedCells.size > 0) {
      this.fogTexture.needsUpdate = true;
    }
  }

  hideArea(centerX: number, centerY: number, brush: FogBrush): void {
    if (!this.fogData) return;
    
    const radius = brush.radius;
    const strength = brush.strength;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = Math.floor(centerX + dx);
        const y = Math.floor(centerY + dy);
        
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radius) continue;
        
        const index = y * this.gridWidth + x;
        const falloff = 1.0 - (distance / radius);
        const hideAmount = Math.floor(255 * strength * falloff);
        
        const currentValue = this.fogData[index];
        const newValue = Math.max(0, currentValue - hideAmount);
        
        if (newValue !== currentValue) {
          this.fogData[index] = newValue;
          this.changedCells.add(`${x},${y}`);
        }
      }
    }
    
    if (this.fogTexture && this.changedCells.size > 0) {
      this.fogTexture.needsUpdate = true;
    }
  }

  revealAll(): void {
    if (!this.fogData) return;
    
    this.fogData.fill(255);
    
    if (this.fogTexture) {
      this.fogTexture.needsUpdate = true;
    }
    
    // Mark all cells as changed
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.changedCells.add(`${x},${y}`);
      }
    }
    
    console.log('[FogRenderer] Revealed all fog');
  }

  hideAll(): void {
    if (!this.fogData) return;
    
    this.fogData.fill(0);
    
    if (this.fogTexture) {
      this.fogTexture.needsUpdate = true;
    }
    
    // Mark all cells as changed
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.changedCells.add(`${x},${y}`);
      }
    }
    
    console.log('[FogRenderer] Hidden all fog');
  }

  exportChangedCells(): VTTFogCell[] {
    if (!this.fogData) return [];
    
    const cells: VTTFogCell[] = [];
    
    this.changedCells.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const index = y * this.gridWidth + x;
      
      cells.push({
        x,
        y,
        revealed: this.fogData![index]
      });
    });
    
    this.changedCells.clear();
    
    return cells;
  }

  update(deltaTime: number): void {
    if (!this.material) return;
    
    this.time += deltaTime * this.config.animationSpeed;
    this.material.uniforms.time.value = this.time;
  }

  setVisible(visible: boolean): void {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    if (this.fogTexture) {
      this.fogTexture.dispose();
    }
    
    this.fogData = null;
    this.changedCells.clear();
    
    console.log('[FogRenderer] Disposed');
  }
}
