import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useWorldStore } from "@/stores/worldStore";

export default function StudGrid() {
  const { camera, gl, scene } = useThree();
  const { studs, mode, placeAt, removeAt, canPlace, rotateCW, currentHeight } = useWorldStore();
  const planeRef = useRef<THREE.Mesh>(null);

  // Создаем сетку
  const plane = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, 50, 50);
    const mat = new THREE.MeshBasicMaterial({ 
      color: "#374151", 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI/2;
    mesh.position.y = 0;
    mesh.name = "stud-grid";
    mesh.visible = true;
    return mesh;
  }, []);

  // Добавляем в сцену
  useMemo(() => { 
    scene.add(plane); 
    return () => scene.remove(plane); 
  }, [plane, scene]);

  // Обработка кликов
  useMemo(() => {
    const rc = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      rc.setFromCamera(mouse, camera);
      const hits = rc.intersectObject(plane, false);
      
      if (hits.length === 0) return;
      
      const hit = hits[0];
      const p = hit.point;
      
      // Привязка к сетке
      const x = Math.round(p.x / studs);
      const z = Math.round(p.z / studs);
      const y = currentHeight;

      if (e.button === 0) {          // ЛКМ
        if (mode === "place" && canPlace(x, y, z)) {
          placeAt(x, y, z);
        } else if (mode === "remove") {
          removeAt(x, y, z);
        }
      } else if (e.button === 2) {   // ПКМ - поворот
        rotateCW();
      }
    };

    const contextHandler = (e: MouseEvent) => e.preventDefault();
    
    gl.domElement.addEventListener("mousedown", handler);
    gl.domElement.addEventListener("contextmenu", contextHandler);
    
    return () => {
      gl.domElement.removeEventListener("mousedown", handler);
      gl.domElement.removeEventListener("contextmenu", contextHandler);
    };
  }, [gl, camera, plane, studs, mode, placeAt, removeAt, canPlace, rotateCW, currentHeight]);

  return null;
}