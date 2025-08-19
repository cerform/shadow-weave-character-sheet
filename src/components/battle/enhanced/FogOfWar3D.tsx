import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

interface FogOfWar3DProps {
  mapSize?: { width: number; height: number };
}

export const FogOfWar3D: React.FC<FogOfWar3DProps> = ({ 
  mapSize = { width: 50, height: 50 } 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { fogEnabled, fogMode } = useEnhancedBattleStore();
  
  // Создаем геометрию частиц для облаков тумана
  const { geometry, material } = useMemo(() => {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    
    // Позиции частиц
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Распределяем частицы по карте
      positions[i * 3] = (Math.random() - 0.5) * mapSize.width;
      positions[i * 3 + 1] = Math.random() * 3 + 0.5; // Высота тумана
      positions[i * 3 + 2] = (Math.random() - 0.5) * mapSize.height;
      
      scales[i] = Math.random() * 2 + 1;
      opacities[i] = Math.random() * 0.8 + 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    
    // Создаем текстуру облака
    const canvas = document.createElement('canvas');
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    
    // Рисуем градиентное облако
    const gradient = context.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    // Материал для частиц
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: 1.0 },
        uColor: { value: new THREE.Color(0.7, 0.7, 0.8) }
      },
      vertexShader: `
        attribute float scale;
        attribute float opacity;
        varying vec2 vUv;
        varying float vOpacity;
        uniform float uTime;
        
        void main() {
          vUv = uv;
          vOpacity = opacity;
          
          vec3 pos = position;
          
          // Добавляем легкое движение тумана
          pos.x += sin(uTime * 0.5 + position.y * 0.1) * 0.5;
          pos.z += cos(uTime * 0.3 + position.x * 0.1) * 0.3;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = scale * 100.0 / length(mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying float vOpacity;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          vec4 texColor = texture2D(uTexture, gl_PointCoord);
          
          // Создаем мягкие облачные края
          float dist = length(center);
          float alpha = texColor.a * vOpacity * uOpacity * (1.0 - dist * 2.0);
          alpha = smoothstep(0.0, 0.5, alpha);
          
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    return { geometry, material };
  }, [mapSize]);
  
  // Создаем волюметрический туман
  const volumetricFog = useMemo(() => {
    const fogGeometry = new THREE.PlaneGeometry(mapSize.width, mapSize.height, 32, 32);
    
    const fogMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.6 },
        uNoiseScale: { value: 0.1 },
        uColor: { value: new THREE.Color(0.2, 0.2, 0.3) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        
        // Simplex noise function
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 mod289(vec4 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec4 permute(vec4 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Добавляем волны к геометрии
          vec3 pos = position;
          float noise = snoise(vec3(pos.xz * 0.1, uTime * 0.2)) * 0.5;
          pos.y += noise;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform float uNoiseScale;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Same noise function as in vertex shader (simplified)
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          vec2 st = vUv * 5.0; // Reduced scale for larger fog patterns
          
          // Создаем многослойный шум
          float n = 0.0;
          n += 0.4 * noise(st + uTime * 0.05); // Slower movement
          n += 0.2 * noise(st * 2.0 + uTime * 0.08);
          n += 0.1 * noise(st * 4.0 + uTime * 0.1);
          
          // Создаем более мягкие края
          float dist = distance(vUv, vec2(0.5));
          float edge = smoothstep(0.2, 0.6, dist); // Softer edges
          
          float alpha = n * uOpacity * 0.6 * (1.0 - edge); // Reduced base opacity
          alpha = clamp(alpha, 0.0, 0.8); // Maximum alpha capped at 0.8
          
          // Make fog more visible with better color
          vec3 fogColor = mix(uColor, vec3(0.4, 0.4, 0.6), n); // Add some variation
          
          gl_FragColor = vec4(fogColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
    fogMesh.rotation.x = -Math.PI / 2;
    fogMesh.position.y = 0.1;
    
    return fogMesh;
  }, [mapSize]);
  
  // Анимация тумана
  useFrame((state) => {
    if (!fogEnabled) return;
    
    const time = state.clock.elapsedTime;
    
    // Анимируем частицы
    if (material.uniforms && material.uniforms.uTime) {
      material.uniforms.uTime.value = time;
    }
    
    // Анимируем волюметрический туман
    if (volumetricFog.material.uniforms && volumetricFog.material.uniforms.uTime) {
      volumetricFog.material.uniforms.uTime.value = time;
    }
    
    // Вращаем группу частиц очень медленно
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.01;
    }
  });
  
  // Обновляем видимость тумана
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.visible = fogEnabled;
    }
    
    if (material.uniforms && material.uniforms.uOpacity) {
      material.uniforms.uOpacity.value = fogEnabled ? 1.0 : 0.0;
    }
    
    if (volumetricFog.material.uniforms && volumetricFog.material.uniforms.uOpacity) {
      volumetricFog.material.uniforms.uOpacity.value = fogEnabled ? 0.7 : 0.0; // Increased visibility
    }
  }, [fogEnabled, material, volumetricFog]);
  
  // Обновляем цвет тумана в зависимости от режима
  useEffect(() => {
    if (material.uniforms && material.uniforms.uColor) {
      const color = fogMode === 'reveal' 
        ? new THREE.Color(0.2, 0.4, 0.8) // More visible blue when revealing
        : new THREE.Color(0.5, 0.5, 0.7); // Lighter gray when hiding
      material.uniforms.uColor.value = color;
    }
    
    // Also update volumetric fog color
    if (volumetricFog.material.uniforms && volumetricFog.material.uniforms.uColor) {
      const volColor = fogMode === 'reveal'
        ? new THREE.Color(0.3, 0.5, 0.9)
        : new THREE.Color(0.6, 0.6, 0.8);
      volumetricFog.material.uniforms.uColor.value = volColor;
    }
  }, [fogMode, material, volumetricFog]);
  
  if (!fogEnabled) return null;
  
  return (
    <group ref={groupRef}>
      {/* Волюметрический туман (основа) */}
      <primitive object={volumetricFog} />
      
      {/* Облачные частицы */}
      <points ref={particlesRef} geometry={geometry} material={material} />
      
      {/* Дополнительные слои тумана для глубины */}
      <group position={[0, 0.5, 0]} scale={[0.8, 1, 0.8]}>
        <primitive object={volumetricFog.clone()} />
      </group>
      
      <group position={[0, 1.0, 0]} scale={[0.6, 1, 0.6]}>
        <primitive object={volumetricFog.clone()} />
      </group>
    </group>
  );
};