// Fog of War fragment shader with BG3-style effects
uniform sampler2D fogTexture;
uniform float time;
uniform float edgeSoftness;
uniform vec3 fogColor;
uniform float fogOpacity;

varying vec2 vUv;

// Simplex noise function (simplified FBM)
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for(int i = 0; i < 4; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

void main() {
  // Sample fog texture (0 = hidden, 1 = revealed)
  float fogValue = texture2D(fogTexture, vUv).r;
  
  // Add animated noise for "living" fog effect
  vec2 noiseCoord = vUv * 5.0 + vec2(time * 0.05, time * 0.03);
  float noiseValue = fbm(noiseCoord) * 0.3;
  
  // Smooth edge transition
  float alpha = smoothstep(edgeSoftness, 1.0 - edgeSoftness, fogValue + noiseValue);
  alpha = 1.0 - alpha; // Invert (fog is opaque where value is low)
  
  // Apply fog color with opacity
  vec3 finalColor = fogColor;
  float finalAlpha = alpha * fogOpacity;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
