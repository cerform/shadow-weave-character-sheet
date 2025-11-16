// src/vtt/engine/GridRenderer.ts
import * as THREE from 'three';
import { WebGLRendererCore } from './WebGLRenderer';

export interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
  color?: number;
  opacity?: number;
  lineWidth?: number;
}

export class GridRenderer {
  private gridMesh: THREE.LineSegments | null = null;
  private renderer: WebGLRendererCore;
  private config: GridConfig | null = null;

  constructor(renderer: WebGLRendererCore) {
    this.renderer = renderer;
  }

  /**
   * Create and display a BG3-style grid
   */
  createGrid(config: GridConfig) {
    console.log('[GridRenderer] Creating grid:', config);

    // Remove existing grid if any
    if (this.gridMesh) {
      this.clearGrid();
    }

    this.config = config;

    const {
      width,
      height,
      cellSize,
      color = 0x888888,
      opacity = 0.25
    } = config;

    const positions: number[] = [];

    // Calculate grid bounds
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    // Vertical lines (BG3 style - thin, subtle)
    for (let i = 0; i <= cols; i++) {
      const x = -halfWidth + (i * cellSize);
      positions.push(
        x, -halfHeight, 1,  // start point (z=1 to be above map)
        x, halfHeight, 1    // end point
      );
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = -halfHeight + (i * cellSize);
      positions.push(
        -halfWidth, y, 1,   // start point
        halfWidth, y, 1     // end point
      );
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    // Create material (BG3 style - subtle, semi-transparent)
    const material = new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
      transparent: true,
      linewidth: 1, // Note: linewidth > 1 only works with WebGLRenderer when using LineMaterial
      depthWrite: false,
      depthTest: true
    });

    // Create line segments
    this.gridMesh = new THREE.LineSegments(geometry, material);
    this.gridMesh.name = 'battle-grid';
    this.gridMesh.renderOrder = 1; // Render after map but before tokens

    // Add to scene
    this.renderer.add(this.gridMesh);

    console.log('[GridRenderer] Grid created:', {
      cells: cols * rows,
      lines: positions.length / 6
    });
  }

  /**
   * Update grid visibility
   */
  setVisible(visible: boolean) {
    if (this.gridMesh) {
      this.gridMesh.visible = visible;
    }
  }

  /**
   * Update grid opacity
   */
  setOpacity(opacity: number) {
    if (this.gridMesh && this.gridMesh.material instanceof THREE.LineBasicMaterial) {
      this.gridMesh.material.opacity = opacity;
      this.gridMesh.material.transparent = opacity < 1;
      this.gridMesh.material.needsUpdate = true;
    }
  }

  /**
   * Update grid color (for themes, etc.)
   */
  setColor(color: number) {
    if (this.gridMesh && this.gridMesh.material instanceof THREE.LineBasicMaterial) {
      this.gridMesh.material.color.setHex(color);
      this.gridMesh.material.needsUpdate = true;
    }
  }

  /**
   * Clear the grid
   */
  clearGrid() {
    if (this.gridMesh) {
      console.log('[GridRenderer] Clearing grid');
      
      // Remove from scene
      this.renderer.remove(this.gridMesh);
      
      // Dispose geometry and material
      this.gridMesh.geometry.dispose();
      if (this.gridMesh.material instanceof THREE.Material) {
        this.gridMesh.material.dispose();
      }
      
      this.gridMesh = null;
    }
    
    this.config = null;
  }

  /**
   * Get grid mesh (for raycasting, etc.)
   */
  getGridMesh(): THREE.LineSegments | null {
    return this.gridMesh;
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.clearGrid();
  }
}
