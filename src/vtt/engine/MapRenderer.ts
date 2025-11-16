// src/vtt/engine/MapRenderer.ts
import * as THREE from 'three';
import { TextureLoader } from './TextureLoader';
import { WebGLRendererCore } from './WebGLRenderer';

export interface MapConfig {
  url: string;
  width: number;
  height: number;
  pixelsPerUnit?: number; // pixels per world unit (for scaling)
}

export class MapRenderer {
  private mapMesh: THREE.Mesh | null = null;
  private texture: THREE.Texture | null = null;
  private textureLoader: TextureLoader;
  private currentMapUrl: string | null = null;
  private renderer: WebGLRendererCore;

  constructor(renderer: WebGLRendererCore) {
    this.renderer = renderer;
    this.textureLoader = new TextureLoader();
  }

  /**
   * Load and display a battle map
   */
  async loadMap(config: MapConfig) {
    console.log('[MapRenderer] Loading map:', config);

    // Remove existing map if any
    if (this.mapMesh) {
      this.clearMap();
    }

    try {
      // Load texture
      this.texture = await this.textureLoader.loadMapTexture(config.url);
      this.currentMapUrl = config.url;

      // Calculate world size based on image dimensions
      const imageWidth = this.texture.image?.width || config.width;
      const imageHeight = this.texture.image?.height || config.height;
      
      // Scale to fit the viewport nicely
      const scale = 800 / Math.max(imageWidth, imageHeight);
      const worldWidth = imageWidth * scale;
      const worldHeight = imageHeight * scale;

      console.log('[MapRenderer] Map dimensions:', {
        imageWidth,
        imageHeight,
        worldWidth,
        worldHeight,
        scale
      });

      // Create plane geometry for the map
      const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight);
      
      // Create material with the map texture
      const material = new THREE.MeshBasicMaterial({
        map: this.texture,
        transparent: false,
        side: THREE.FrontSide,
        depthWrite: true
      });

      // Create mesh
      this.mapMesh = new THREE.Mesh(geometry, material);
      this.mapMesh.position.set(0, 0, 0); // Base layer at z=0
      this.mapMesh.name = 'battle-map';

      // Add to scene
      this.renderer.add(this.mapMesh);

      console.log('[MapRenderer] Map loaded and added to scene');

      return {
        worldWidth,
        worldHeight,
        imageWidth,
        imageHeight
      };
    } catch (error) {
      console.error('[MapRenderer] Failed to load map:', error);
      throw error;
    }
  }

  /**
   * Clear the current map
   */
  clearMap() {
    if (this.mapMesh) {
      console.log('[MapRenderer] Clearing map');
      
      // Remove from scene
      this.renderer.remove(this.mapMesh);
      
      // Dispose geometry and material
      this.mapMesh.geometry.dispose();
      if (this.mapMesh.material instanceof THREE.Material) {
        this.mapMesh.material.dispose();
      }
      
      this.mapMesh = null;
    }

    // Dispose texture if exists
    if (this.currentMapUrl) {
      this.textureLoader.disposeTexture(this.currentMapUrl);
      this.currentMapUrl = null;
    }
    
    this.texture = null;
  }

  /**
   * Update map opacity (for transitions)
   */
  setOpacity(opacity: number) {
    if (this.mapMesh && this.mapMesh.material instanceof THREE.MeshBasicMaterial) {
      this.mapMesh.material.transparent = opacity < 1;
      this.mapMesh.material.opacity = opacity;
      this.mapMesh.material.needsUpdate = true;
    }
  }

  /**
   * Get current map mesh (for raycasting, etc.)
   */
  getMapMesh(): THREE.Mesh | null {
    return this.mapMesh;
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.clearMap();
    this.textureLoader.disposeAll();
  }
}
