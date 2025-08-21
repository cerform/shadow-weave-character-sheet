// Система обработки ввода мыши
import * as THREE from 'three';

export interface MouseState {
  isDown: boolean;
  isDragging: boolean;
  position: { x: number; y: number };
  normalizedPosition: { x: number; y: number };
  worldPosition: { x: number; z: number } | null;
}

export class MouseInputSystem {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;
  private mouseState: MouseState = {
    isDown: false,
    isDragging: false,
    position: { x: 0, y: 0 },
    normalizedPosition: { x: 0, y: 0 },
    worldPosition: null
  };
  private listeners: Set<(state: MouseState) => void> = new Set();

  constructor(canvas: HTMLCanvasElement, camera: THREE.Camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.mouseState.isDown = true;
    this.mouseState.isDragging = false;
    this.updateMousePosition(e);
    this.notifyListeners();
  }

  private handleMouseMove(e: MouseEvent) {
    if (this.mouseState.isDown) {
      this.mouseState.isDragging = true;
    }
    this.updateMousePosition(e);
    this.notifyListeners();
  }

  private handleMouseUp(e: MouseEvent) {
    this.mouseState.isDown = false;
    this.mouseState.isDragging = false;
    this.updateMousePosition(e);
    this.notifyListeners();
  }

  private handleMouseLeave() {
    this.mouseState.isDown = false;
    this.mouseState.isDragging = false;
    this.notifyListeners();
  }

  private updateMousePosition(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Пиксельные координаты
    this.mouseState.position.x = e.clientX - rect.left;
    this.mouseState.position.y = e.clientY - rect.top;
    
    // Нормализованные координаты для Three.js (-1 до 1)
    this.mouseState.normalizedPosition.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseState.normalizedPosition.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    
    // Мировые координаты (пересечение с плоскостью y=0)
    this.mouseState.worldPosition = this.getWorldPosition(
      this.mouseState.normalizedPosition.x,
      this.mouseState.normalizedPosition.y
    );
  }

  private getWorldPosition(mouseX: number, mouseY: number): { x: number; z: number } | null {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
    
    // Пересечение с плоскостью карты (y = 0)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    
    if (intersectionPoint) {
      return { x: intersectionPoint.x, z: intersectionPoint.z };
    }
    
    return null;
  }

  getMouseState(): MouseState {
    return { ...this.mouseState };
  }

  subscribe(listener: (state: MouseState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.mouseState));
  }

  dispose() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.listeners.clear();
  }
}