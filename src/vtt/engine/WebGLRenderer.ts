// src/vtt/engine/WebGLRenderer.ts
import * as THREE from "three";

export class WebGLRendererCore {
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;

  width: number = 0;
  height: number = 0;
  pixelRatio: number = window.devicePixelRatio || 1;

  isRunning: boolean = false;
  lastFrame: number = 0;

  // future post-processing
  passes: Array<(dt: number) => void> = [];

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) {
      throw new Error("WebGLRendererCore: Canvas element must be provided");
    }

    this.canvas = canvas;

    // SCENE
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // CAMERA (BG3 uses orthographic for tactical view)
    this.camera = new THREE.OrthographicCamera(
      -1, 1, 1, -1, 0.1, 2000
    );
    this.camera.position.set(0, 0, 500);

    // RENDERER
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    // set initial size
    this.setSize(window.innerWidth, window.innerHeight);

    // Handle resize
    window.addEventListener("resize", () => this.handleResize());
  }

  /** Set renderer & camera size */
  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;

    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height, false);

    const aspect = this.width / this.height;
    const d = 500; // world size

    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
  }

  /** On window resize */
  handleResize() {
    this.setSize(window.innerWidth, window.innerHeight);
  }

  /** Add object to scene */
  add(obj: THREE.Object3D) {
    this.scene.add(obj);
  }

  /** Remove object */
  remove(obj: THREE.Object3D) {
    this.scene.remove(obj);
  }

  /** Add render pass (fog, light, glow...) */
  addPass(pass: (dt: number) => void) {
    this.passes.push(pass);
  }

  /** Main render loop */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrame = performance.now();

    const loop = (t: number) => {
      if (!this.isRunning) return;

      const dt = (t - this.lastFrame) / 1000;
      this.lastFrame = t;

      // Update passes (fog, lights, effects)
      for (const p of this.passes) p(dt);

      // Render the main scene
      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  /** Stop render loop */
  stop() {
    this.isRunning = false;
  }

  /** Destroy renderer */
  dispose() {
    this.stop();
    window.removeEventListener("resize", () => this.handleResize());
    this.renderer.dispose();
    this.scene.clear();
  }
}
