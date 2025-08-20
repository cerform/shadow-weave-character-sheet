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

    // Создаем материал для 3D облаков
    this.cloudMaterial = new THREE.MeshLambertMaterial({
      map: this.cloudTexture,
      transparent: true,
      opacity: 0.8,
      color: 0xf8f8f8, // слегка теплый белый
      fog: false, // облака не должны быть затронуты туманом сцены
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // для более мягкого смешивания
      alphaTest: 0.1 // убираем совсем прозрачные пиксели
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

    // создаём 3D облака только там, где туман есть (v===0)
    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const v = fog[y * this.gridW + x]; // 1 = разведано, 0 = туман
        
        // Создаем группу из нескольких сфер для более объемного вида
        const cloudGroup = new THREE.Group();
        
        // Основная сфера
        const mainGeometry = new THREE.SphereGeometry(this.tileSize * 0.7, 12, 8);
        const mainMesh = new THREE.Mesh(mainGeometry, this.cloudMaterial.clone());
        cloudGroup.add(mainMesh);
        
        // Дополнительные сферы для объема (делаем облако более пушистым)
        for (let i = 0; i < 4; i++) {
          const extraGeometry = new THREE.SphereGeometry(
            this.tileSize * (0.4 + Math.random() * 0.3), 
            8, 
            6
          );
          const extraMesh = new THREE.Mesh(extraGeometry, this.cloudMaterial.clone());
          extraMesh.position.set(
            (Math.random() - 0.5) * this.tileSize * 1.0,
            (Math.random() - 0.5) * this.tileSize * 0.4,
            (Math.random() - 0.5) * this.tileSize * 1.0
          );
          extraMesh.scale.setScalar(0.7 + Math.random() * 0.6); // случайные размеры
          cloudGroup.add(extraMesh);
        }

        // Позиционируем облако над картой
        const baseHeight = this.tileSize * 1.2; // поднимаем выше над картой
        cloudGroup.position.set(
          x * this.tileSize, 
          baseHeight + Math.random() * this.tileSize * 0.4, // больше вариации по высоте
          y * this.tileSize
        );
        
        // Случайный поворот
        cloudGroup.rotation.y = Math.random() * Math.PI * 2;

        // случайные параметры «живости»
        const rotSpeed = {
          x: (Math.random() * 0.1 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
          y: (Math.random() * 0.15 + 0.03) * (Math.random() > 0.5 ? 1 : -1),
          z: (Math.random() * 0.08 + 0.01) * (Math.random() > 0.5 ? 1 : -1)
        };
        const scaleSpeed = Math.random() * 0.3 + 0.1;
        const scalePhase = Math.random() * Math.PI * 2;
        const originalScale = 0.8 + Math.random() * 0.4; // случайный размер

        cloudGroup.scale.setScalar(originalScale);

        g.add(cloudGroup);
        this.cells.push({
          mesh: cloudGroup,
          target: v === 0 ? 1 : 0, // если 0 (не разведано) → туман = 1
          opacity: v === 0 ? 0.8 : 0.0, // видимая непрозрачность тумана
          rotSpeed,
          scalePhase,
          scaleSpeed,
          originalScale
        });
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
    
    const total = this.gridW * this.gridH;
    for (let i = 0; i < total && i < this.cells.length; i++) {
      // 1 = открыто → target 0 (туман исчезает); 0 = туман → target 1 (туман виден)
      this.cells[i].target = fog[i] === 0 ? 1 : 0;
    }
  }

  /** вызывать каждый кадр: delta — в секундах */
  tick(delta: number) {
    if (!this.group) return;
    // плавное приближение opacity к целевому состоянию
    const fadeSpeed = 2.0; // скорость растворения/появления
    const minOpacity = 0.0;
    const maxOpacity = 0.85;

    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      // easing к целевой непрозрачности
      const target = c.target > 0 ? maxOpacity : minOpacity;
      c.opacity += (target - c.opacity) * Math.min(1, fadeSpeed * delta);

      // применяем непрозрачность ко всем материалам в группе
      c.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material as THREE.MeshLambertMaterial;
          material.opacity = c.opacity;
          material.visible = c.opacity > 0.01;
        }
      });

      // «живой» туман — лёгкая ротация и дыхание масштаба
      c.mesh.rotation.x += c.rotSpeed.x * delta;
      c.mesh.rotation.y += c.rotSpeed.y * delta;
      c.mesh.rotation.z += c.rotSpeed.z * delta;
      
      const breathingScale = 1 + Math.sin(c.scalePhase + performance.now() * 0.001 * c.scaleSpeed) * 0.08;
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