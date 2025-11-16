// src/vtt/engine/TextureLoader.ts
import * as THREE from 'three';

export class TextureLoader {
  private loader: THREE.TextureLoader;
  private loadedTextures: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  /**
   * Load a map texture from URL with caching
   */
  async loadMapTexture(url: string): Promise<THREE.Texture> {
    // Check cache first
    if (this.loadedTextures.has(url)) {
      console.log('[TextureLoader] Using cached texture:', url);
      return this.loadedTextures.get(url)!;
    }

    console.log('[TextureLoader] Loading texture:', url);

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          // Configure texture for crisp map rendering
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          
          // Cache the texture
          this.loadedTextures.set(url, texture);
          
          console.log('[TextureLoader] Texture loaded successfully:', {
            url,
            width: texture.image?.width,
            height: texture.image?.height
          });
          
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('[TextureLoader] Failed to load texture:', url, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Dispose a specific texture
   */
  disposeTexture(url: string) {
    const texture = this.loadedTextures.get(url);
    if (texture) {
      texture.dispose();
      this.loadedTextures.delete(url);
      console.log('[TextureLoader] Disposed texture:', url);
    }
  }

  /**
   * Dispose all cached textures
   */
  disposeAll() {
    this.loadedTextures.forEach((texture, url) => {
      texture.dispose();
      console.log('[TextureLoader] Disposed:', url);
    });
    this.loadedTextures.clear();
  }
}
