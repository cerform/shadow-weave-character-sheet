
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Fix import path for GLTFLoader
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const diceModels = {
  d4: '/models/dice/d4.glb',
  d6: '/models/dice/d6.glb',
  d8: '/models/dice/d8.glb',
  d10: '/models/dice/d10.glb',
  d12: '/models/dice/d12.glb',
  d20: '/models/dice/d20.glb'
};

interface SimpleDiceRendererProps {
  type: keyof typeof diceModels; // d4, d6, d8, d10, d12, d20
  size?: number;
  themeColor?: string; // Added themeColor prop for consistency
}

const SimpleDiceRenderer: React.FC<SimpleDiceRendererProps> = ({ type, size = 100, themeColor }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Use provided themeColor or fallback to theme.accent
  const diceColor = themeColor || currentTheme.accent || '#ffffff';
  
  // Create a secondary color for gradient effect (slightly darker)
  const secondaryColor = new THREE.Color(diceColor).multiplyScalar(0.8).getHexString();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    mount.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(light);
    
    // Add directional light for better definition
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(0, 10, 10);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    
    // Use placeholder geometry if model fails to load
    const createPlaceholder = () => {
      let geometry;
      
      switch (type) {
        case 'd4':
          geometry = new THREE.TetrahedronGeometry(1, 0);
          break;
        case 'd6':
          geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 'd8':
          geometry = new THREE.OctahedronGeometry(1, 0);
          break;
        case 'd10':
          geometry = new THREE.ConeGeometry(0.8, 2, 10);
          break;
        case 'd12':
          geometry = new THREE.DodecahedronGeometry(1, 0);
          break;
        case 'd20':
          geometry = new THREE.IcosahedronGeometry(1, 0);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(diceColor),
        emissive: new THREE.Color(secondaryColor),
        metalness: 0.5,
        roughness: 0.3,
      });
      
      const dice = new THREE.Mesh(geometry, material);
      scene.add(dice);
      return dice;
    };

    // Try to load model, fallback to placeholder if needed
    let diceObject: THREE.Object3D | THREE.Mesh;
    
    try {
      loader.load(
        diceModels[type], 
        (gltf) => {
          const dice = gltf.scene;
          
          dice.traverse((child: any) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(diceColor),
                emissive: new THREE.Color(secondaryColor),
                metalness: 0.5,
                roughness: 0.3,
              });
            }
          });
          
          scene.add(dice);
          diceObject = dice;
          
          // Position camera based on model size
          const box = new THREE.Box3().setFromObject(dice);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2.5;
          
          animate();
        },
        undefined,
        () => {
          // Error loading model, use placeholder
          diceObject = createPlaceholder();
          camera.position.z = 3;
          animate();
        }
      );
    } catch (error) {
      console.error("Failed to load dice model:", error);
      diceObject = createPlaceholder();
      camera.position.z = 3;
      animate();
    }

    // Define the animation function before using it
    function animate() {
      const animationId = requestAnimationFrame(animate);
      if (diceObject) {
        diceObject.rotation.y += 0.01;
        diceObject.rotation.x += 0.005;
      }
      renderer.render(scene, camera);
      
      // Return the animation ID for cleanup
      return animationId;
    }

    // Start animation and store the return value for cleanup
    const animationId = animate();

    return () => {
      // Fix type by using explicit type conversion
      cancelAnimationFrame(animationId as number);
      renderer.dispose();
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, [type, diceColor, secondaryColor, size]);

  return (
    <div 
      ref={mountRef} 
      className="aspect-square relative" 
      style={{ width: size, height: size }}
    />
  );
};

export default SimpleDiceRenderer;
