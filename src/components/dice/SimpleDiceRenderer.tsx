
import React from 'react';

interface SimpleDiceRendererProps {
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  size?: number;
  themeColor?: string;
  result?: number;
}

const SimpleDiceRenderer: React.FC<SimpleDiceRendererProps> = ({
  type,
  size = 100,
  themeColor = '#9b87f5',
  result
}) => {
  // Определение формы кубика в зависимости от типа
  const getDiceShape = () => {
    switch (type) {
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

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          clipPath: getDiceShape() === 'square' ? 'none' : getDiceShape(),
          backgroundColor: themeColor,
          borderRadius: getDiceShape() === 'square' ? '15%' : '0',
          boxShadow: `0 0 20px ${themeColor}80`
        }}
      >
        {result !== undefined && (
          <span 
            className="font-bold text-center" 
            style={{ 
              fontSize: size / 3, 
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {result}
          </span>
        )}
      </div>
    </div>
  );
};

export default SimpleDiceRenderer;
