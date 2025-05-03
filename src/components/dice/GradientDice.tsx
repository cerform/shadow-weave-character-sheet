
import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface GradientDiceProps {
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  size?: number;
  rolling?: boolean;
  result?: number | null;
  showNumber?: boolean;
  color1?: string;
  color2?: string;
}

// Компонент 3D-кубика с градиентом
const Dice3D = ({ 
  diceType, 
  rolling, 
  result, 
  showNumber,
  color1 = "#9b87f5",
  color2 = "#d946ef"
}: {
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  rolling?: boolean;
  result?: number | null;
  showNumber?: boolean;
  color1?: string;
  color2?: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  // Создаем градиентный материал
  const gradientMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      void main() {
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 0.9);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  // Получаем геометрию для выбранного типа кубика
  const getDiceGeometry = () => {
    switch (diceType) {
      case 'd4':
        return new THREE.TetrahedronGeometry(1, 0);
      case 'd6':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'd8':
        return new THREE.OctahedronGeometry(1, 0);
      case 'd10':
        // Используем додекаэдр для d10 как приближение
        return new THREE.DodecahedronGeometry(1, 0);
      case 'd12':
        return new THREE.DodecahedronGeometry(1, 0);
      case 'd20':
        return new THREE.IcosahedronGeometry(1, 0);
      default:
        return new THREE.IcosahedronGeometry(1, 0);
    }
  };
  
  // Получаем число граней для выбранного типа кубика
  const getFacesCount = () => {
    switch (diceType) {
      case 'd4': return 4;
      case 'd6': return 6;
      case 'd8': return 8;
      case 'd10': return 10;
      case 'd12': return 12;
      case 'd20': return 20;
      default: return 20;
    }
  };
  
  // Генерация случайного вращения для анимации
  useEffect(() => {
    if (rolling) {
      const rollInterval = setInterval(() => {
        setRotation({
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        });
      }, 100);
      
      // Останавливаем анимацию через 800мс
      setTimeout(() => {
        clearInterval(rollInterval);
      }, 800);
    }
  }, [rolling]);
  
  // Создаем позиции для текста на гранях
  const getFacePositions = () => {
    switch (diceType) {
      case 'd4':
        return [
          [0, 0.7, 0],
          [0.7, -0.3, 0],
          [-0.3, -0.3, 0.6],
          [-0.3, -0.3, -0.6]
        ];
      case 'd6':
        return [
          [0, 0, 0.51],  // front
          [0.51, 0, 0],  // right
          [0, 0, -0.51], // back
          [-0.51, 0, 0], // left
          [0, 0.51, 0],  // top
          [0, -0.51, 0]  // bottom
        ];
      case 'd8':
        // Генерируем позиции для восьмигранника
        return Array.from({ length: 8 }, (_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 8);
          const theta = Math.sqrt(8 * Math.PI) * phi;
          return [
            0.7 * Math.cos(theta) * Math.sin(phi),
            0.7 * Math.sin(theta) * Math.sin(phi),
            0.7 * Math.cos(phi)
          ];
        });
      case 'd10':
      case 'd12':
      case 'd20':
        // Для многогранных кубиков генерируем позиции равномерно по сфере
        const facesCount = getFacesCount();
        return Array.from({ length: facesCount }, (_, i) => {
          const y = 1 - (i / (facesCount - 1)) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = ((i % (facesCount / 2)) / (facesCount / 2)) * Math.PI * 2;
          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          return [x * 0.7, y * 0.7, z * 0.7];
        });
      default:
        return [];
    }
  };

  return (
    <group rotation={[rotation.x, rotation.y, rotation.z]}>
      <mesh ref={meshRef} material={gradientMaterial}>
        <primitive object={getDiceGeometry()} attach="geometry" />
      </mesh>
      
      {/* Отображение числа в центре, если есть результат */}
      {result !== null && showNumber && !rolling && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {result}
        </Text>
      )}
      
      {/* Числа на гранях (опционально) */}
      {/* 
      {!rolling && getFacePositions().map((position, i) => (
        <Text
          key={i}
          position={position}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {i + 1}
        </Text>
      ))}
      */}
    </group>
  );
};

const GradientDice: React.FC<GradientDiceProps> = ({
  diceType,
  size = 120,
  rolling = false,
  result = null,
  showNumber = true,
  color1 = "#9b87f5",
  color2 = "#d946ef"
}) => {
  return (
    <div 
      className="dice-wrapper" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        perspective: '1000px',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <Canvas shadows>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <Environment preset="city" />
        
        <Dice3D 
          diceType={diceType}
          rolling={rolling}
          result={result}
          showNumber={showNumber}
          color1={color1}
          color2={color2}
        />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          autoRotate={!rolling && !result}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
};

export default GradientDice;
