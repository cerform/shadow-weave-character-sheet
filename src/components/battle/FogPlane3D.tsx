import * as THREE from "three";
import { useMemo } from "react";
import { useFogOfWarStore } from "@/stores/fogOfWarStore";

interface FogPlane3DProps {
  alphaTex: THREE.Texture;
}

export default function FogPlane3D({ alphaTex }: FogPlane3DProps) {
  const { fogSettings } = useFogOfWarStore();
  const size = 50;

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: fogSettings.fogOpacity,
      alphaMap: alphaTex,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    
    mat.alphaMap.wrapS = mat.alphaMap.wrapT = THREE.ClampToEdgeWrapping;
    mat.alphaMap.minFilter = THREE.LinearFilter;
    mat.alphaMap.magFilter = THREE.LinearFilter;
    
    return mat;
  }, [alphaTex, fogSettings.fogOpacity]);

  if (!fogSettings.enabled) {
    return null;
  }

  return (
    <mesh 
      rotation-x={-Math.PI / 2} 
      position={[0, 0.02, 0]}
      renderOrder={1000}
    >
      <planeGeometry args={[size, size, 1, 1]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}