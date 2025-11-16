// src/vtt/engine/VTTCore.ts
import { WebGLRendererCore } from './WebGLRenderer';
import { MapRenderer } from './MapRenderer';
import { GridRenderer } from './GridRenderer';
import type { VTTConfig } from '../types/engine';
import type { MapDimensions } from '../types/map';
import * as THREE from 'three';

export class VTTCore {
  private renderer: WebGLRendererCore;
  private mapRenderer: MapRenderer;
  private gridRenderer: GridRenderer;
  private config: VTTConfig;
  
  private currentMapDimensions: MapDimensions | null = null;
  
  // Placeholder meshes for testing
  private testCube: THREE.Mesh | null = null;

  constructor(canvas: HTMLCanvasElement, config: VTTConfig) {
    console.log('[VTTCore] Initializing with config:', config);
    
    this.config = config;
    this.renderer = new WebGLRendererCore(canvas);
    this.mapRenderer = new MapRenderer(this.renderer);
    this.gridRenderer = new GridRenderer(this.renderer);
    
    // Initialize scene
    this.initScene();
  }

  private async initScene() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.renderer.add(ambientLight);

    // Load map if provided in config
    if (this.config.mapUrl) {
      await this.loadMap(this.config.mapUrl, this.config.gridSize || 50);
    } else {
      // Add test cube if no map
      this.addTestCube();
    }

    console.log('[VTTCore] Scene initialized');
  }

  private addTestCube() {
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true
    });
    this.testCube = new THREE.Mesh(geometry, material);
    this.renderer.add(this.testCube);

    // Add rotation animation
    this.renderer.addPass((dt) => {
      if (this.testCube) {
        this.testCube.rotation.x += dt * 0.5;
        this.testCube.rotation.y += dt * 0.3;
      }
    });

    console.log('[VTTCore] Test cube added');
  }

  /**
   * Load a battle map with grid
   */
  async loadMap(url: string, gridCellSize: number = 50) {
    try {
      console.log('[VTTCore] Loading map:', { url, gridCellSize });

      // Remove test cube if exists
      if (this.testCube) {
        this.renderer.remove(this.testCube);
        this.testCube = null;
      }

      // Load the map
      const dimensions = await this.mapRenderer.loadMap({
        url,
        width: 1000,
        height: 1000,
        pixelsPerUnit: 1
      });

      if (dimensions) {
        this.currentMapDimensions = {
          ...dimensions,
          gridCellSize
        };

        // Create grid overlay
        this.gridRenderer.createGrid({
          width: dimensions.worldWidth,
          height: dimensions.worldHeight,
          cellSize: gridCellSize,
          color: 0xaaaaaa,
          opacity: 0.3
        });

        console.log('[VTTCore] Map and grid loaded successfully');
      }

      return dimensions;
    } catch (error) {
      console.error('[VTTCore] Failed to load map:', error);
      throw error;
    }
  }

  /**
   * Toggle grid visibility
   */
  toggleGrid(visible: boolean) {
    this.gridRenderer.setVisible(visible);
  }

  /**
   * Update grid opacity
   */
  setGridOpacity(opacity: number) {
    this.gridRenderer.setOpacity(opacity);
  }

  /**
   * Get current map dimensions
   */
  getMapDimensions(): MapDimensions | null {
    return this.currentMapDimensions;
  }

  start() {
    console.log('[VTTCore] Starting renderer');
    this.renderer.start();
  }

  stop() {
    console.log('[VTTCore] Stopping renderer');
    this.renderer.stop();
  }

  dispose() {
    console.log('[VTTCore] Disposing VTT Core');
    this.mapRenderer.dispose();
    this.gridRenderer.dispose();
    this.renderer.dispose();
  }

  getRenderer(): WebGLRendererCore {
    return this.renderer;
  }

  getMapRenderer(): MapRenderer {
    return this.mapRenderer;
  }

  getGridRenderer(): GridRenderer {
    return this.gridRenderer;
  }
}
