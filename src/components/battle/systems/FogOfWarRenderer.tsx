import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  WebGLRenderTarget, 
  RGBAFormat, 
  Scene, 
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Vector3
} from 'three';
import { useFogOfWar } from '@/hooks/combat/useFogOfWar';

interface FogOfWarRendererProps {
  sessionId: string;
  isDM: boolean;
}

const fowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fowFragmentShader = `
  uniform sampler2D exploredTexture;
  uniform sampler2D visibleTexture;
  uniform vec3 playerPosition;
  uniform float viewRadius;
  uniform bool isDM;
  varying vec2 vUv;

  void main() {
    vec4 explored = texture2D(exploredTexture, vUv);
    vec4 visible = texture2D(visibleTexture, vUv);
    
    if (isDM) {
      // DM sees everything with slight overlay for unexplored areas
      gl_FragColor = vec4(1.0, 1.0, 1.0, explored.r < 0.5 ? 0.3 : 0.0);
    } else {
      // Players see only explored + currently visible
      float alpha = 1.0 - max(explored.r, visible.r);
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  }
`;

export function FogOfWarRenderer({ sessionId, isDM }: FogOfWarRendererProps) {
  const meshRef = useRef<Mesh>();
  const materialRef = useRef<ShaderMaterial>();
  const exploredRTRef = useRef<WebGLRenderTarget>();
  const visibleRTRef = useRef<WebGLRenderTarget>();
  
  const {
    fowState,
    updatePlayerVision,
    revealArea,
    hideArea
  } = useFogOfWar(sessionId);

  useEffect(() => {
    // Initialize render targets
    const size = 512;
    exploredRTRef.current = new WebGLRenderTarget(size, size, {
      format: RGBAFormat
    });
    visibleRTRef.current = new WebGLRenderTarget(size, size, {
      format: RGBAFormat
    });

    return () => {
      exploredRTRef.current?.dispose();
      visibleRTRef.current?.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current || !exploredRTRef.current || !visibleRTRef.current) return;

    // Update uniforms
    materialRef.current.uniforms.exploredTexture.value = exploredRTRef.current.texture;
    materialRef.current.uniforms.visibleTexture.value = visibleRTRef.current.texture;
    materialRef.current.uniforms.isDM.value = isDM;
    
    // Update visible areas based on entity positions
    // This would be called from the combat system when entities move
  });

  return (
    <mesh ref={meshRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={fowVertexShader}
        fragmentShader={fowFragmentShader}
        uniforms={{
          exploredTexture: { value: null },
          visibleTexture: { value: null },
          playerPosition: { value: new Vector3() },
          viewRadius: { value: 12 }, // 60 feet in 5-foot squares
          isDM: { value: isDM }
        }}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}