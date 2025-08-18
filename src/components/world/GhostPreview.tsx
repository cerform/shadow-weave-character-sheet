import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useState } from "react";
import { useWorldStore } from "@/stores/worldStore";

export default function GhostPreview() {
  const { camera, gl, scene } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const { studs, activeRot, canPlace, currentHeight, activeType, mode } = useWorldStore();
  const [ghostPosition, setGhostPosition] = useState<[number, number, number] | null>(null);
  const [isValid, setIsValid] = useState(true);

  useFrame(() => {
    if (mode !== "place" || !meshRef.current) return;

    // Получаем позицию мыши
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    
    // Используем последние координаты мыши если они есть
    if ((gl.domElement as any)._lastMouseX !== undefined) {
      mouse.x = (gl.domElement as any)._lastMouseX;
      mouse.y = (gl.domElement as any)._lastMouseY;
    } else {
      return;
    }

    const rc = new THREE.Raycaster();
    rc.setFromCamera(mouse, camera);
    
    const grid = scene.getObjectByName("stud-grid");
    if (!grid) return;
    
    const hits = rc.intersectObject(grid, false);
    if (hits.length === 0) {
      setGhostPosition(null);
      return;
    }

    const hit = hits[0];
    const p = hit.point;
    
    // Привязка к сетке
    const x = Math.round(p.x / studs);
    const z = Math.round(p.z / studs);
    const y = currentHeight;
    
    const valid = canPlace(x, y, z);
    setIsValid(valid);
    setGhostPosition([x, y, z]);
  });

  // Отслеживаем движение мыши
  useState(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      (gl.domElement as any)._lastMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      (gl.domElement as any)._lastMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    return () => gl.domElement.removeEventListener("mousemove", handleMouseMove);
  });

  if (!ghostPosition || mode !== "place") return null;

  // Определяем геометрию и позицию в зависимости от типа блока
  const getGeometryAndPosition = (type: string, pos: [number, number, number]) => {
    const [x, y, z] = pos;
    switch (type) {
      case "wall":
        return { args: [1, 1, 1], position: [x, y + 0.5, z] };
      case "floor":
        return { args: [1, 0.2, 1], position: [x, y + 0.1, z] };
      case "pillar":
        return { args: [0.8, 2, 0.8], position: [x, y + 1, z] };
      case "stairs":
        return { args: [1, 0.5, 1], position: [x, y + 0.25, z] };
      case "roof":
        return { args: [1, 0.3, 1], position: [x, y + 0.15, z] };
      case "prop":
        return { args: [0.6, 0.6, 0.6], position: [x, y + 0.3, z] };
      default:
        return { args: [1, 1, 1], position: [x, y + 0.5, z] };
    }
  };

  const { args, position } = getGeometryAndPosition(activeType, ghostPosition);

  return (
    <mesh 
      ref={meshRef} 
      position={position as [number, number, number]} 
      rotation={[0, (activeRot * Math.PI) / 180, 0]}
    >
      <boxGeometry args={args as [number, number, number]} />
      <meshStandardMaterial 
        color={isValid ? "#22c55e" : "#ef4444"} 
        transparent 
        opacity={0.5} 
      />
    </mesh>
  );
}