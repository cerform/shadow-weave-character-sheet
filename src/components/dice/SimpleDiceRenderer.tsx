
import React from 'react';

interface SimpleDiceRendererProps {
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  result?: number;
  size?: number;
  themeColor?: string;
}

const SimpleDiceRenderer: React.FC<SimpleDiceRendererProps> = ({ 
  type, 
  result, 
  size = 100,
  themeColor = '#8b5cf6' 
}) => {
  // Отображаем простую геометрическую фигуру в соответствии с типом кубика
  const renderDiceShape = () => {
    const style: React.CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: `${themeColor}33`, // Полупрозрачный цвет темы
      border: `2px solid ${themeColor}`,
      color: themeColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size / 3}px`,
      position: 'relative',
      transition: 'transform 0.3s ease',
      boxShadow: `0 0 10px ${themeColor}80`,
      fontWeight: 'bold',
    };

    const resultStyle: React.CSSProperties = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size / 3}px`,
      fontWeight: 'bold',
      color: 'white',
      textShadow: '0 1px 3px rgba(0,0,0,0.6)',
    };

    // Выбираем форму в зависимости от типа кубика
    switch (type) {
      case 'd4':
        return (
          <div 
            style={{ 
              ...style, 
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              transform: 'translateY(-10%)',
            }} 
            className="dice-preview"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      case 'd6':
        return (
          <div 
            style={{ 
              ...style,
              borderRadius: '4px',
            }} 
            className="dice-preview"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      case 'd8':
        return (
          <div 
            style={{ 
              ...style,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }} 
            className="dice-preview"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      case 'd10':
        return (
          <div 
            style={{ 
              ...style,
              clipPath: 'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)',
            }} 
            className="dice-preview"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      case 'd12':
        return (
          <div 
            style={{ 
              ...style,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            }} 
            className="dice-preview"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      case 'd20':
        return (
          <div 
            style={{ 
              ...style,
              clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
            }} 
            className="dice-preview rotate-dice"
          >
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
      default:
        return (
          <div style={style} className="dice-preview">
            {result && <span style={resultStyle}>{result}</span>}
            <span>{type}</span>
          </div>
        );
    }
  };

  return (
    <div className="dice-container" style={{ width: `${size}px`, height: `${size}px` }}>
      {renderDiceShape()}
    </div>
  );
};

export default SimpleDiceRenderer;
