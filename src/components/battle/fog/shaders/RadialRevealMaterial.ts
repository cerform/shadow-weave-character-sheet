// /src/components/battle/fog/shaders/RadialRevealMaterial.ts
import { ShaderMaterial, Color } from "three";

export function createRadialRevealMaterial(color: number | string = 0xffffff, softness = 0.5, intensity = 1.0) {
  const mat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new Color(color) },
      uSoftness: { value: softness }, // 0(hard) .. 1(soft edge)
      uIntensity: { value: intensity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 uColor;
      uniform float uSoftness;
      uniform float uIntensity;
      varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5; // center
        float d = length(c) * 2.0; // 0..~1
        // soft radial falloff — inner bright, soft to edge
        float alpha = smoothstep(1.0, 1.0 - uSoftness, 1.0 - d);
        alpha = clamp(alpha * uIntensity, 0.0, 1.0);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
  return mat;
}