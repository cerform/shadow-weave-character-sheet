// src/systems/fog/FogRenderer.ts
import * as THREE from 'three';
import { useFogStore } from '@/stores/fogStore';

type FogCell = {
  sprite: THREE.Sprite;
  // текущее целевое состояние клетки: 1 = туман есть, 0 = открыт
  target: number;
  // визуальная непрозрачность (плавно тянем к target)
  opacity: number;
  // индивидуальная фаза/скорость анимации облака
  rotSpeed: number;
  scalePhase: number;
  scaleSpeed: number;
};

export class FogRenderer {
  private scene: THREE.Scene;
  private group: THREE.Group | null = null;
  private cloudTexture: THREE.Texture | null = null;
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
    
    this.rebuildLayer(); // первый билд
  }

  /** вызывать при изменении битмапы fogStore */
  rebuildLayer() {
    const fog = useFogStore.getState().maps[this.mapId];
    if (!this.cloudTexture || !fog) return;

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

    // создаём спрайты только там, где туман есть (v===0)
    for (let y = 0; y < this.gridH; y++) {
      for (let x = 0; x < this.gridW; x++) {
        const v = fog[y * this.gridW + x]; // 1 = разведано, 0 = туман
        const mat = new THREE.SpriteMaterial({
          map: this.cloudTexture,
          transparent: true,
          opacity: 0.0,        // старт с 0, потом анимируем
          depthWrite: false,
          blending: THREE.NormalBlending
        });
        const sprite = new THREE.Sprite(mat);

        // чуть больше тайла, чтобы края перекрывались мягко
        const base = this.tileSize * 1.35;
        sprite.scale.set(base, base, 1);
        // поднимаем на несколько сантиметров, чтобы не пересекался с землёй
        sprite.position.set(x * this.tileSize, 0.15, y * this.tileSize);

        // случайные параметры «живости»
        const rotSpeed = (Math.random() * 0.3 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
        const scaleSpeed = Math.random() * 0.5 + 0.2;
        const scalePhase = Math.random() * Math.PI * 2;

        g.add(sprite);
        this.cells.push({
          sprite,
          target: v === 0 ? 1 : 0, // если 0 (не разведано) → туман = 1
          opacity: v === 0 ? 0.6 : 0.0,
          rotSpeed,
          scalePhase,
          scaleSpeed
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
      // 1 = открыто → target 0; 0 = туман → target 1
      this.cells[i].target = fog[i] === 0 ? 1 : 0;
    }
  }

  /** вызывать каждый кадр: delta — в секундах */
  tick(delta: number) {
    if (!this.group) return;
    // плавное приближение opacity к целевому состоянию
    const fadeSpeed = 3.0; // скорость растворения/появления
    const minOpacity = 0.0;
    const maxOpacity = 0.65;

    for (let i = 0; i < this.cells.length; i++) {
      const c = this.cells[i];
      // easing к целевой непрозрачности
      const target = c.target > 0 ? maxOpacity : minOpacity;
      c.opacity += (target - c.opacity) * Math.min(1, fadeSpeed * delta);

      // применяем
      const m = c.sprite.material as THREE.SpriteMaterial;
      m.opacity = c.opacity;

      // «живой» туман — лёгкая ротация и дыхание масштаба
      c.sprite.material.rotation += c.rotSpeed * delta;
      const s = 1 + Math.sin(c.scalePhase + performance.now() * 0.001 * c.scaleSpeed) * 0.05;
      c.sprite.scale.setScalar(this.tileSize * 1.35 * s);
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
  }
}