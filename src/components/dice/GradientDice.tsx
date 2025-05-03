
import React, { useRef, useEffect, useState } from 'react';

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
  showNumber = true
}) => {
  const diceRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [rollState, setRollState] = useState<'idle' | 'rolling' | 'stopped'>('idle');

  // Получаем количество граней для типа кубика
  const getFacesCount = () => {
    switch (diceType) {
      case 'd4': return 4;
      case 'd6': return 6;
      case 'd8': return 8;
      case 'd10': return 10;
      case 'd12': return 12;
      case 'd20': return 20;
      default: return 6;
    }
  };

  // Генерируем случайный поворот для анимации броска
  const getRandomRotation = () => ({
    x: Math.random() * 360,
    y: Math.random() * 360,
    z: Math.random() * 360
  });

  // Запускаем бросок кубика
  useEffect(() => {
    if (rolling) {
      setRollState('rolling');
      
      // Анимируем вращение
      const rollInterval = setInterval(() => {
        setRotation(getRandomRotation());
      }, 50);

      // Останавливаем анимацию через некоторое время
      setTimeout(() => {
        clearInterval(rollInterval);
        setRollState('stopped');
      }, 800);
    }
  }, [rolling]);

  // CSS классы для стилей кубика
  const getDiceClasses = () => {
    let classes = 'dice-3d';
    if (rollState === 'rolling') classes += ' rolling';
    return classes;
  };

  // Полупрозрачный градиент для кубиков
  const gradientStyle = {
    background: 'linear-gradient(135deg, rgba(155, 135, 245, 0.9), rgba(217, 70, 239, 0.9))',
    boxShadow: '0 0 15px rgba(155, 135, 245, 0.6)',
    WebkitBackfaceVisibility: 'visible' as const,
    backfaceVisibility: 'visible' as const,
  };

  return (
    <div 
      className="dice-wrapper" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        perspective: '1000px',
        position: 'relative',
        margin: '0 auto'
      }}
    >
      <div
        ref={diceRef}
        className={getDiceClasses()}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: rollState === 'rolling' ? 'none' : 'transform 0.5s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="dice-model">
          <img 
            src={`/assets/dice-models/${diceType}.png`} 
            alt={`${diceType} dice`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {result !== null && showNumber && !rolling && (
          <div className="dice-result" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: `${size / 3}px`,
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0,0,0,0.5)',
            zIndex: 5
          }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default GradientDice;
