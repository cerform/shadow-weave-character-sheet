// src/systems/fog/FogMaskTexture.ts
import * as THREE from 'three';
import { useFogStore } from '@/stores/fogStore';

/**
 * Строим текстуру-маску (R8): 0 = туман, 255 = открыто
 * Шейдер сам превратит это в альфу.
 */
export function buildFogMaskTexture(mapId: string) {
  const { maps, size } = useFogStore.getState();
  const data = maps[mapId];
  if (!data) return null;

  const tex = new THREE.DataTexture(
    data,            // Uint8Array длиной w*h (0/1)
    size.w,
    size.h,
    THREE.RedFormat,
    THREE.UnsignedByteType
  );
  // конвертим 0/1 → 0/255 сразу в GPU через цветопреобразование нельзя,
  // поэтому просто используем LinearFilter и умножим в шейдере на 255.0.
  tex.needsUpdate = true;
  tex.flipY = true;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/** обновляем существующую текстуру без пересоздания */
export function updateFogMaskTexture(tex: THREE.DataTexture, mapId: string) {
  const { maps } = useFogStore.getState();
  const src = maps[mapId];
  if (!src) return;
  // копируем новые значения в буфер текстуры (ожидается Uint8Array)
  (tex.image.data as Uint8Array).set(src);
  tex.needsUpdate = true;
}