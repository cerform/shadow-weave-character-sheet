// src/components/battle/SyncedFogOverlay3D.tsx
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFogGridStore } from "@/stores/fogGridStore";

type Props = {
  /** Map size in 2D pixels (e.g., 1200 x 800) — important for UV mapping consistency */
  mapSize: { width: number; height: number };
  /** Plane size in world units used in your 3D map (e.g., 24 x 16) */
  planeSize?: { width: number; height: number };
  /** alpha for explored/hidden; 0..1 */
  opacityHidden?: number;
  opacityExplored?: number;
};

export const SyncedFogOverlay3D: React.FC<Props> = ({
  mapSize,
  planeSize = { width: 24, height: 16 },
  opacityHidden = 1.0,
  opacityExplored = 0.5,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const version = useFogGridStore(s => s.version);
  const raw = useFogGridStore(s => s.raw);
  const dims = useFogGridStore(s => s.dims);

  // make DataTexture RGBA from grid
  const texture = useMemo(() => {
    const { cols, rows } = dims();
    const data = new Uint8Array(cols * rows * 4);
    const tex = new THREE.DataTexture(data, cols, rows, THREE.RGBAFormat);
    tex.needsUpdate = true;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    mat.blending = THREE.NormalBlending;
    return mat;
  }, [texture]);

  // Update texture data whenever version changes
  useEffect(() => {
    const data = raw();
    const { cols, rows } = dims();
    const texData = texture.image.data;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const state = data[y * cols + x];
        
        texData[i] = 0;     // R
        texData[i + 1] = 0; // G
        texData[i + 2] = 0; // B
        
        // Alpha based on fog state
        if (state === 2) {
          texData[i + 3] = 0; // visible = transparent
        } else if (state === 1) {
          texData[i + 3] = Math.floor(opacityExplored * 255); // explored
        } else {
          texData[i + 3] = Math.floor(opacityHidden * 255); // hidden
        }
      }
    }

    texture.needsUpdate = true;
  }, [version, texture, raw, dims, opacityHidden, opacityExplored]);

  return (
    <mesh
      ref={meshRef}
      position={[0, 0.01, 0]} // slightly above ground to avoid z-fighting
      rotation={[-Math.PI / 2, 0, 0]} // flat on XZ plane
    >
      <planeGeometry args={[planeSize.width, planeSize.height]} />
      <primitive object={material} />
    </mesh>
  );
};

export default SyncedFogOverlay3D;