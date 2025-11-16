// src/vtt/engine/VTTCore.ts
import { WebGLRendererCore } from './WebGLRenderer';
import type { VTTConfig } from '../types/engine';
import * as THREE from 'three';

export class VTTCore {
  private renderer: WebGLRendererCore;
  private config: VTTConfig;
  
  // Placeholder meshes for testing
  private testCube: THREE.Mesh | null = null;

  constructor(canvas: HTMLCanvasElement, config: VTTConfig) {
    console.log('[VTTCore] Initializing with config:', config);
    
    this.config = config;
    this.renderer = new WebGLRendererCore(canvas);
    
    // Add test content
    this.initTestScene();
  }

  private initTestScene() {
    // Add test cube to verify rendering works
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00,
      wireframe: true
    });
    this.testCube = new THREE.Mesh(geometry, material);
    this.renderer.add(this.testCube);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.renderer.add(ambientLight);

    // Add rotation animation pass
    this.renderer.addPass((dt) => {
      if (this.testCube) {
        this.testCube.rotation.x += dt * 0.5;
        this.testCube.rotation.y += dt * 0.3;
      }
    });

    console.log('[VTTCore] Test scene initialized');
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
    this.renderer.dispose();
  }

  getRenderer(): WebGLRendererCore {
    return this.renderer;
  }
}
