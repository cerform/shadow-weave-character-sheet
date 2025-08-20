// src/systems/fog/shaders/fog.frag.glsl
precision highp float;

varying vec2 vUv;

uniform sampler2D uCloudTex;   // облачная текстура (RGBA)
uniform sampler2D uMaskTex;    // R8: 0=туман, 1=открыто (но в буфере 0/1)
uniform vec2      uMapPx;      // размер маски в пикселях (w,h)
uniform vec2      uTilePx;     // размер тайла в мировых пикселях по UV (для тайлинга облаков)
uniform float     uTime;       // время для анимации
uniform float     uOpacity;    // макс плотность тумана (0..1)

//
// лёгкий "шум" без текстур: 3-синусовой FBM
//
float n2(vec2 p){ return sin(p.x)*sin(p.y); }
float fbm(vec2 p){
  float f=0.0, a=0.5;
  for(int i=0;i<4;i++){
    f += a * n2(p);
    p = p*2.13 + vec2(19.7, 7.3);
    a *= 0.5;
  }
  return f*0.5 + 0.5; // 0..1
}

void main() {
  // Маска (в texel space): берём несколько сэмплов для "размытия краёв"
  // и вычисляем edgeFactor — чем ближе к границе, тем сильнее "протекание".
  vec2 texel = 1.0 / uMapPx;
  float m00 = texture2D(uMaskTex, vUv).r;         // 0..1 (0=tumor,1=open)
  float ml = texture2D(uMaskTex, vUv + vec2(-texel.x, 0.0)).r;
  float mr = texture2D(uMaskTex, vUv + vec2(+texel.x, 0.0)).r;
  float mt = texture2D(uMaskTex, vUv + vec2(0.0, -texel.y)).r;
  float mb = texture2D(uMaskTex, vUv + vec2(0.0, +texel.y)).r;

  // Граница там, где сосед отличается
  float edge = (abs(m00-ml)+abs(m00-mr)+abs(m00-mt)+abs(m00-mb)) * 0.5;
  edge = clamp(edge, 0.0, 1.0);

  // Базовый альфа тумана: 1 - mask
  float fogAlpha = 1.0 - m00;

  // Шум для "протекания": медленный сдвиг UV
  vec2 flow = vUv * uTilePx * 0.075 + vec2(uTime * 0.03, -uTime * 0.02);
  float noise = fbm(flow);

  // Мягкие края: плавно ослабляем альфу у границы с учётом шума
  float softEdge = smoothstep(0.1, 0.6, noise + (edge * 0.7));

  // Финальная альфа: туман * мягкий край * глобальная плотность
  float alpha = fogAlpha * softEdge * uOpacity;

  // Сэмплим облачную текстуру (тайлим слегка плотнее сетки)
  vec2 cloudUV = vUv * uTilePx * 0.9 + vec2(uTime * 0.01, 0.0);
  vec4 cloud = texture2D(uCloudTex, cloudUV);

  // Усиливаем альфу облака, но ограничиваем
  alpha *= clamp(cloud.a * 1.4, 0.0, 1.0);

  // Цвет облака слегка затемняем (можно подогнать под тему)
  vec3 col = mix(vec3(0.8), vec3(0.93), cloud.r);

  gl_FragColor = vec4(col, alpha);
}