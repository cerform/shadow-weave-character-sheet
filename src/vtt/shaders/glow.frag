// src/vtt/shaders/glow.frag
// Enhanced glow shader for special effects (auras, highlights)

uniform vec3 glowColor;
uniform float glowIntensity;
uniform float glowRadius;
uniform vec2 glowCenter;
uniform float time;

varying vec2 vUv;

void main() {
  // Distance from glow center
  float dist = distance(vUv, glowCenter);
  
  // Animated pulsing effect (BG3 style)
  float pulse = sin(time * 2.0) * 0.5 + 0.5;
  float adjustedRadius = glowRadius * (1.0 + pulse * 0.1);
  
  // Smooth falloff
  float glow = 1.0 - smoothstep(0.0, adjustedRadius, dist);
  glow = pow(glow, 2.0); // Sharper falloff
  
  // Apply intensity
  float alpha = glow * glowIntensity;
  
  // Output with glow color
  gl_FragColor = vec4(glowColor, alpha);
}
