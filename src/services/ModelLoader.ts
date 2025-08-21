import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group, AnimationMixer } from "three";
import * as THREE from 'three';
import { LoadedModel } from "@/types/Monster";

const loader = new GLTFLoader();

export async function loadGLB(url: string): Promise<LoadedModel> {
  try {
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene as Group;
    let mixer: AnimationMixer | undefined;
    let actions: Record<string, THREE.AnimationAction> | undefined;

    // Настройка анимаций если они есть
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new AnimationMixer(root);
      actions = {};
      
      for (const clip of gltf.animations) {
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;
      }
    }

    // Настраиваем тени для всех мешей
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).receiveShadow = true;
      }
    });

    return { root, mixer, actions };
  } catch (error) {
    console.error(`Failed to load model from ${url}:`, error);
    
    // Fallback к простой геометрии
    const fallbackGroup = new Group();
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: '#6b7280',
      metalness: 0.1,
      roughness: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    fallbackGroup.add(mesh);
    
    return { root: fallbackGroup };
  }
}

export function playAnimation(loaded: LoadedModel, animationName: string, fadeInDuration = 0.2) {
  if (!loaded.actions || !loaded.actions[animationName]) {
    return;
  }

  // Останавливаем все текущие анимации
  Object.values(loaded.actions).forEach(action => {
    action.fadeOut(fadeInDuration);
  });

  // Запускаем новую анимацию
  const action = loaded.actions[animationName];
  action.reset().fadeIn(fadeInDuration).play();
}

export function playIfExists(loaded: LoadedModel, animationName: string) {
  if (loaded.actions && loaded.actions[animationName]) {
    playAnimation(loaded, animationName);
  }
}