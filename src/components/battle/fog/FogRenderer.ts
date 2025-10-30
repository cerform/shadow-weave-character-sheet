import type { FogCanvasState, FogRenderConfig, LightSource, TokenPosition } from '@/types/fog';

interface FogCloud {
  x: number;
  y: number;
  radius: number;
  speed: number;
  offset: number;
  direction: number;
}

export class FogRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: FogRenderConfig;
  private animationTime: number = 0;
  private fogClouds: FogCloud[] = [];

  constructor(canvas: HTMLCanvasElement, config: FogRenderConfig) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.config = config;
    this.initializeFogClouds();
  }

  private initializeFogClouds() {
    // Создаем несколько слоев облаков тумана для реалистичной анимации
    for (let i = 0; i < 20; i++) {
      this.fogClouds.push({
        x: Math.random(),
        y: Math.random(),
        radius: 80 + Math.random() * 120,
        speed: 0.01 + Math.random() * 0.02,
        offset: Math.random() * Math.PI * 2,
        direction: Math.random() * Math.PI * 2
      });
    }
  }

  updateAnimation(deltaTime: number) {
    this.animationTime += deltaTime;
  }

  render(
    canvasState: FogCanvasState,
    revealedCells: { [key: string]: boolean },
    lightSources: LightSource[] = [],
    tokenPositions: TokenPosition[] = [],
    isDM: boolean = false,
    isDynamicLighting: boolean = false,
    selectedArea: { startX: number; startY: number; endX: number; endY: number } | null = null
  ) {
    this.clear();
    this.setupCanvas(canvasState);
    
    // Рисуем анимированный туман
    this.renderAnimatedFog(canvasState, isDynamicLighting);
    
    // Переключаем в режим вырезания для освещения
    this.ctx.globalCompositeOperation = 'destination-out';
    
    // Рисуем открытые области
    this.renderRevealedAreas(canvasState, revealedCells, isDynamicLighting);
    
    // Рисуем источники света
    this.renderLightSources(lightSources, canvasState);
    
    // Рисуем видимость токенов
    this.renderTokenVision(tokenPositions, canvasState, isDM);
    
    // Возвращаем обычный режим
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Рисуем выделенную область
    if (selectedArea) {
      this.renderSelectedArea(selectedArea);
    }
  }

  private clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private setupCanvas(canvasState: FogCanvasState) {
    this.canvas.width = canvasState.width;
    this.canvas.height = canvasState.height;
  }

  private renderAnimatedFog(canvasState: FogCanvasState, isDynamicLighting: boolean) {
    const { width, height } = canvasState;
    const baseOpacity = isDynamicLighting ? 0.85 : 0.7;
    
    // Базовый слой тумана
    this.ctx.fillStyle = `rgba(15, 15, 25, ${baseOpacity})`;
    this.ctx.fillRect(0, 0, width, height);
    
    // Анимированные облака тумана
    this.ctx.globalAlpha = 0.3;
    this.fogClouds.forEach((cloud) => {
      // Вычисляем позицию облака с учетом времени
      const animX = (cloud.x + Math.cos(this.animationTime * cloud.speed + cloud.offset) * 0.05) % 1;
      const animY = (cloud.y + Math.sin(this.animationTime * cloud.speed + cloud.offset) * 0.05) % 1;
      
      const x = animX * width;
      const y = animY * height;
      
      // Создаем радиальный градиент для облака
      const gradient = this.ctx.createRadialGradient(
        x, y, 0,
        x, y, cloud.radius
      );
      
      // Темно-серый туман с легким голубоватым оттенком
      gradient.addColorStop(0, 'rgba(80, 85, 95, 0.8)');
      gradient.addColorStop(0.4, 'rgba(60, 65, 75, 0.5)');
      gradient.addColorStop(0.7, 'rgba(40, 45, 55, 0.2)');
      gradient.addColorStop(1, 'rgba(20, 25, 35, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, cloud.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Добавляем второй слой с другой скоростью для глубины
    this.ctx.globalAlpha = 0.2;
    this.fogClouds.forEach((cloud, index) => {
      if (index % 2 === 0) return; // Используем только половину облаков
      
      const animX = (cloud.x - Math.sin(this.animationTime * cloud.speed * 0.7 + cloud.offset) * 0.07) % 1;
      const animY = (cloud.y + Math.cos(this.animationTime * cloud.speed * 0.7 + cloud.offset) * 0.07) % 1;
      
      const x = (animX < 0 ? 1 + animX : animX) * width;
      const y = (animY < 0 ? 1 + animY : animY) * height;
      
      const gradient = this.ctx.createRadialGradient(
        x, y, 0,
        x, y, cloud.radius * 1.2
      );
      
      gradient.addColorStop(0, 'rgba(70, 75, 85, 0.6)');
      gradient.addColorStop(0.5, 'rgba(50, 55, 65, 0.3)');
      gradient.addColorStop(1, 'rgba(30, 35, 45, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, cloud.radius * 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1.0;
  }

  private renderRevealedAreas(
    canvasState: FogCanvasState,
    revealedCells: { [key: string]: boolean },
    isDynamicLighting: boolean
  ) {
    const { gridRows, gridCols, cellWidth, cellHeight } = canvasState;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const key = `${row}-${col}`;
        if (revealedCells[key]) {
          this.renderRevealedCell(row, col, cellWidth, cellHeight, isDynamicLighting);
        }
      }
    }
  }

  private renderRevealedCell(
    row: number,
    col: number,
    cellWidth: number,
    cellHeight: number,
    isDynamicLighting: boolean
  ) {
    const x = col * cellWidth;
    const y = row * cellHeight;
    
    const gradient = this.ctx.createRadialGradient(
      x + cellWidth / 2, y + cellHeight / 2, 0,
      x + cellWidth / 2, y + cellHeight / 2, cellWidth * 0.8
    );
    
    const opacity = isDynamicLighting ? 0.6 : 0.9;
    
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.7})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      x - cellWidth / 2,
      y - cellHeight / 2,
      cellWidth * 2,
      cellHeight * 2
    );
  }

  private renderLightSources(lightSources: LightSource[], canvasState: FogCanvasState) {
    lightSources.forEach(light => {
      const radius = light.radius * Math.min(canvasState.cellWidth, canvasState.cellHeight);
      this.renderLightSource(light, radius);
    });
  }

  private renderLightSource(light: LightSource, radius: number) {
    // Добавляем легкое мерцание для факелов
    const flicker = light.type === 'torch' 
      ? 0.95 + Math.sin(this.animationTime * 8 + light.x + light.y) * 0.05
      : 1.0;
    
    const effectiveRadius = radius * flicker;
    
    const gradient = this.ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, effectiveRadius
    );
    
    const alphaMax = Math.min(0.95, light.intensity * flicker);
    
    switch (light.type) {
      case 'torch':
        gradient.addColorStop(0, `rgba(255, 200, 100, ${alphaMax})`);
        gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alphaMax * 0.7})`);
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        break;
      case 'lantern':
        gradient.addColorStop(0, `rgba(255, 230, 150, ${alphaMax})`);
        gradient.addColorStop(0.5, `rgba(255, 210, 120, ${alphaMax * 0.7})`);
        gradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
        break;
      case 'daylight':
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alphaMax})`);
        gradient.addColorStop(0.7, `rgba(240, 240, 255, ${alphaMax * 0.7})`);
        gradient.addColorStop(1, 'rgba(220, 220, 255, 0)');
        break;
      default:
        this.renderCustomLightSource(gradient, light, alphaMax);
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(light.x, light.y, effectiveRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderCustomLightSource(
    gradient: CanvasGradient,
    light: LightSource,
    alphaMax: number
  ) {
    const lightColor = light.color || 'rgba(255, 255, 255, 1)';
    const rgba = lightColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/);
    
    if (rgba) {
      const [, r, g, b] = rgba;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alphaMax})`);
      gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${alphaMax * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    } else {
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alphaMax})`);
      gradient.addColorStop(0.6, `rgba(255, 255, 255, ${alphaMax * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
  }

  private renderTokenVision(
    tokenPositions: TokenPosition[],
    canvasState: FogCanvasState,
    isDM: boolean
  ) {
    tokenPositions
      .filter(token => token.visible && (isDM || token.type === "player"))
      .forEach(token => {
        const visionRadius = isDM 
          ? canvasState.cellWidth * 5
          : canvasState.cellWidth * 3;
        
        this.renderTokenVisionCircle(token.x, token.y, visionRadius);
      });
  }

  private renderTokenVisionCircle(x: number, y: number, radius: number) {
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private renderSelectedArea(selectedArea: { startX: number; startY: number; endX: number; endY: number }) {
    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    this.ctx.fillRect(
      Math.min(selectedArea.startX, selectedArea.endX),
      Math.min(selectedArea.startY, selectedArea.endY),
      Math.abs(selectedArea.endX - selectedArea.startX),
      Math.abs(selectedArea.endY - selectedArea.startY)
    );
  }

  updateConfig(config: Partial<FogRenderConfig>) {
    this.config = { ...this.config, ...config };
  }
}
