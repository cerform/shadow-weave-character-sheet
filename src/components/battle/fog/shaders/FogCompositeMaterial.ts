// /src/components/battle/fog/shaders/FogCompositeMaterial.ts
import { ShaderMaterial, Color, Vector2 } from "three";

export function createFogCompositeMaterial() {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMask: { value: null },               // sampler2D
      uFogColor: { value: new Color(0x0b0e14) },
      uTime: { value: 0 },
      uDensity: { value: 0.9 },             // base opacity in hidden areas
      uNoiseScale: { value: 2.0 },          // UV tiling for moving noise
      uResolution: { value: new Vector2(1024, 1024) },
      uMapSize: { value: new Vector2(100, 100) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv; // assumes plane UV maps to [0,1] across map extents
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform sampler2D uMask;   // white = revealed, black = fog
      uniform vec3 uFogColor;
      uniform float uTime;
      uniform float uDensity;
      uniform float uNoiseScale;
      uniform vec2 uResolution;  // mask tex resolution
      uniform vec2 uMapSize;     // world size mapped to UV 0..1
      varying vec2 vUv;

      // Simple hash noise
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }

      vec3 rgb(vec3 c){ return pow(c, vec3(1.0/2.2)); }

      void main(){
        // Read reveal mask and clamp
        float mask = clamp(texture2D(uMask, vUv).r, 0.0, 1.0);

        // Fog alpha is higher where mask is 0 (not revealed)
        float baseAlpha = (1.0 - mask) * uDensity;

        // Animate fog with low‑frequency noise (gives 3D swirling feel when camera moves)
        float n = noise(vUv * uNoiseScale + vec2(0.0, uTime * 0.03));
        float n2 = noise(vUv * (uNoiseScale*0.5) - vec2(uTime * 0.015, 0.0));
        float fogNoise = mix(n, n2, 0.5);
        baseAlpha *= mix(0.85, 1.05, fogNoise);

        // Edge glow: approximate gradient magnitude by sampling the mask
        vec2 px = 1.0 / uResolution;
        float mC = mask;
        float mR = texture2D(uMask, vUv + vec2(px.x, 0.0)).r;
        float mL = texture2D(uMask, vUv - vec2(px.x, 0.0)).r;
        float mT = texture2D(uMask, vUv + vec2(0.0, px.y)).r;
        float mB = texture2D(uMask, vUv - vec2(0.0, px.y)).r;
        float grad = clamp(length(vec2(mR - mL, mT - mB)) * 2.0, 0.0, 1.0);

        // Glow pulses slightly over time
        float glow = smoothstep(0.02, 0.25, grad) * (0.6 + 0.4 * sin(uTime * 1.7));

        // Compose color: fog color + brighter rim near revealed borders
        vec3 col = uFogColor + vec3(0.25, 0.28, 0.32) * glow;
        float alpha = clamp(baseAlpha, 0.0, 1.0);

        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  return material;
}