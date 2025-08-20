// Modern fog renderer with advanced visual effects
import * as THREE from 'three';
import { useEnhancedFogStore } from '@/stores/enhancedFogStore';

interface FogMesh extends THREE.Mesh {
  userData: {
    targetOpacity: number;
    currentOpacity: number;
    x: number;
    y: number;
    animationSpeed: number;
    scalePhase: number;
    rotationSpeed: number;
  };
}

export class ModernFogRenderer {
  private scene: THREE.Scene;
  private mapId: string;
  private tileSize: number;
  private fogGroup: THREE.Group;
  private fogMeshes: Map<string, FogMesh> = new Map();
  private material: THREE.ShaderMaterial;
  private geometry: THREE.PlaneGeometry;
  private cloudTexture: THREE.Texture | null = null;

  // Advanced fog shader with improved visibility
  private vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying float vNoise;
    
    uniform float uTime;
    uniform float uNoiseScale;
    
    // Simple noise function
    float noise(vec3 p) {
      return sin(p.x * 12.0 + uTime * 0.5) * sin(p.y * 8.0 + uTime * 0.3) * sin(p.z * 16.0 + uTime * 0.7) * 0.5 + 0.5;
    }
    
    void main() {
      vUv = uv;
      vPosition = position;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      // Add subtle noise-based vertex displacement
      vec3 pos = position;
      float n = noise(position * uNoiseScale + uTime * 0.2);
      pos.y += n * 0.1; // Reduced displacement for better stability
      
      vNoise = n;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  private fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    varying float vNoise;
    
    uniform float uTime;
    uniform float uOpacity;
    uniform sampler2D uCloudTexture;
    uniform vec3 uFogColor;
    uniform float uDensity;
    uniform vec2 uCenter;
    uniform float uEdgeSoftness;
    
    void main() {
      // Distance from center for edge softening - improved formula
      float distFromCenter = length(vUv - vec2(0.5));
      float edgeAlpha = 1.0 - smoothstep(0.2, 0.6, distFromCenter);
      
      // Animated cloud texture sampling with better tiling
      vec2 cloudUv1 = vUv * 3.0 + vec2(uTime * 0.008, uTime * 0.004);
      vec2 cloudUv2 = vUv * 2.0 + vec2(-uTime * 0.006, uTime * 0.009);
      
      vec4 cloud1 = texture2D(uCloudTexture, cloudUv1);
      vec4 cloud2 = texture2D(uCloudTexture, cloudUv2);
      
      // Combine cloud layers with better blending
      float cloudDensity = (cloud1.r * 0.8 + cloud2.r * 0.6) * uDensity;
      
      // Add noise variation for organic look
      cloudDensity += vNoise * 0.2;
      
      // Animated alpha with improved breathing effect
      float breathe = sin(uTime * 0.6 + vWorldPosition.x * 0.3 + vWorldPosition.z * 0.4) * 0.15 + 0.85;
      
      // Enhanced alpha calculation with minimum visibility
      float finalAlpha = max(cloudDensity * edgeAlpha * uOpacity * breathe, uOpacity * 0.1);
      finalAlpha = clamp(finalAlpha, 0.0, 1.0);
      
      // Dynamic fog color with subtle variations
      vec3 fogColor = uFogColor + vec3(vNoise * 0.08);
      
      // Ensure fog is always somewhat visible
      if (finalAlpha < 0.05) {
        finalAlpha = uOpacity * 0.3;
      }
      
      gl_FragColor = vec4(fogColor, finalAlpha);
    }
  `;

  constructor(scene: THREE.Scene, mapId = 'main-map', tileSize = 1) {
    this.scene = scene;
    this.mapId = mapId;
    this.tileSize = tileSize;
    
    this.fogGroup = new THREE.Group();
    this.fogGroup.name = 'ModernFogGroup';
    this.scene.add(this.fogGroup);
    
    this.geometry = new THREE.PlaneGeometry(this.tileSize * 0.95, this.tileSize * 0.95);
    
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uCloudTexture: { value: null },
        uFogColor: { value: new THREE.Color(0.9, 0.95, 1.0) },
        uDensity: { value: 1.2 },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uEdgeSoftness: { value: 0.3 },
        uNoiseScale: { value: 2.0 }
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      alphaTest: 0.01,
      fog: false
    });
  }

  async initialize(): Promise<void> {
    try {
      // Generate procedural cloud texture if none provided
      this.cloudTexture = this.createProceduralCloudTexture();
      this.material.uniforms.uCloudTexture.value = this.cloudTexture;
      
      console.log('Modern fog renderer initialized');
    } catch (error) {
      console.error('Failed to initialize modern fog renderer:', error);
      throw error;
    }
  }

  private createProceduralCloudTexture(): THREE.DataTexture {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const idx = (i * size + j) * 4;
        
        // Generate multiple octaves of noise
        const x = i / size;
        const y = j / size;
        
        const noise1 = Math.sin(x * Math.PI * 8) * Math.sin(y * Math.PI * 8);
        const noise2 = Math.sin(x * Math.PI * 16) * Math.sin(y * Math.PI * 16) * 0.5;
        const noise3 = Math.sin(x * Math.PI * 32) * Math.sin(y * Math.PI * 32) * 0.25;
        
        const combined = (noise1 + noise2 + noise3) * 0.5 + 0.5;
        const value = Math.pow(combined, 1.5) * 255;
        
        data[idx] = value;     // R
        data[idx + 1] = value; // G  
        data[idx + 2] = value; // B
        data[idx + 3] = value; // A
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = texture.minFilter = THREE.LinearFilter;
    
    return texture;
  }

  updateFromStore(): void {
    const store = useEnhancedFogStore.getState();
    const hiddenCells = store.getHiddenCells(this.mapId);
    
    // Remove meshes that should no longer exist
    const currentKeys = new Set(Array.from(this.fogMeshes.keys()));
    const requiredKeys = new Set(hiddenCells.map(({ x, y }) => `${x},${y}`));
    
    // Remove unnecessary meshes
    currentKeys.forEach(key => {
      if (!requiredKeys.has(key)) {
        const mesh = this.fogMeshes.get(key);
        if (mesh) {
          this.fogGroup.remove(mesh);
          this.fogMeshes.delete(key);
        }
      }
    });
    
    // Add or update required meshes
    hiddenCells.forEach(({ x, y, cell }) => {
      const key = `${x},${y}`;
      let mesh = this.fogMeshes.get(key);
      
      if (!mesh) {
        mesh = this.createFogMesh(x, y);
        this.fogMeshes.set(key, mesh);
        this.fogGroup.add(mesh);
      }
      
      // Update target opacity based on animation progress
      const targetOpacity = cell.revealed ? 0 : 1;
      mesh.userData.targetOpacity = targetOpacity;
    });
  }

  private createFogMesh(x: number, y: number): FogMesh {
    const mesh = new THREE.Mesh(this.geometry, this.material.clone());
    
    // Position mesh at grid coordinates
    mesh.position.set(
      (x - 12) * this.tileSize,
      0.1, // Fixed height above ground
      (y - 12) * this.tileSize
    );
    
    // Create billboard effect - always face camera
    mesh.lookAt(0, 10, 0); // Face upward initially
    mesh.rotateX(-Math.PI / 2); // Lay flat but visible from all angles
    
    // Initialize user data for animation
    mesh.userData = {
      targetOpacity: 1,
      currentOpacity: 1,
      x,
      y,
      animationSpeed: 0.5 + Math.random() * 0.5,
      scalePhase: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    };
    
    return mesh as unknown as FogMesh;
  }

  tick(deltaTime: number, elapsedTime: number): void {
    // Update shader uniforms
    this.material.uniforms.uTime.value = elapsedTime;
    
    // Animate fog meshes
    this.fogMeshes.forEach(mesh => {
      const userData = mesh.userData;
      
      // Smooth opacity transition
      const opacityDiff = userData.targetOpacity - userData.currentOpacity;
      userData.currentOpacity += opacityDiff * userData.animationSpeed * deltaTime * 3;
      
      // Apply opacity
      if (mesh.material instanceof THREE.ShaderMaterial) {
        mesh.material.uniforms.uOpacity.value = userData.currentOpacity;
      }
      
      // Subtle scale animation
      const breatheScale = 0.95 + Math.sin(elapsedTime * 0.8 + userData.scalePhase) * 0.05;
      mesh.scale.setScalar(breatheScale);
      
      // Gentle rotation around Y axis for better visibility
      mesh.rotation.y += userData.rotationSpeed * deltaTime * 0.1;
      
      // Ensure mesh is always visible at proper height
      mesh.position.y = 0.1 + Math.sin(elapsedTime + userData.scalePhase) * 0.02;
      
      // Hide fully transparent meshes
      mesh.visible = userData.currentOpacity > 0.01;
    });
  }

  dispose(): void {
    this.scene.remove(this.fogGroup);
    
    this.fogMeshes.forEach(mesh => {
      this.fogGroup.remove(mesh);
      mesh.geometry.dispose();
    });
    
    this.fogMeshes.clear();
    this.material.dispose();
    this.geometry.dispose();
    
    if (this.cloudTexture) {
      this.cloudTexture.dispose();
    }
  }
}