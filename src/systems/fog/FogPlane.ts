// src/systems/fog/FogPlane.ts
import * as THREE from 'three';
import { buildFogMaskTexture, updateFogMaskTexture } from './FogMaskTexture';
import { useFogStore } from '@/stores/fogStore';

// Импортируем шейдеры как строки
const vertexShader = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uCloudTex;   // облачная текстура (RGBA)
uniform sampler2D uMaskTex;    // R8: 0=туман, 1=открыто (но в буфере 0/1)
uniform vec2      uMapPx;      // размер маски в пикселях (w,h)
uniform vec2      uTilePx;     // размер тайла в мировых пикселях по UV (для тайлинга облаков)
uniform float     uTime;       // время для анимации
uniform float     uOpacity;    // макс плотность тумана (0..1)

//
// лёгкий "шум" без текстур: 3-синусовой FBM
//
float n2(vec2 p){ return sin(p.x)*sin(p.y); }
float fbm(vec2 p){
  float f=0.0, a=0.5;
  for(int i=0;i<4;i++){
    f += a * n2(p);
    p = p*2.13 + vec2(19.7, 7.3);
    a *= 0.5;
  }
  return f*0.5 + 0.5; // 0..1
}

void main() {
  // Маска (в texel space): берём несколько сэмплов для "размытия краёв"
  // и вычисляем edgeFactor — чем ближе к границе, тем сильнее "протекание".
  vec2 texel = 1.0 / uMapPx;
  float m00 = texture2D(uMaskTex, vUv).r;         // 0..1 (0=tumor,1=open)
  float ml = texture2D(uMaskTex, vUv + vec2(-texel.x, 0.0)).r;
  float mr = texture2D(uMaskTex, vUv + vec2(+texel.x, 0.0)).r;
  float mt = texture2D(uMaskTex, vUv + vec2(0.0, -texel.y)).r;
  float mb = texture2D(uMaskTex, vUv + vec2(0.0, +texel.y)).r;

  // Граница там, где сосед отличается
  float edge = (abs(m00-ml)+abs(m00-mr)+abs(m00-mt)+abs(m00-mb)) * 0.5;
  edge = clamp(edge, 0.0, 1.0);

  // Базовый альфа тумана: 1 - mask
  float fogAlpha = 1.0 - m00;

  // Шум для "протекания": медленный сдвиг UV
  vec2 flow = vUv * uTilePx * 0.075 + vec2(uTime * 0.03, -uTime * 0.02);
  float noise = fbm(flow);

  // Мягкие края: плавно ослабляем альфу у границы с учётом шума
  float softEdge = smoothstep(0.1, 0.6, noise + (edge * 0.7));

  // Финальная альфа: туман * мягкий край * глобальная плотность
  float alpha = fogAlpha * softEdge * uOpacity;

  // Сэмплим облачную текстуру (тайлим слегка плотнее сетки)
  vec2 cloudUV = vUv * uTilePx * 0.9 + vec2(uTime * 0.01, 0.0);
  vec4 cloud = texture2D(uCloudTex, cloudUV);

  // Усиливаем альфу облака, но ограничиваем
  alpha *= clamp(cloud.a * 1.4, 0.0, 1.0);

  // Цвет облака слегка затемняем (можно подогнать под тему)
  vec3 col = mix(vec3(0.8), vec3(0.93), cloud.r);

  gl_FragColor = vec4(col, alpha);
}
`;

export class FogPlane {
  mesh: THREE.Mesh | null = null;
  private material!: THREE.ShaderMaterial;
  private cloud!: THREE.Texture;
  private mask!: THREE.DataTexture;
  private mapId: string;
  private tileSize: number;

  constructor(mapId = 'main-map', tileSize = 1) {
    this.mapId = mapId;
    this.tileSize = tileSize;
  }

  async init(scene: THREE.Scene) {
    const { size } = useFogStore.getState();
    // 1) Геометрия — плоскость размера карты по миру
    const width = size.w * this.tileSize;
    const height = size.h * this.tileSize;

    const geo = new THREE.PlaneGeometry(width, height, 1, 1);
    geo.rotateX(-Math.PI / 2); // на землю (XZ)

    // 2) Текстуры
    const cloudTex = await new Promise<THREE.Texture>((res, rej) =>
      new THREE.TextureLoader().load('/assets/fog/cloud.png', t => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.anisotropy = 4;
        t.needsUpdate = true;
        res(t);
      }, undefined, (error) => {
        console.warn('Failed to load cloud texture, using default');
        // Создаем простую белую текстуру как fallback
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 256, 256);
        const fallbackTex = new THREE.CanvasTexture(canvas);
        fallbackTex.wrapS = fallbackTex.wrapT = THREE.RepeatWrapping;
        res(fallbackTex);
      })
    );
    
    const maskTex = buildFogMaskTexture(this.mapId);
    if (!maskTex) throw new Error('Fog mask not available — setMap() first');

    this.cloud = cloudTex;
    this.mask = maskTex;

    // 3) Материал
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uCloudTex: { value: this.cloud },
        uMaskTex:  { value: this.mask },
        uMapPx:    { value: new THREE.Vector2(size.w, size.h) },
        uTilePx:   { value: new THREE.Vector2(size.w, size.h) }, // тайлим от размеров сетки
        uTime:     { value: 0.0 },
        uOpacity:  { value: 0.65 } // глобальная плотность
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.name = 'fog-plane';
    // Чуть выше пола, чтобы не z-fight'ило
    this.mesh.position.set(0, 0.12, 0);
    scene.add(this.mesh);
  }

  onStoreUpdate = () => {
    if (this.mask) updateFogMaskTexture(this.mask, this.mapId);
  };

  /** подписаться на изменения карты тумана */
  subscribe() {
    return useFogStore.subscribe(() => this.onStoreUpdate());
  }

  /** обновлять время анимации */
  tick(delta: number, elapsed: number) {
    if (!this.material) return;
    this.material.uniforms.uTime.value = elapsed;
  }

  dispose(scene: THREE.Scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
      (this.mesh.geometry as any)?.dispose?.();
      (this.mesh.material as any)?.dispose?.();
      this.mesh = null;
    }
    this.cloud?.dispose?.();
    this.mask?.dispose?.();
  }
}