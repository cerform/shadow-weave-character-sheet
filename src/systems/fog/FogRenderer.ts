// src/systems/fog/FogRenderer.ts
import * as THREE from 'three';
import { useFogStore } from '@/stores/fogStore';

type FogCell = {
  mesh: THREE.Group;
  // текущее целевое состояние клетки: 1 = туман есть, 0 = открыт
  target: number;
  // визуальная непрозрачность (плавно тянем к target)
  opacity: number;
  // индивидуальная фаза/скорость анимации облака
  rotSpeed: { x: number; y: number; z: number };
  scalePhase: number;
  scaleSpeed: number;
  originalScale: number;
};

export class FogRenderer {
  private scene: THREE.Scene;
  private group: THREE.Group | null = null;
  private cloudTexture: THREE.Texture | null = null;
  private cloudMaterial: THREE.Material | null = null;
  private cells: FogCell[] = [];
  private mapId = 'main-map';
  private tileSize = 5;
  private gridW = 0;
  private gridH = 0;

  constructor(scene: THREE.Scene, mapId = 'main-map', tileSize = 5) {
    this.scene = scene;
    this.mapId = mapId;
    this.tileSize = tileSize;
  }

  async init(textureUrl = '/assets/fog/cloud.png') {
    const loader = new THREE.TextureLoader();
    
    try {
      this.cloudTexture = await new Promise<THREE.Texture>((res, rej) =>
        loader.load(textureUrl, t => {
          t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
          t.anisotropy = 4;
          t.needsUpdate = true;
          res(t);
        }, undefined, rej)
      );
    } catch (error) {
      // Fallback: генерируем процедурную текстуру облака
      console.warn('Failed to load cloud texture, generating procedural cloud');
      const { generateCloudTexture } = await import('./CloudTextureGenerator');
      this.cloudTexture = generateCloudTexture(256);
    }

    // Создаем материал для реалистичного тумана
    this.cloudMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0.0 },
        opacity: { value: 0.6 },
        color: { value: new THREE.Color(0.9, 0.9, 0.95) },
        noiseScale: { value: 2.0 },
        speed: { value: 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform vec3 color;
        uniform float noiseScale;
        uniform float speed;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vec3 pos = vPosition * noiseScale + time * speed;
          float noise1 = snoise(pos);
          float noise2 = snoise(pos * 2.0 + time * 0.3);
          float noise3 = snoise(pos * 4.0 - time * 0.7);
          
          float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
          float alpha = smoothstep(-0.3, 0.3, combinedNoise);
          
          // Добавляем градиент по высоте для более реалистичного эффекта
          float heightFade = smoothstep(0.0, 1.0, vUv.y);
          alpha *= heightFade * opacity;
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
    
    this.rebuildLayer(); // первый билд
  }

  /** вызывать при изменении битмапы fogStore */
  rebuildLayer() {
    const fog = useFogStore.getState().maps[this.mapId];
    if (!this.cloudMaterial || !fog) return;

    const size = useFogStore.getState().size;
    this.gridW = size.w;
    this.gridH = size.h;

    // удалить старый слой
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse(o => {
        if ((o as any).material) (o as any).material.dispose?.();
        if ((o as any).geometry) (o as any).geometry.dispose?.();
      });
      this.group = null;
      this.cells = [];
    }

    const g = new THREE.Group();
    g.name = 'fog-layer';
    this.group = g;

    // Вычисляем границы сетки
    const mapWidth = this.gridW * this.tileSize;
    const mapHeight = this.gridH * this.tileSize;
    const offsetX = -mapWidth / 2; // центрируем карту
    const offsetZ = -mapHeight / 2;

    // создаём 3D облака только там, где туман есть (v===0) и только в пределах сетки
    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const v = fog[y * this.gridW + x]; // 1 = разведано, 0 = туман
        
        // Создаем облако только для закрытых областей (v === 0)
        if (v === 0) {
          // Позиция в мире - строго над клеткой сетки
          const worldX = offsetX + x * this.tileSize + this.tileSize / 2; // центр клетки
          const worldZ = offsetZ + y * this.tileSize + this.tileSize / 2; // центр клетки
          
          // Создаем группу из нескольких сфер для более объемного вида
          const cloudGroup = new THREE.Group();
          
          // Основная сфера - размер под клетку размером 1 единица
          const mainGeometry = new THREE.SphereGeometry(this.tileSize * 0.4, 12, 8);
          const mainMesh = new THREE.Mesh(mainGeometry, this.cloudMaterial.clone());
          cloudGroup.add(mainMesh);
          
          // Дополнительные сферы для объема (ограничиваем размер клеткой)
          for (let i = 0; i < 3; i++) {
            const extraGeometry = new THREE.SphereGeometry(
              this.tileSize * (0.2 + Math.random() * 0.15), 
              8, 
              6
            );
            const extraMesh = new THREE.Mesh(extraGeometry, this.cloudMaterial.clone());
            // Строго ограничиваем смещение размером клетки
            const maxOffset = this.tileSize * 0.3;
            extraMesh.position.set(
              (Math.random() - 0.5) * maxOffset,
              (Math.random() - 0.5) * this.tileSize * 0.2,
              (Math.random() - 0.5) * maxOffset
            );
            extraMesh.scale.setScalar(0.6 + Math.random() * 0.4);
            cloudGroup.add(extraMesh);
          }

          // Позиционируем облако строго над центром клетки
          const baseHeight = this.tileSize * 0.8; // поднимаем над картой
          cloudGroup.position.set(
            worldX, 
            baseHeight + Math.random() * this.tileSize * 0.3, // небольшая вариация по высоте
            worldZ
          );
          
          // Ограничиваем поворот
          cloudGroup.rotation.y = Math.random() * Math.PI * 2;
          cloudGroup.rotation.x = (Math.random() - 0.5) * 0.1;
          cloudGroup.rotation.z = (Math.random() - 0.5) * 0.1;

          // случайные параметры анимации
          const rotSpeed = {
            x: (Math.random() * 0.03 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
            y: (Math.random() * 0.05 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
            z: (Math.random() * 0.02 + 0.003) * (Math.random() > 0.5 ? 1 : -1)
          };
          const scaleSpeed = Math.random() * 0.15 + 0.03;
          const scalePhase = Math.random() * Math.PI * 2;
          const originalScale = 0.8 + Math.random() * 0.15;

          cloudGroup.scale.setScalar(originalScale);

          g.add(cloudGroup);
          this.cells.push({
            mesh: cloudGroup,
            target: 1, // туман виден
            opacity: 0.8, // начальная непрозрачность
            rotSpeed,
            scalePhase,
            scaleSpeed,
            originalScale
          });
        }
      }
    }
    this.scene.add(g);
  }

  /** плавно синхронизируем цели и исчезновение после reveal() */
  syncTargetsFromStore() {
    const fog = useFogStore.getState().maps[this.mapId];
    if (!fog || !this.group) return;
    
    // Если размер изменился — перестроим слой
    const size = useFogStore.getState().size;
    if (size.w !== this.gridW || size.h !== this.gridH) {
      this.rebuildLayer();
      return;
    }
    
    // Поскольку теперь мы создаем облака только для закрытых областей,
    // нужно полностью перестроить слой при любом изменении состояния
    this.rebuildLayer();
  }

  /** вызывать каждый кадр: delta — в секундах */
  tick(delta: number) {
    if (!this.group) return;
    
    // Обновляем время для анимации шейдера
    const time = performance.now() * 0.001;
    
    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      
      // применяем анимацию ко всем материалам в группе
      c.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.ShaderMaterial;
          if (material.uniforms) {
            material.uniforms.time.value = time;
            material.uniforms.opacity.value = c.opacity;
          }
          material.visible = c.opacity > 0.01;
        }
      });

      // «живой» туман — лёгкая ротация и дыхание масштаба
      c.mesh.rotation.x += c.rotSpeed.x * delta;
      c.mesh.rotation.y += c.rotSpeed.y * delta;
      c.mesh.rotation.z += c.rotSpeed.z * delta;
      
      const breathingScale = 1 + Math.sin(c.scalePhase + time * c.scaleSpeed) * 0.05;
      c.mesh.scale.setScalar(c.originalScale * breathingScale);
    }
  }

  dispose() {
    if (!this.group) return;
    this.scene.remove(this.group);
    this.group.traverse(o => {
      if ((o as any).material) (o as any).material.dispose?.();
      if ((o as any).geometry) (o as any).geometry.dispose?.();
    });
    this.group = null;
    this.cells = [];
    if (this.cloudMaterial) {
      this.cloudMaterial.dispose();
      this.cloudMaterial = null;
    }
  }
}