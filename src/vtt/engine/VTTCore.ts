// src/vtt/engine/VTTCore.ts
import { WebGLRendererCore } from './WebGLRenderer';
import { MapRenderer } from './MapRenderer';
import { GridRenderer } from './GridRenderer';
import { TokenRenderer } from './TokenRenderer';
import { FogRenderer } from './FogRenderer';
import { FogSyncEngine } from './SyncEngine';
import type { VTTConfig } from '../types/engine';
import type { MapDimensions } from '../types/map';
import type { VTTToken } from '../types/token';
import type { FogBrush } from '../types/fog';
import * as THREE from 'three';

export class VTTCore {
  private renderer: WebGLRendererCore;
  private mapRenderer: MapRenderer;
  private gridRenderer: GridRenderer;
  private tokenRenderer: TokenRenderer;
  private fogRenderer: FogRenderer;
  private fogSync: FogSyncEngine | null = null;
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
    this.tokenRenderer = new TokenRenderer(this.renderer, {
      glowIntensity: 1.0,
      showHPBars: true,
      showNames: true
    });
    this.fogRenderer = new FogRenderer(this.renderer.scene);
    
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

  /**
   * Token management
   */
  addOrUpdateToken(token: VTTToken) {
    this.tokenRenderer.addOrUpdateToken(token);
  }

  removeToken(tokenId: string) {
    this.tokenRenderer.removeToken(tokenId);
  }

  selectToken(tokenId: string) {
    this.tokenRenderer.selectToken(tokenId);
  }

  deselectAllTokens() {
    this.tokenRenderer.deselectAll();
  }

  getSelectedTokenId(): string | null {
    return this.tokenRenderer.getSelectedTokenId();
  }

  /**
   * Initialize fog of war system
   */
  async initializeFog(sessionId: string, mapId: string, isDM: boolean, gridWidth: number, gridHeight: number) {
    if (!this.currentMapDimensions) {
      console.error('[VTTCore] Cannot initialize fog without loaded map');
      return;
    }

    console.log('[VTTCore] Initializing fog system...');

    // Initialize fog renderer
    this.fogRenderer.initialize(
      gridWidth,
      gridHeight,
      this.currentMapDimensions.worldWidth,
      this.currentMapDimensions.worldHeight
    );

    // Initialize sync engine
    this.fogSync = new FogSyncEngine(sessionId, mapId, isDM);

    // Load initial fog state from Supabase
    const cells = await this.fogSync.loadInitialFog();
    this.fogRenderer.loadFromSupabase(cells);

    // Start batching for DM
    if (isDM) {
      this.fogSync.startBatching(2000);
    }

    // Subscribe to realtime changes
    this.fogSync.subscribeToChanges((cells) => {
      this.fogRenderer.loadFromSupabase(cells);
    });

    // Add fog update to render loop
    this.renderer.addPass((dt) => {
      this.fogRenderer.update(dt);
    });

    console.log('[VTTCore] Fog system initialized');
  }

  /**
   * Reveal fog area with brush
   */
  revealFog(worldX: number, worldZ: number, brush: FogBrush) {
    if (!this.currentMapDimensions) return;

    const gridX = worldX / this.currentMapDimensions.gridCellSize;
    const gridZ = worldZ / this.currentMapDimensions.gridCellSize;

    this.fogRenderer.revealArea(gridX, gridZ, brush);

    // Queue changes for sync
    const changedCells = this.fogRenderer.exportChangedCells();
    changedCells.forEach(cell => this.fogSync?.queueChange(cell));
  }

  /**
   * Hide fog area with brush
   */
  hideFog(worldX: number, worldZ: number, brush: FogBrush) {
    if (!this.currentMapDimensions) return;

    const gridX = worldX / this.currentMapDimensions.gridCellSize;
    const gridZ = worldZ / this.currentMapDimensions.gridCellSize;

    this.fogRenderer.hideArea(gridX, gridZ, brush);

    // Queue changes for sync
    const changedCells = this.fogRenderer.exportChangedCells();
    changedCells.forEach(cell => this.fogSync?.queueChange(cell));
  }

  /**
   * Reveal all fog
   */
  revealAllFog() {
    this.fogRenderer.revealAll();

    const changedCells = this.fogRenderer.exportChangedCells();
    changedCells.forEach(cell => this.fogSync?.queueChange(cell));
  }

  /**
   * Hide all fog
   */
  hideAllFog() {
    this.fogRenderer.hideAll();

    const changedCells = this.fogRenderer.exportChangedCells();
    changedCells.forEach(cell => this.fogSync?.queueChange(cell));
  }

  /**
   * Toggle fog visibility
   */
  setFogVisible(visible: boolean) {
    this.fogRenderer.setVisible(visible);
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
    this.tokenRenderer.dispose();
    this.mapRenderer.dispose();
    this.gridRenderer.dispose();
    this.fogRenderer.dispose();
    this.fogSync?.dispose();
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

  getTokenRenderer(): TokenRenderer {
    return this.tokenRenderer;
  }
}
