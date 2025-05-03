
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
  themeColor?: string;
  result?: number; // Добавляем возможность отображать результат
}

const SimpleDiceRenderer: React.FC<SimpleDiceRendererProps> = ({ type, size = 100, themeColor, result }) => {
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

    // Создаем сцену с улучшенными настройками
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      precision: 'highp',
      preserveDrawingBuffer: true
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // Улучшенное освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Добавляем задний свет для объемности
    const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
    backLight.position.set(-5, 3, -10);
    scene.add(backLight);

    // Создаем невидимую плоскость для теней
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -1.5;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const loader = new GLTFLoader();
    
    // Улучшенный запасной вариант для геометрии
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
          // Улучшаем геометрию d10
          geometry = new THREE.ConeGeometry(0.8, 1.6, 10); 
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
      
      // Улучшенный материал с более выразительными настройками
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(diceColor),
        emissive: new THREE.Color(secondaryColor),
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 1.0
      });
      
      const dice = new THREE.Mesh(geometry, material);
      dice.castShadow = true;
      dice.receiveShadow = true;
      scene.add(dice);
      return dice;
    };

    // Загружаем модель кубика с улучшенной обработкой ошибок
    let diceObject: THREE.Object3D | THREE.Mesh;
    
    try {
      loader.load(
        diceModels[type], 
        (gltf) => {
          const dice = gltf.scene;
          
          // Правильное позиционирование и масштабирование модели
          dice.scale.set(1, 1, 1);
          
          // Корректировка положения в зависимости от типа кубика
          if (type === 'd4') {
            dice.rotation.x = Math.PI / 6;  // Немного наклоняем d4
          } else if (type === 'd20') {
            dice.rotation.y = Math.PI / 5;  // Показываем грань с 20
          }
          
          dice.traverse((child: any) => {
            if (child.isMesh) {
              // Улучшенный материал для загруженных моделей
              child.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(diceColor),
                emissive: new THREE.Color(secondaryColor),
                metalness: 0.7,
                roughness: 0.3,
                envMapIntensity: 1.0
              });
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          scene.add(dice);
          diceObject = dice;
          
          // Позиционирование камеры в зависимости от размеров модели
          const box = new THREE.Box3().setFromObject(dice);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          camera.position.z = maxDim * 2.5;
          
          animate();
        },
        undefined,
        () => {
          console.warn("Не удалось загрузить модель кубика, используем запасной вариант");
          diceObject = createPlaceholder();
          camera.position.z = 3;
          animate();
        }
      );
    } catch (error) {
      console.error("Ошибка при загрузке модели кубика:", error);
      diceObject = createPlaceholder();
      camera.position.z = 3;
      animate();
    }

    // Улучшенная анимация с более плавным вращением
    function animate() {
      const animationId = requestAnimationFrame(animate);
      if (diceObject) {
        diceObject.rotation.y += 0.008;  // Более медленное вращение для лучшего просмотра
        diceObject.rotation.x += 0.003;
      }
      renderer.render(scene, camera);
      
      return animationId;
    }

    // Запускаем анимацию и сохраняем ID для очистки
    const animationId = animate();

    return () => {
      cancelAnimationFrame(animationId as number);
      renderer.dispose();
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, [type, diceColor, secondaryColor, size]);

  return (
    <div className="relative">
      <div 
        ref={mountRef} 
        className="aspect-square relative" 
        style={{ width: size, height: size }}
      />
      {result !== undefined && (
        <div 
          className="absolute bottom-1 left-0 w-full text-center font-bold py-1 px-2 rounded"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: diceColor,
            fontSize: `${size * 0.18}px`,
            textShadow: '0px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
};

export default SimpleDiceRenderer;
