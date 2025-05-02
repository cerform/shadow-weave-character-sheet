
import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Типы для градиентных кубиков
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

// Градиенты для разных типов кубиков
const diceGradients = {
  'd4': 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
  'd6': 'linear-gradient(135deg, #4facfe, #00f2fe)',
  'd8': 'linear-gradient(135deg, #43e97b, #38f9d7)',
  'd10': 'linear-gradient(135deg, #fa709a, #fee140)',
  'd12': 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'd20': 'linear-gradient(135deg, #30cfd0, #330867)'
};

interface GradientDiceProps {
  diceType: DiceType;
  size?: number;
  rolling?: boolean;
  result?: number | null;
  showNumber?: boolean;
}

const GradientDice: React.FC<GradientDiceProps> = ({
  diceType,
  size = 80,
  rolling = false,
  result = null,
  showNumber = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  // Эффект для рендеринга кубика
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем холст
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем кубик с градиентом
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const diceSize = size * 0.8;
    
    // Создаем градиент в зависимости от типа кубика
    let gradient;
    
    // Определяем форму кубика в зависимости от типа
    switch (diceType) {
      case 'd4':
        // Рисуем тетраэдр
        drawTetrahedron(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      case 'd6':
        // Рисуем куб
        drawCube(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      case 'd8':
        // Рисуем октаэдр
        drawOctahedron(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      case 'd10':
        // Рисуем десятигранник
        drawDecahedron(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      case 'd12':
        // Рисуем додекаэдр
        drawDodecahedron(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      case 'd20':
        // Рисуем икосаэдр
        drawIcosahedron(ctx, centerX, centerY, diceSize, diceGradients[diceType]);
        break;
      default:
        // Обычный куб по умолчанию
        drawCube(ctx, centerX, centerY, diceSize, diceGradients.d6);
    }
    
    // Добавляем результат броска, если он есть и нужно показать число
    if (result !== null && showNumber) {
      ctx.font = `bold ${diceSize * 0.4}px Arial`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 5;
      ctx.fillText(result.toString(), centerX, centerY);
      ctx.shadowBlur = 0;
    }
    
    // Добавляем название кубика в углу
    ctx.font = `${diceSize * 0.2}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(diceType, canvas.width - 5, canvas.height - 5);
    
  }, [diceType, size, result, showNumber, rotation]);
  
  // Эффект для анимации вращения
  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360,
          z: Math.random() * 360,
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [rolling]);

  // Функции для рисования различных типов полиэдров
  const drawTetrahedron = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    const height = size * 0.866; // Высота равностороннего треугольника
    
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - height/2, x + size/2, y + height/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем треугольник
    ctx.beginPath();
    ctx.moveTo(x, y - height/2);
    ctx.lineTo(x - size/2, y + height/2);
    ctx.lineTo(x + size/2, y + height/2);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawCube = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем квадрат
    ctx.beginPath();
    ctx.roundRect(x - size/2, y - size/2, size, size, size * 0.1);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Добавляем эффект 3D
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Тень для объема
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  };
  
  const drawOctahedron = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем ромб (упрощенный октаэдр)
    ctx.beginPath();
    ctx.moveTo(x, y - size/2);
    ctx.lineTo(x + size/2, y);
    ctx.lineTo(x, y + size/2);
    ctx.lineTo(x - size/2, y);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawDecahedron = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем десятиугольник
    ctx.beginPath();
    const vertices = 10;
    const angleStep = (Math.PI * 2) / vertices;
    
    for (let i = 0; i < vertices; i++) {
      const angle = i * angleStep;
      const pointX = x + size/2 * Math.cos(angle);
      const pointY = y + size/2 * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawDodecahedron = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем пятиугольник (упрощенный додекаэдр)
    ctx.beginPath();
    const vertices = 5;
    const angleStep = (Math.PI * 2) / vertices;
    
    for (let i = 0; i < vertices; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const pointX = x + size/2 * Math.cos(angle);
      const pointY = y + size/2 * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Контур
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  const drawIcosahedron = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gradientStr: string) => {
    // Создаем градиент
    const gradient = ctx.createLinearGradient(x - size/2, y - size/2, x + size/2, y + size/2);
    const colors = gradientStr.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ');
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    // Рисуем треугольник с закругленными краями (упрощенный икосаэдр)
    ctx.beginPath();
    
    // Рисуем шестиугольник (более привлекательный визуально для d20)
    const vertices = 6;
    const angleStep = (Math.PI * 2) / vertices;
    
    for (let i = 0; i < vertices; i++) {
      const angle = i * angleStep;
      const pointX = x + size/2 * Math.cos(angle);
      const pointY = y + size/2 * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Контур со свечением
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Добавляем внутренний круг для эффекта глубины
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="gradient-dice"
      style={{ 
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
        transition: rolling ? 'none' : 'transform 0.5s ease-out'
      }}
    />
  );
};

export default GradientDice;
