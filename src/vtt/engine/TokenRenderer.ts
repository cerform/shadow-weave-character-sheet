// src/vtt/engine/TokenRenderer.ts
import * as THREE from 'three';
import { WebGLRendererCore } from './WebGLRenderer';
import type { VTTToken, TokenRenderConfig } from '../types/token';

// Import shaders as strings
import tokenVertexShader from '../shaders/token.vert?raw';
import tokenFragmentShader from '../shaders/token.frag?raw';

export class TokenRenderer {
  private renderer: WebGLRendererCore;
  private tokenMeshes: Map<string, THREE.Mesh> = new Map();
  private selectedTokenId: string | null = null;
  private config: TokenRenderConfig;
  private animationTime: number = 0;

  constructor(renderer: WebGLRendererCore, config?: Partial<TokenRenderConfig>) {
    this.renderer = renderer;
    this.config = {
      glowIntensity: 1.0,
      showHPBars: true,
      showNames: true,
      animationSpeed: 1.0,
      ...config
    };

    // Add animation update pass
    this.renderer.addPass((dt) => this.update(dt));
  }

  /**
   * Add or update a token
   */
  addOrUpdateToken(token: VTTToken) {
    const existing = this.tokenMeshes.get(token.id);

    if (existing) {
      // Update existing token
      this.updateTokenPosition(token.id, token.position[0], token.position[1]);
      this.updateTokenSelection(token.id, token.isSelected || false);
      
      // Update color
      const material = existing.material as THREE.ShaderMaterial;
      material.uniforms.tokenColor.value.setStyle(token.color);
    } else {
      // Create new token
      this.createToken(token);
    }
  }

  /**
   * Create a new token mesh
   */
  private createToken(token: VTTToken) {
    // Base size in world units (50 units = 1 grid cell typically)
    const baseSize = 50;
    const tokenSize = baseSize * token.size;

    // Create circular geometry
    const geometry = new THREE.CircleGeometry(tokenSize / 2, 32);

    // Create shader material with BG3 glow
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tokenColor: { value: new THREE.Color(token.color) },
        glowIntensity: { value: 0.0 },
        isSelected: { value: token.isSelected ? 1.0 : 0.0 },
        opacity: { value: token.isVisible !== false ? 1.0 : 0.5 },
        tokenTexture: { value: null },
        hasTexture: { value: false },
        time: { value: 0.0 }
      },
      vertexShader: tokenVertexShader,
      fragmentShader: tokenFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(token.position[0], token.position[1], 2); // z=2 above grid
    mesh.name = `token-${token.id}`;
    mesh.userData = { tokenId: token.id, tokenData: token };

    // Add to scene
    this.renderer.add(mesh);
    this.tokenMeshes.set(token.id, mesh);

    console.log('[TokenRenderer] Token created:', token.id);

    // Load texture if provided
    if (token.imageUrl) {
      this.loadTokenTexture(token.id, token.imageUrl);
    }
  }

  /**
   * Load token texture asynchronously
   */
  private async loadTokenTexture(tokenId: string, imageUrl: string) {
    const mesh = this.tokenMeshes.get(tokenId);
    if (!mesh) return;

    try {
      const textureLoader = new THREE.TextureLoader();
      const texture = await textureLoader.loadAsync(imageUrl);
      
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.tokenTexture.value = texture;
      material.uniforms.hasTexture.value = true;
      material.needsUpdate = true;

      console.log('[TokenRenderer] Texture loaded for token:', tokenId);
    } catch (error) {
      console.error('[TokenRenderer] Failed to load texture:', error);
    }
  }

  /**
   * Update token position with optional smooth animation
   */
  updateTokenPosition(tokenId: string, x: number, y: number, animate = true) {
    const mesh = this.tokenMeshes.get(tokenId);
    if (!mesh) return;

    if (animate) {
      // TODO: Add smooth lerp animation
      // For now, instant update
      mesh.position.x = x;
      mesh.position.y = y;
    } else {
      mesh.position.x = x;
      mesh.position.y = y;
    }
  }

  /**
   * Update token selection state
   */
  updateTokenSelection(tokenId: string, isSelected: boolean) {
    const mesh = this.tokenMeshes.get(tokenId);
    if (!mesh) return;

    const material = mesh.material as THREE.ShaderMaterial;
    material.uniforms.isSelected.value = isSelected ? 1.0 : 0.0;

    if (isSelected) {
      this.selectedTokenId = tokenId;
    } else if (this.selectedTokenId === tokenId) {
      this.selectedTokenId = null;
    }
  }

  /**
   * Select a token
   */
  selectToken(tokenId: string) {
    // Deselect previous
    if (this.selectedTokenId && this.selectedTokenId !== tokenId) {
      this.updateTokenSelection(this.selectedTokenId, false);
    }

    // Select new
    this.updateTokenSelection(tokenId, true);
  }

  /**
   * Deselect all tokens
   */
  deselectAll() {
    this.tokenMeshes.forEach((mesh) => {
      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.isSelected.value = 0.0;
    });
    this.selectedTokenId = null;
  }

  /**
   * Remove a token
   */
  removeToken(tokenId: string) {
    const mesh = this.tokenMeshes.get(tokenId);
    if (!mesh) return;

    console.log('[TokenRenderer] Removing token:', tokenId);

    // Remove from scene
    this.renderer.remove(mesh);

    // Dispose geometry and material
    mesh.geometry.dispose();
    if (mesh.material instanceof THREE.Material) {
      const material = mesh.material as THREE.ShaderMaterial;
      
      // Dispose texture if exists
      if (material.uniforms.tokenTexture?.value) {
        material.uniforms.tokenTexture.value.dispose();
      }
      
      material.dispose();
    }

    this.tokenMeshes.delete(tokenId);

    if (this.selectedTokenId === tokenId) {
      this.selectedTokenId = null;
    }
  }

  /**
   * Clear all tokens
   */
  clearAll() {
    console.log('[TokenRenderer] Clearing all tokens');
    
    this.tokenMeshes.forEach((_, tokenId) => {
      this.removeToken(tokenId);
    });

    this.tokenMeshes.clear();
    this.selectedTokenId = null;
  }

  /**
   * Update animation (called each frame)
   */
  private update(dt: number) {
    this.animationTime += dt * this.config.animationSpeed;

    // Update glow intensity for selected tokens (pulsing effect)
    if (this.selectedTokenId) {
      const mesh = this.tokenMeshes.get(this.selectedTokenId);
      if (mesh) {
        const material = mesh.material as THREE.ShaderMaterial;
        // Pulsing glow: 0.7 to 1.0
        const pulse = Math.sin(this.animationTime * 3.0) * 0.15 + 0.85;
        material.uniforms.glowIntensity.value = pulse * this.config.glowIntensity;
        material.uniforms.time.value = this.animationTime;
      }
    }
  }

  /**
   * Get token mesh by ID (for raycasting)
   */
  getTokenMesh(tokenId: string): THREE.Mesh | undefined {
    return this.tokenMeshes.get(tokenId);
  }

  /**
   * Get all token meshes
   */
  getAllTokenMeshes(): THREE.Mesh[] {
    return Array.from(this.tokenMeshes.values());
  }

  /**
   * Get currently selected token ID
   */
  getSelectedTokenId(): string | null {
    return this.selectedTokenId;
  }

  /**
   * Update render config
   */
  updateConfig(config: Partial<TokenRenderConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Dispose all resources
   */
  dispose() {
    this.clearAll();
  }
}
