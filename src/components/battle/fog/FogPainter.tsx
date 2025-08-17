// /src/components/battle/fog/FogPainter.tsx
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrthographicCamera, PlaneGeometry, Mesh, WebGLRenderTarget, Scene, Vector2, AdditiveBlending } from "three";
import { createRadialRevealMaterial } from "./shaders/RadialRevealMaterial";

/**
 * Minimal DM brush to REVEAL/HIDE areas by painting into the mask render target.
 * Shift = reveal (white). Alt = hide (paint black by rendering an inverse circle).
 */
export function useFogPainter(
  params: {
    enabled: boolean;
    renderer: THREE.WebGLRenderer | null;
    maskTarget: WebGLRenderTarget | null;
    mapSize: Vector2;
    mapCenter: THREE.Vector3;
    brushRadius: number;
  }
){
  const { enabled, renderer, maskTarget, mapSize, mapCenter, brushRadius } = params;
  const paintScene = useMemo(() => new Scene(), []);
  const cam = useMemo(() => new OrthographicCamera(-mapSize.x/2, mapSize.x/2, mapSize.y/2, -mapSize.y/2, 0.1, 10), [mapSize]);
  const quadGeo = useMemo(() => new PlaneGeometry(1,1), []);
  const revealMat = useMemo(() => createRadialRevealMaterial(0xffffff, 0.75, 1.0), []);
  const hideMat = useMemo(() => createRadialRevealMaterial(0x000000, 0.75, 1.0), []);
  const brush = useRef<Mesh>(new Mesh(quadGeo, revealMat));

  useEffect(() => {
    brush.current.renderOrder = 10;
    (brush.current.material as any).blending = AdditiveBlending;
    paintScene.add(brush.current);
    return () => { paintScene.remove(brush.current); };
  }, [paintScene]);

  useEffect(() => {
    function onPointer(event: PointerEvent){
      if(!enabled || !renderer || !maskTarget) return;
      if (!(event.buttons & 1)) return; // Only if left mouse button is pressed
      
      // Prevent default to avoid interfering with other controls
      event.preventDefault();
      event.stopPropagation();
      
      const canvas = renderer.domElement;
      // get NDC
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      // project to world on map plane (y = mapCenter.y)
      // we assume top‑down ortho projection during mask rendering, so map NDC to world directly
      const worldX = (x * 0.5 + 0.5) * mapSize.x - mapSize.x/2 + mapCenter.x;
      const worldZ = (y * 0.5 + 0.5) * mapSize.y - mapSize.y/2 + mapCenter.z;

      brush.current.position.set(worldX, 0, worldZ);
      brush.current.scale.setScalar(brushRadius * 2);
      brush.current.material = event.shiftKey ? revealMat : (event.altKey ? hideMat : revealMat);

      const oldTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(maskTarget);
      renderer.setClearColor(0x000000, 1);
      renderer.clear(true, true, false);
      // additive brush for reveal, to hide we actually blend black — in practice to "hide" we clear & redraw everything.
      renderer.render(paintScene, cam);
      renderer.setRenderTarget(oldTarget);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Shift' || event.key === 'Alt') {
        event.preventDefault();
      }
    }

    // Only attach to canvas element, not window, to avoid interfering with camera controls
    const canvas = renderer?.domElement;
    if (canvas && enabled) {
      canvas.addEventListener('pointerdown', onPointer, { passive: false });
      canvas.addEventListener('pointermove', onPointer, { passive: false });
      window.addEventListener('keydown', onKeyDown);
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener('pointerdown', onPointer);
        canvas.removeEventListener('pointermove', onPointer);
        window.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [enabled, renderer, maskTarget, mapSize, mapCenter, brushRadius, paintScene, cam, revealMat, hideMat]);
}