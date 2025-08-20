// src/systems/fog/CloudTextureGenerator.ts
import * as THREE from 'three';

/**
 * Генерирует процедурную текстуру облака если изображение недоступно
 */
export function generateCloudTexture(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Градиентный фон от центра
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Добавляем шум для облачности
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    
    // Простой перлин-подобный шум
    const noise1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
    const noise2 = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5;
    const noise3 = Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.25;
    
    const totalNoise = (noise1 + noise2 + noise3) * 0.3 + 0.7;
    
    // Применяем шум к альфа-каналу
    data[i + 3] = Math.min(255, data[i + 3] * totalNoise);
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  
  return texture;
}