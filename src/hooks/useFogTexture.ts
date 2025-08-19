import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFogOfWarStore } from "@/stores/fogOfWarStore";

/**
 * Создает CanvasTexture размера 2048x2048 для тумана войны.
 * Рисует черный фон с альфой и вырезает круги видимости через destination-out.
 */
export function useFogTexture() {
  const { visibleAreas, fogSettings } = useFogOfWarStore();
  
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 2048;
    return c;
  }, []);
  
  const ctx = useMemo(() => canvas.getContext("2d")!, [canvas]);
  const texRef = useRef(new THREE.CanvasTexture(canvas));

  useEffect(() => {
    if (!fogSettings.enabled) return;
    
    const WORLD_SIZE = 50; // размер мира в юнитах
    const toUV = (x: number, z: number) => ({
      u: ((x + WORLD_SIZE/2) / WORLD_SIZE) * canvas.width,
      v: ((z + WORLD_SIZE/2) / WORLD_SIZE) * canvas.height,
    });

    // Очищаем и рисуем черный фон с альфой
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(0, 0, 0, ${fogSettings.fogOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Вырезаем видимые области через destination-out
    ctx.globalCompositeOperation = "destination-out";
    visibleAreas.forEach(area => {
      if (area.type === 'circle') {
        const { u: ux, v: vz } = toUV(area.x - WORLD_SIZE/2, area.y - WORLD_SIZE/2);
        const r = (area.radius / WORLD_SIZE) * canvas.width;
        
        // Создаем мягкий градиент для плавного края
        const gradient = ctx.createRadialGradient(ux, vz, 0, ux, vz, r);
        gradient.addColorStop(0, "rgba(0,0,0,1)");
        gradient.addColorStop(0.7, "rgba(0,0,0,1)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        
        // Рисуем круг с градиентом
        ctx.beginPath();
        ctx.arc(ux, vz, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    });

    texRef.current.needsUpdate = true;
  }, [canvas, ctx, visibleAreas, fogSettings]);

  return texRef.current;
}