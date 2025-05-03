
import React, { useEffect, useState } from 'react';

interface GradientDiceProps {
  diceType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  size?: number;
  rolling?: boolean;
  result?: number | null;
  showNumber?: boolean;
}

const GradientDice: React.FC<GradientDiceProps> = ({
  diceType,
  size = 120,
  rolling = false,
  result = null,
  showNumber = true,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  
  // Эффект для анимации кубика
  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360,
          z: Math.random() * 360
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setRotation({ x: 20, y: 45, z: 0 });
    }
  }, [rolling]);

  // Определяем форму кубика в зависимости от типа
  const getDiceShape = () => {
    switch (diceType) {
      case 'd4':
        return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'd6':
        return 'square';
      case 'd8':
        return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
      case 'd10':
        return 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)';
      case 'd12':
        return 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)';
      case 'd20':
        return 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)';
      default:
        return 'square';
    }
  };

  // Градиентная заливка для кубика
  const getGradient = () => {
    const colors = {
      'd4': 'linear-gradient(135deg, #ff6b6b, #cc2936)',
      'd6': 'linear-gradient(135deg, #4cc9f0, #4895ef)',
      'd8': 'linear-gradient(135deg, #8ac926, #4f772d)',
      'd10': 'linear-gradient(135deg, #9d4edd, #7209b7)',
      'd12': 'linear-gradient(135deg, #f9c74f, #f3722c)',
      'd20': 'linear-gradient(135deg, #480ca8, #b5179e)',
    };
    
    return colors[diceType] || colors.d20;
  };

  return (
    <div
      className="transition-all duration-300"
      style={{
        width: size,
        height: size,
        perspective: size * 2,
      }}
    >
      <div
        className="relative w-full h-full transform-style-preserve-3d transition-transform duration-300"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            clipPath: getDiceShape() === 'square' ? 'none' : getDiceShape(),
            background: getGradient(),
            borderRadius: getDiceShape() === 'square' ? '15%' : '0',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          {showNumber && result !== null && !rolling && (
            <span
              className="font-bold text-center text-white"
              style={{
                fontSize: size / 2.5,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {result}
            </span>
          )}
          
          {(result === null || !showNumber) && (
            <span
              className="font-bold text-center text-white"
              style={{
                fontSize: size / 5,
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {diceType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradientDice;
