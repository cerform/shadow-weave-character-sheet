// src/vtt/shaders/token.frag
// Fragment shader for token rendering with BG3-style glow

uniform vec3 tokenColor;
uniform float glowIntensity;
uniform float isSelected;
uniform float opacity;
uniform sampler2D tokenTexture;
uniform bool hasTexture;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  
  // Discard pixels outside circle (make token round)
  if (dist > 0.5) {
    discard;
  }
  
  // Base color from texture or solid color
  vec4 baseColor;
  if (hasTexture) {
    baseColor = texture2D(tokenTexture, vUv);
  } else {
    baseColor = vec4(tokenColor, 1.0);
  }
  
  // BG3-style glow effect for selected tokens
  vec3 finalColor = baseColor.rgb;
  float alpha = baseColor.a * opacity;
  
  if (isSelected > 0.5) {
    // Glow ring at the edges (BG3 signature effect)
    float edgeDist = abs(dist - 0.45); // Distance from edge
    float glow = 1.0 - smoothstep(0.0, 0.1, edgeDist);
    
    // Pulsing glow color (golden/yellow for selection)
    vec3 glowColor = vec3(1.0, 0.85, 0.2);
    
    // Add glow to final color
    finalColor += glowColor * glow * glowIntensity;
    
    // Outer rim highlight
    float rim = smoothstep(0.35, 0.5, dist);
    finalColor += glowColor * rim * 0.3 * glowIntensity;
  }
  
  // Soft edge falloff for smooth appearance
  float edgeSoftness = smoothstep(0.5, 0.48, dist);
  alpha *= edgeSoftness;
  
  gl_FragColor = vec4(finalColor, alpha);
}
