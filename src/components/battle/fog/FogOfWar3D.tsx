// /src/components/battle/fog/FogOfWar3D.tsx
import * as React from "react";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { createFogCompositeMaterial } from "./shaders/FogCompositeMaterial";
import { createRadialRevealMaterial } from "./shaders/RadialRevealMaterial";
import { FogOfWarProps, VisionSource } from "./types";
import { useFogPainter } from "./FogPainter";

// Basic LOS helper — cast N rays and build a triangle fan polygon mesh (optional)
function buildVisibilityMesh(source: VisionSource, occluders: THREE.Mesh[], raycaster: THREE.Raycaster, segments = 128){
  const angleStep = (Math.PI * 2) / segments;
  const points: THREE.Vector2[] = [];
  const origin = new THREE.Vector3(source.position.x, source.position.y, source.position.z);
  const up = new THREE.Vector3(0,1,0);
  const maxDist = source.radius;

  for(let i=0;i<segments;i++){
    const angle = i * angleStep;
    const dir = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    raycaster.set(origin.clone().add(up.clone().multiplyScalar(0.1)), dir);
    const intersects = raycaster.intersectObjects(occluders, true);
    let dist = maxDist;
    if(intersects.length > 0){
      const t = intersects[0];
      const d = t.distance;
      if(d < maxDist) dist = d;
    }
    const px = source.position.x + Math.cos(angle) * dist;
    const pz = source.position.z + Math.sin(angle) * dist;
    points.push(new THREE.Vector2(px, pz));
  }

  const shape = new THREE.Shape(points);
  const geom = new THREE.ShapeGeometry(shape);
  return geom;
}

export function FogOfWar3D(props: FogOfWarProps){
  const {
    mapSize,
    mapCenter = new THREE.Vector3(0,0,0),
    visionSources,
    occluders = [],
    fogColor = 0x0b0e14,
    density = 0.9,
    maskResolution = { width: 1024, height: 1024 },
    enableDMPaint = true,
    brushRadius = 2,
    debugMask = false,
  } = props;

  const { gl } = useThree();
  const orthoCam = useMemo(() => new THREE.OrthographicCamera(-mapSize.x/2, mapSize.x/2, mapSize.y/2, -mapSize.y/2, 0.1, 50), [mapSize]);
  const maskScene = useMemo(() => new THREE.Scene(), []);
  const maskTarget = useMemo(() => new THREE.WebGLRenderTarget(maskResolution.width, maskResolution.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
  }), [maskResolution.width, maskResolution.height]);

  // Circle brush for each source (no‑LOS). We'll swap to polygon if occluders provided.
  const brushGeo = useMemo(() => new THREE.PlaneGeometry(1,1), []);
  const brushMat = useMemo(() => createRadialRevealMaterial(0xffffff, 0.7, 1.0), []);

  // Prepare per‑source meshes for mask rendering
  const sourceMeshes = useMemo(() => 
    visionSources.map(() => new THREE.Mesh(brushGeo, brushMat)),
  [visionSources.length, brushGeo, brushMat]);

  // LOS raycaster
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Add all brushes to mask scene once
  React.useEffect(() => {
    sourceMeshes.forEach(m => maskScene.add(m));
    return () => { sourceMeshes.forEach(m => maskScene.remove(m)); };
  }, [maskScene, sourceMeshes]);

  // Fog composite plane (drawn in main scene)
  const fogPlane = useRef<THREE.Mesh>(null);
  const fogMat = useMemo(() => createFogCompositeMaterial(), []);
  React.useEffect(() => {
    (fogMat.uniforms.uFogColor.value as THREE.Color).set(fogColor as any);
    fogMat.uniforms.uDensity.value = density;
    fogMat.uniforms.uResolution.value.set(maskResolution.width, maskResolution.height);
    fogMat.uniforms.uMapSize.value.set(mapSize.x, mapSize.y);
  }, [fogMat, fogColor, density, maskResolution.width, maskResolution.height, mapSize.x, mapSize.y]);

  // DM paint hook
  useFogPainter({
    enabled: enableDMPaint,
    renderer: gl,
    maskTarget,
    mapSize,
    mapCenter,
    brushRadius,
  });

  // A helper scene clear (black = fog)
  const clearColor = new THREE.Color(0x000000);

  useFrame((state, dt) => {
    // 1) REBUILD MASK each frame (sources + optional LOS)
    const oldBg = maskScene.background as THREE.Color | null;
    maskScene.background = clearColor; // black background

    // Position/update vision meshes
    for(let i = 0; i < visionSources.length; i++){
      const src = visionSources[i];
      const m = sourceMeshes[i];
      if(!m) continue;

      // If LOS and occluders exist, build polygon geometry, else use radial plane
      if(occluders.length > 0){
        const geom = buildVisibilityMesh(src, occluders, raycaster, 128);
        m.geometry.dispose();
        m.geometry = geom as any; // rendered face‑on in ortho; no need to rotate
        (m.material as any).uniforms = undefined; // using the same material is fine (alpha is from shader)
      } else {
        // circle brush centered at source
        if (m.geometry !== brushGeo) {
          m.geometry.dispose();
          m.geometry = brushGeo.clone();
        }
        m.position.set(src.position.x, 0, src.position.z);
        m.scale.setScalar(src.radius * 2);
      }
    }

    // Render into mask target (top‑down)
    const oldTarget = gl.getRenderTarget();
    gl.setRenderTarget(maskTarget);
    gl.clearColor();
    gl.clear(true, true, true);
    gl.render(maskScene, orthoCam);
    gl.setRenderTarget(oldTarget);

    // 2) Update fog shader uniforms
    fogMat.uniforms.uMask.value = maskTarget.texture;
    fogMat.uniforms.uTime.value += dt;
  });

  // Main fog mesh — a big plane over the map (slightly above ground to avoid z‑fight)
  return (
    <group>
      <mesh ref={fogPlane} position={[mapCenter.x, mapCenter.y + 0.05, mapCenter.z]} rotation-x={-Math.PI/2}>
        <planeGeometry args={[mapSize.x, mapSize.y, 1, 1]} />
        <primitive object={fogMat} attach="material" />
      </mesh>

      {debugMask && (
        // small quad in the corner to preview the mask
        <mesh position={[mapCenter.x - mapSize.x/2 + 8, mapCenter.y + 0.1, mapCenter.z - mapSize.y/2 + 8]} rotation-x={-Math.PI/2}>
          <planeGeometry args={[16, 16]} />
          {/* Basic material to display the mask texture */}
          <meshBasicMaterial map={maskTarget.texture} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

export default FogOfWar3D;