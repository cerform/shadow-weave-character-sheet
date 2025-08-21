/**
 * Безопасная асинхронная загрузка 3D моделей
 * Кэш, обработка ошибок, placeholder при отсутствии
 */

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

export interface LoadedModel {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  gltf: GLTF;
  path: string;
  loadTime: number;
}

export interface ModelLoadOptions {
  enableDraco?: boolean;
  timeout?: number;
  retries?: number;
  scale?: number;
  yOffset?: number;
}

export class ModelLoader {
  private loader: GLTFLoader;
  private dracoLoader?: DRACOLoader;
  private cache: Map<string, LoadedModel> = new Map();
  private loading: Map<string, Promise<LoadedModel>> = new Map();
  private failed: Set<string> = new Set();

  constructor(options: ModelLoadOptions = {}) {
    this.loader = new GLTFLoader();
    
    // Настройка DRACO декодера для сжатых моделей
    if (options.enableDraco !== false) {
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath('/draco/');
      this.loader.setDRACOLoader(this.dracoLoader);
    }
  }

  /**
   * Загрузка модели с кэшированием и обработкой ошибок
   */
  async loadModel(
    path: string, 
    options: ModelLoadOptions = {}
  ): Promise<LoadedModel | null> {
    // Проверяем кэш
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // Проверяем, не загружается ли уже
    if (this.loading.has(path)) {
      return this.loading.get(path)!;
    }

    // Проверяем, не была ли загрузка неудачной
    if (this.failed.has(path)) {
      console.warn(`🚫 Model ${path} previously failed to load`);
      return null;
    }

    // Создаем промис загрузки
    const loadPromise = this.performLoad(path, options);
    this.loading.set(path, loadPromise);

    try {
      const result = await loadPromise;
      this.cache.set(path, result);
      this.loading.delete(path);
      return result;
    } catch (error) {
      console.error(`🚫 Failed to load model ${path}:`, error);
      this.failed.add(path);
      this.loading.delete(path);
      return null;
    }
  }

  /**
   * Выполнение загрузки с настройками
   */
  private async performLoad(
    path: string, 
    options: ModelLoadOptions
  ): Promise<LoadedModel> {
    const startTime = Date.now();
    const timeout = options.timeout || 10000; // 10 секунд по умолчанию
    const retries = options.retries || 2;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const gltf = await this.loadWithTimeout(path, timeout);
        
        // Клонируем сцену для безопасного использования
        const scene = gltf.scene.clone();
        
        // Применяем настройки
        if (options.scale && options.scale !== 1) {
          scene.scale.setScalar(options.scale);
        }
        
        if (options.yOffset) {
          scene.position.y = options.yOffset;
        }

        // Настраиваем материалы и тени
        this.setupMaterials(scene);
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Model loaded: ${path} (${loadTime}ms)`);

        return {
          scene,
          animations: gltf.animations,
          gltf,
          path,
          loadTime,
        };
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        console.warn(`⚠️ Model load attempt ${attempt + 1} failed for ${path}, retrying...`);
        await this.delay(1000 * (attempt + 1)); // Экспоненциальная задержка
      }
    }

    throw new Error(`Failed to load ${path} after ${retries + 1} attempts`);
  }

  /**
   * Загрузка с таймаутом
   */
  private loadWithTimeout(path: string, timeout: number): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Loading timeout for ${path}`));
      }, timeout);

      this.loader.load(
        path,
        (gltf) => {
          clearTimeout(timer);
          resolve(gltf);
        },
        (progress) => {
          // Опционально: отслеживание прогресса
          console.log(`📦 Loading ${path}: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  /**
   * Настройка материалов и теней
   */
  private setupMaterials(scene: THREE.Group): void {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Включаем тени
        child.castShadow = true;
        child.receiveShadow = true;

        // Настраиваем материалы
        if (child.material instanceof THREE.Material) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Улучшаем качество материала
            child.material.envMapIntensity = 1;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }

  /**
   * Создание placeholder модели
   */
  createPlaceholder(
    color: string = '#696969',
    scale: number = 1,
    yOffset: number = 0
  ): LoadedModel {
    const geometry = new THREE.CapsuleGeometry(0.4 * scale, 1.2 * scale, 8, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      metalness: 0.1,
      roughness: 0.8,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yOffset;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const scene = new THREE.Group();
    scene.add(mesh);

    return {
      scene,
      animations: [],
      gltf: {} as GLTF, // Заглушка
      path: 'placeholder',
      loadTime: 0,
    };
  }

  /**
   * Предзагрузка списка моделей
   */
  async preloadModels(
    paths: string[], 
    options: ModelLoadOptions = {}
  ): Promise<(LoadedModel | null)[]> {
    console.log(`📦 Preloading ${paths.length} models...`);
    
    const promises = paths.map(path => this.loadModel(path, options));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Preloaded ${successful}/${paths.length} models`);
    
    return results.map(r => r.status === 'fulfilled' ? r.value : null);
  }

  /**
   * Получение модели из кэша
   */
  getCachedModel(path: string): LoadedModel | null {
    return this.cache.get(path) || null;
  }

  /**
   * Проверка, загружена ли модель
   */
  isModelLoaded(path: string): boolean {
    return this.cache.has(path);
  }

  /**
   * Проверка, не удалось ли загрузить модель
   */
  isModelFailed(path: string): boolean {
    return this.failed.has(path);
  }

  /**
   * Очистка кэша
   */
  clearCache(): void {
    // Освобождаем ресурсы
    for (const model of this.cache.values()) {
      this.disposeModel(model);
    }
    
    this.cache.clear();
    this.loading.clear();
    this.failed.clear();
  }

  /**
   * Удаление конкретной модели из кэша
   */
  removeFromCache(path: string): void {
    const model = this.cache.get(path);
    if (model) {
      this.disposeModel(model);
      this.cache.delete(path);
    }
    this.failed.delete(path);
  }

  /**
   * Освобождение ресурсов модели
   */
  private disposeModel(model: LoadedModel): void {
    model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Получение статистики
   */
  getStatistics(): {
    cached: number;
    loading: number;
    failed: number;
    memoryUsage: string;
  } {
    const memoryUsage = this.cache.size > 0 ? 
      `~${(this.cache.size * 0.5).toFixed(1)}MB` : '0MB';
    
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      failed: this.failed.size,
      memoryUsage,
    };
  }

  /**
   * Задержка для retry логики
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Уничтожение загрузчика
   */
  dispose(): void {
    this.clearCache();
    
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
  }
}